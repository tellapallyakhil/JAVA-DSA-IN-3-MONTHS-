import { NextResponse } from 'next/server';

// Primary Engine: Piston API (free, full JDK, no API key)
async function executeWithPiston(code: string, stdin: string) {
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            language: 'java',
            version: '15.0.2',
            files: [{ name: 'Main.java', content: code }],
            stdin: stdin || '',
            compile_timeout: 15000,
            run_timeout: 10000,
            compile_memory_limit: -1,
            run_memory_limit: -1,
        }),
    });

    if (!response.ok) {
        throw new Error(`Piston API responded with ${response.status}`);
    }

    const data = await response.json();

    // Piston returns { run: { stdout, stderr, code, signal, output }, compile: { ... } }
    const compileError = data.compile?.stderr || '';
    const runStdout = data.run?.stdout || '';
    const runStderr = data.run?.stderr || '';
    const exitCode = data.run?.code ?? 0;

    // Check for compile errors first
    if (compileError) {
        return {
            success: false,
            error: compileError,
            type: 'Compilation Error',
        };
    }

    // Check for runtime errors
    if (exitCode !== 0 && runStderr) {
        return {
            success: true,
            output: runStdout || '',
            error: runStderr,
            type: 'Runtime Error',
            runtime: 0,
        };
    }

    return {
        success: true,
        output: runStdout + (runStderr ? `\n${runStderr}` : ''),
        error: '',
        type: 'Success',
        runtime: 0,
    };
}

// Fallback Engine: Self-hosted Judge Service
async function executeWithJudgeService(code: string, stdin: string) {
    const JUDGE_SERVICE_URL = process.env.JUDGE_SERVICE_URL || 'http://localhost:8000';

    const response = await fetch(`${JUDGE_SERVICE_URL}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, stdin }),
    });

    if (!response.ok) {
        throw new Error(`Judge Service responded with ${response.status}`);
    }

    return await response.json();
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

        // Try Piston API first (supports ALL standard Java packages)
        try {
            const result = await executeWithPiston(code, stdin);
            return NextResponse.json(result);
        } catch (pistonError: any) {
            console.warn('Piston API failed, falling back to Judge Service:', pistonError.message);
        }

        // Fallback to self-hosted Judge Service
        try {
            const result = await executeWithJudgeService(code, stdin);
            return NextResponse.json(result);
        } catch (judgeError: any) {
            console.error('Judge Service also failed:', judgeError.message);
        }

        // Both engines failed
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
