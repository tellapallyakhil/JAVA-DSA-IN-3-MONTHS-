import { NextResponse } from 'next/server';
import crypto from 'crypto';

/** 
 * THE MICROWAVE (Cache) 
 * In a real-life "Enterprise" app, we'd use Upstash Redis here.
 * For now, we use a specialized Map (The Chef's Memory).
 */
const chefMicrowave = new Map<string, { result: any, timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour of memory

/**
 * ENGINE 1: The Fancy Render Judge (Primary)
 * Status: Potentially Sleeping
 */
async function executeWithJudgeService(code: string, stdin: string) {
    const JUDGE_SERVICE_URL = process.env.JUDGE_SERVICE_URL || 'http://localhost:8000';
    const startTime = Date.now();

    const response = await fetch(`${JUDGE_SERVICE_URL}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, stdin }),
        signal: AbortSignal.timeout(15000) // Don't wait forever for a sleeping chef
    });

    if (!response.ok) throw new Error(`Judge Service failed: ${response.status}`);
    const data = await response.json();
    return { ...data, runtime: data.runtime || (Date.now() - startTime) };
}

/**
 * ENGINE 2: Piston API (The Reliable Street Vendor)
 * Status: Always Awake, occasionally grumpy (throttled)
 */
async function executeWithPiston(code: string, stdin: string) {
    const startTime = Date.now();
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            language: 'java',
            version: '15.0.2',
            files: [{ name: 'Main.java', content: code }],
            stdin: stdin || '',
            run_timeout: 10000,
        }),
    });

    if (!response.ok) throw new Error(`Piston failed: ${response.status}`);
    const data = await response.json();
    const elapsed = Date.now() - startTime;

    // Mapping Piston's weird format to our clean format
    const isCompileError = (data.compile?.code ?? 0) !== 0 || !!data.compile?.stderr;

    return {
        success: !isCompileError,
        output: data.run?.stdout || '',
        error: data.compile?.stderr || data.run?.stderr || '',
        type: isCompileError ? 'Compilation Error' : (data.run?.signal === 'SIGKILL' ? 'Time Limit Exceeded' : 'Success'),
        runtime: elapsed,
    };
}

/**
 * THE LOAD BALANCER LIST
 * Add more engines here as your empire grows!
 */
const ENGINES = [
    { name: 'Primary Judge (Render)', fn: executeWithJudgeService },
    { name: 'Fallback (Piston)', fn: executeWithPiston },
];

export async function POST(req: Request) {
    try {
        const { code, stdin } = await req.json();
        
        // 1. GENERATE THE "ORDER TICKET" (Cache Key)
        const cacheKey = crypto
            .createHash('sha256')
            .update(`${code}_${stdin || ''}`)
            .digest('hex');

        // 2. CHECK THE MICROWAVE (Cache)
        const cached = chefMicrowave.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            console.log("🚀 CACHE HIT: Serving hot code from the microwave!");
            return NextResponse.json({ ...cached.result, isCached: true });
        }

        // 3. LOAD BALANCER: Find an engine that actually works
        let lastError = null;
        for (const engine of ENGINES) {
            try {
                console.log(`📡 Attempting execution with: ${engine.name}`);
                const result = await engine.fn(code, stdin);
                
                // 4. SAVE TO MICROWAVE (If it was a successful execution)
                if (result.success && result.type === 'Success') {
                    chefMicrowave.set(cacheKey, { result, timestamp: Date.now() });
                }
                
                return NextResponse.json(result);
            } catch (err: any) {
                console.warn(`${engine.name} failed:`, err.message);
                lastError = err.message;
            }
        }

        return NextResponse.json(
            { success: false, error: `All engines failed. Last error: ${lastError}`, type: 'System Error' },
            { status: 503 }
        );

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message, type: 'System Error' },
            { status: 500 }
        );
    }
}

