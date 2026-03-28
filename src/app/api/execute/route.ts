import { NextResponse } from 'next/server';
import * as crypto from 'crypto';

// ============================================================================
// TYPES
// ============================================================================
interface ExecutionResult {
    success: boolean;
    output: string;
    error: string;
    type: string;
    runtime: number;
    engine?: string;
    isCached?: boolean;
}

interface EngineHealth {
    failures: number;
    lastFailure: number;
    cooldownUntil: number;
}

// ============================================================================
// CACHE — LRU-style in-memory cache with size limits
// ============================================================================
const MAX_CACHE_SIZE = 200;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

const cache = new Map<string, { result: ExecutionResult; timestamp: number }>();

function getCached(key: string): ExecutionResult | null {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL) {
        cache.delete(key);
        return null;
    }
    // Move to end (LRU refresh)
    cache.delete(key);
    cache.set(key, entry);
    return entry.result;
}

function setCache(key: string, result: ExecutionResult) {
    // Evict oldest if full
    if (cache.size >= MAX_CACHE_SIZE) {
        const oldest = cache.keys().next().value;
        if (oldest) cache.delete(oldest);
    }
    cache.set(key, { result, timestamp: Date.now() });
}

// ============================================================================
// CIRCUIT BREAKER — Track engine health, skip broken engines temporarily
// ============================================================================
const engineHealth = new Map<string, EngineHealth>();
const MAX_FAILURES = 3;
const COOLDOWN_MS = 1000 * 60 * 5; // 5 min cooldown after failures

function isEngineHealthy(name: string): boolean {
    const health = engineHealth.get(name);
    if (!health) return true;
    if (Date.now() > health.cooldownUntil) {
        // Cooldown expired, reset and let it try again
        engineHealth.delete(name);
        return true;
    }
    return health.failures < MAX_FAILURES;
}

function recordFailure(name: string) {
    const health = engineHealth.get(name) || { failures: 0, lastFailure: 0, cooldownUntil: 0 };
    health.failures += 1;
    health.lastFailure = Date.now();
    if (health.failures >= MAX_FAILURES) {
        health.cooldownUntil = Date.now() + COOLDOWN_MS;
    }
    engineHealth.set(name, health);
}

function recordSuccess(name: string) {
    engineHealth.delete(name);
}

