import { NextResponse } from 'next/server';

/**
 * GET /api/execute/status
 * Returns the current status of all execution engines.
 * Useful for monitoring and debugging.
 */
export async function GET() {
    const JUDGE_SERVICE_URL = process.env.JUDGE_SERVICE_URL || 'http://localhost:8000';

    const engines = [
        { name: 'Judge (Render)', url: `${JUDGE_SERVICE_URL}/health` },
        { name: 'Piston', url: 'https://emkc.org/api/v2/piston/runtimes' },
        { name: 'Wandbox', url: 'https://wandbox.org/api/list.json' },
    ];

    const results = await Promise.allSettled(
        engines.map(async (engine) => {
            const start = Date.now();
            try {
                const res = await fetch(engine.url, {
                    signal: AbortSignal.timeout(5000),
                });
                return {
                    name: engine.name,
                    status: res.ok ? 'online' : 'degraded',
                    latency: Date.now() - start,
                    httpStatus: res.status,
                };
            } catch (err: any) {
                return {
                    name: engine.name,
                    status: 'offline',
                    latency: Date.now() - start,
                    error: err.message,
                };
            }
        })
    );

    const statuses = results.map((r) =>
        r.status === 'fulfilled' ? r.value : { name: 'Unknown', status: 'error' }
    );

    const allOnline = statuses.every((s) => s.status === 'online');

    return NextResponse.json({
        overall: allOnline ? 'healthy' : 'degraded',
        engines: statuses,
        timestamp: new Date().toISOString(),
    });
}
