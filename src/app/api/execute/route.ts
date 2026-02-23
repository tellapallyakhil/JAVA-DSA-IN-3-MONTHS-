import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { code, stdin } = await req.json();

        // This would be your Render URL from your Environment Variables
        // For local testing, it's http://localhost:8000
        const JUDGE_SERVICE_URL = process.env.JUDGE_SERVICE_URL || 'http://localhost:8000';

        const response = await fetch(`${JUDGE_SERVICE_URL}/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, stdin }),
        });

        if (!response.ok) {
            throw new Error(`Judge Service responded with ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Judge Service Error:", error);
        return NextResponse.json(
            { success: false, error: "The Code Judge is currently offline. Please try again later.", type: "System Error" },
            { status: 500 }
        );
    }
}