// ============================================================================
// ENGINE 1: Self-hosted Judge Service (Render)
// ============================================================================
async function executeWithJudgeService(code: string, stdin: string): Promise<ExecutionResult> {
    const url = process.env.JUDGE_SERVICE_URL || 'http://localhost:8000';
    const startTime = Date.now();

    const response = await fetch(`${url}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, stdin }),
        signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    return {
        success: data.success ?? true,
        output: data.output || '',
        error: data.error || '',
        type: data.type || 'Success',
        runtime: data.runtime || (Date.now() - startTime),
        engine: 'Judge (Render)',
    };
}

// ============================================================================
// ENGINE 2: Piston API (Public, free, always-on)
// ============================================================================
async function executeWithPiston(code: string, stdin: string): Promise<ExecutionResult> {
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
        signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const elapsed = Date.now() - startTime;

    const isCompileError = (data.compile?.code ?? 0) !== 0 || !!data.compile?.stderr;

    return {
        success: !isCompileError && data.run?.code === 0,
        output: data.run?.stdout || '',
        error: data.compile?.stderr || data.run?.stderr || '',
        type: isCompileError
            ? 'Compilation Error'
            : data.run?.signal === 'SIGKILL'
                ? 'Time Limit Exceeded'
                : data.run?.code !== 0
                    ? 'Runtime Error'
                    : 'Success',
        runtime: elapsed,
        engine: 'Piston',
    };
}

// ============================================================================
// ENGINE 3: Wandbox API (Free, reliable, multi-language)
// ============================================================================
async function executeWithWandbox(code: string, stdin: string): Promise<ExecutionResult> {
    const startTime = Date.now();

    const response = await fetch('https://wandbox.org/api/compile.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            code,
            compiler: 'openjdk-head',
            stdin: stdin || '',
            'compiler-option-raw': '',
            'runtime-option-raw': '',
        }),
        signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const elapsed = Date.now() - startTime;

    const hasCompileError = !!data.compiler_error;
    const hasRuntimeError = !!data.program_error;
    const output = data.program_output || '';

    return {
        success: !hasCompileError && !hasRuntimeError && data.status === '0',
        output,
        error: data.compiler_error || data.program_error || '',
        type: hasCompileError
            ? 'Compilation Error'
            : hasRuntimeError
                ? 'Runtime Error'
                : data.status !== '0'
                    ? 'Runtime Error'
                    : 'Success',
        runtime: elapsed,
        engine: 'Wandbox',
    };
}

// ============================================================================
// LOAD BALANCER — Engines listed in priority order
// ============================================================================
const ENGINES = [
    { name: 'Judge (Render)', fn: executeWithJudgeService },
    { name: 'Piston', fn: executeWithPiston },
    { name: 'Wandbox', fn: executeWithWandbox },
];

// ============================================================================
// RATE LIMITING — Simple per-IP in-memory limiter
// ============================================================================
const rateLimiter = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 20; // 20 executions per minute

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimiter.get(ip);

    if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
        rateLimiter.set(ip, { count: 1, windowStart: now });
        return true;
    }

    if (entry.count >= RATE_LIMIT_MAX) return false;

    entry.count++;
    return true;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================
export async function POST(req: Request) {
    try {
        // Rate limit check
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { success: false, error: 'Rate limit exceeded. Please wait a moment before trying again.', type: 'Rate Limited' },
                { status: 429 }
            );
        }

        const { code, stdin } = await req.json();

        if (!code || typeof code !== 'string') {
            return NextResponse.json(
                { success: false, error: 'No code provided.', type: 'Validation Error' },
                { status: 400 }
            );
        }

        // Code size limit (50KB)
        if (code.length > 50000) {
            return NextResponse.json(
                { success: false, error: 'Code exceeds maximum size (50KB).', type: 'Validation Error' },
                { status: 400 }
            );
        }

        // 1. GENERATE CACHE KEY
        const cacheKey = crypto
            .createHash('sha256')
            .update(`${code}_${stdin || ''}`)
            .digest('hex');

        // 2. CHECK CACHE
        const cached = getCached(cacheKey);
        if (cached) {
            return NextResponse.json({ ...cached, isCached: true });
        }

        // 3. LOAD BALANCER — Try engines in order, skip unhealthy ones
        let lastError = '';
        let enginesAttempted = 0;

        for (const engine of ENGINES) {
            if (!isEngineHealthy(engine.name)) {
                console.log(`⏭️  Skipping ${engine.name} (circuit breaker open)`);
                continue;
            }

            enginesAttempted++;
            try {
                console.log(`📡 Attempting: ${engine.name}`);
                const result = await engine.fn(code, stdin || '');

                // Record success in circuit breaker
                recordSuccess(engine.name);

                // Cache successful results
                if (result.success && result.type === 'Success') {
                    setCache(cacheKey, result);
                }

                return NextResponse.json(result);
            } catch (err: any) {
                console.warn(`❌ ${engine.name} failed:`, err.message);
                recordFailure(engine.name);
                lastError = `${engine.name}: ${err.message}`;
            }
        }

        // All engines failed
        const statusMsg = enginesAttempted === 0
            ? 'All engines are temporarily unavailable. Please try again in a few minutes.'
            : `All ${enginesAttempted} engines failed. Last error: ${lastError}`;

        return NextResponse.json(
            { success: false, error: statusMsg, type: 'System Error' },
            { status: 503 }
        );

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Unknown error', type: 'System Error' },
            { status: 500 }
        );
    }
}
