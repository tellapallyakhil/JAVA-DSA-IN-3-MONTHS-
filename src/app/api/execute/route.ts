import { NextResponse } from 'next/server';

// Primary Engine: Piston API (free, full JDK 15, no API key)
// Supports ALL standard Java packages for DSA:
// java.util.* (Collections, Lists, Maps, Sets, PriorityQueue, Deque, Stack)
// java.util.stream.* (Streams API)
// java.util.concurrent.* (Threading)
// java.io.* / java.nio.* (I/O)
// java.math.* (BigInteger, BigDecimal)
// java.text.* / java.time.* (Formatting)
// Also supports multiple classes, inner classes, generics, lambdas, etc.
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
            compile_timeout: 30000,  // 30s for complex DSA compilation
            run_timeout: 30000,      // 30s for heavy DP/Graph/Backtracking
            compile_memory_limit: -1,
            run_memory_limit: -1,
        }),
    });

    const elapsed = Date.now() - startTime;

    if (!response.ok) {
        throw new Error(`Piston API responded with ${response.status}`);
    }

    const data = await response.json();

    // Handle Piston error messages (e.g. language not found)
    if (data.message) {
        throw new Error(data.message);
    }

    const compileStdout = data.compile?.stdout || '';
    const compileStderr = data.compile?.stderr || '';
    const compileCode = data.compile?.code ?? 0;
    const runStdout = data.run?.stdout || '';
    const runStderr = data.run?.stderr || '';
    const exitCode = data.run?.code ?? 0;
    const runSignal = data.run?.signal || null;

    // Check for compile errors
    if (compileCode !== 0 || compileStderr) {
        return {
            success: false,
            error: compileStderr || compileStdout || 'Compilation failed.',
            type: 'Compilation Error',
            runtime: elapsed,
        };
    }

    // Check for timeout / killed signals
    if (runSignal === 'SIGKILL') {
        return {
            success: false,
            output: runStdout || '',
            error: 'Time Limit Exceeded (TLE). Your solution took too long to execute. Try optimizing your algorithm.',
            type: 'Time Limit Exceeded',
            runtime: elapsed,
        };
    }

    // Check for runtime errors
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
        output: runStdout + (runStderr ? `\n--- Warnings ---\n${runStderr}` : ''),
        error: '',
        type: 'Success',
        runtime: elapsed,
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
