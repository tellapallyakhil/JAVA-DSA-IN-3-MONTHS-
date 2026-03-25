import { NextResponse } from 'next/server';

// Primary Engine: Self-hosted Judge Service on Render (full JDK, reliable)
async function executeWithJudgeService(code: string, stdin: string) {
    const JUDGE_SERVICE_URL = process.env.JUDGE_SERVICE_URL || 'http://localhost:8000';
    const startTime = Date.now();

    const response = await fetch(`${JUDGE_SERVICE_URL}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, stdin }),
    });

    const elapsed = Date.now() - startTime;

    if (!response.ok) {
        throw new Error(`Judge Service responded with ${response.status}`);
    }

    const data = await response.json();

    // If the Judge Service already returns formatted data, use it
    if (data.runtime === undefined || data.runtime === null) {
        data.runtime = elapsed;
    }

    return data;
}

// Fallback Engine: Piston API
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
            compile_timeout: 30000,
            run_timeout: 30000,
            compile_memory_limit: -1,
            run_memory_limit: -1,
        }),
    });

    const elapsed = Date.now() - startTime;

    if (!response.ok) {
        throw new Error(`Piston API responded with ${response.status}`);
    }

    const data = await response.json();

    if (data.message) {
        throw new Error(data.message);
    }

    const compileStderr = data.compile?.stderr || '';
    const compileCode = data.compile?.code ?? 0;
    const runStdout = data.run?.stdout || '';
    const runStderr = data.run?.stderr || '';
    const exitCode = data.run?.code ?? 0;
    const runSignal = data.run?.signal || null;

    if (compileCode !== 0 || compileStderr) {
        return {
            success: false,
            error: compileStderr || 'Compilation failed.',
            type: 'Compilation Error',
            runtime: elapsed,
        };
    }

    if (runSignal === 'SIGKILL') {
        return {
            success: false,
            output: runStdout || '',
            error: 'Time Limit Exceeded (TLE). Try optimizing your algorithm.',
            type: 'Time Limit Exceeded',
            runtime: elapsed,
        };
    }

    if (exitCode !== 0) {
        return {
            success: true,
            output: runStdout || '',
            error: runStderr || 'Runtime error occurred.',
            type: 'Runtime Error',
            runtime: elapsed,
        };
    }

    return {
        success: true,
        output: runStdout,
        error: '',
        type: 'Success',
        runtime: elapsed,
    };
}

export async function POST(req: Request) {
    try {
        const { code, stdin } = await req.json();

        if (!code || !code.trim()) {
            return NextResponse.json(
                { success: false, error: 'No code provided.', type: 'Input Error' },
                { status: 400 }
            );
        }

        // Try Render Judge Service first (primary, reliable)
        try {
            const result = await executeWithJudgeService(code, stdin);
            return NextResponse.json(result);
        } catch (judgeError: any) {
            console.warn('Judge Service failed, falling back to Piston:', judgeError.message);
        }

        // Fallback to Piston API
        try {
            const result = await executeWithPiston(code, stdin);
            return NextResponse.json(result);
        } catch (pistonError: any) {
            console.error('Piston API also failed:', pistonError.message);
        }

        return NextResponse.json(
            {
                success: false,
                error: 'All execution engines are currently unavailable. Please try again in a few seconds.',
                type: 'System Error',
            },
            { status: 503 }
        );

    } catch (error: any) {
        console.error('Execute Route Error:', error);
        return NextResponse.json(
            { success: false, error: `Server error: ${error.message}`, type: 'System Error' },
            { status: 500 }
        );
    }
}

