import { NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(req: Request) {
    if (!OPENROUTER_API_KEY) {
        return NextResponse.json(
            { error: 'OpenRouter API Key not configured' },
            { status: 500 }
        );
    }

    try {
        const { topic, type } = await req.json(); // type: 'technical' | 'behavioral'

        const systemPrompt = type === 'behavioral'
            ? "You are an HR interviewer. Generate a behavioral interview question (e.g., STAR method). Return JSON format with 'question' (string) and 'hints' (array of 3 short strings)."
            : "You are a Senior Tech Lead interviewer. Generate a technical DSA or System Design question. Return JSON format with 'question' (string) and 'hints' (array of 3 short strings).";

        const FREE_MODELS = [
            "mistralai/mistral-7b-instruct:free",
            "google/gemini-2.0-flash-exp:free"
        ];

        const randomModel = FREE_MODELS[Math.floor(Math.random() * FREE_MODELS.length)];

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": SITE_URL,
                "X-Title": "DSA Prep App",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": randomModel,
                "messages": [
                    { "role": "system", "content": systemPrompt },
                    { "role": "user", "content": `Generate a question about ${topic || 'general software engineering'}. Output strictly valid JSON.` }
                ],
                "response_format": { "type": "json_object" }
            })
        });

        const data = await response.json();

        if (!response.ok || !data.choices || !data.choices[0]) {
            console.error("OpenRouter Response:", data);
            throw new Error(data.error?.message || "Invalid response from OpenRouter");
        }

        const content = data.choices[0].message.content;
        const parsed = JSON.parse(content);

        return NextResponse.json(parsed);

    } catch (error: any) {
        console.error('OpenRouter Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate question',
                details: error.message || String(error),
                apiKeyConfigured: !!OPENROUTER_API_KEY
            },
            { status: 500 }
        );
    }
}
