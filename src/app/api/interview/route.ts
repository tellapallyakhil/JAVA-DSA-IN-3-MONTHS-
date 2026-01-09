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
        const { topic, type, followUp, previousAnswer, difficulty, companyStyle } = await req.json();

        let systemPrompt: string;

        // Difficulty modifiers
        const difficultyGuide: Record<string, string> = {
            'easy': 'Ask a straightforward, beginner-friendly question. Focus on basic concepts.',
            'medium': 'Ask a moderately challenging question. Expect solid understanding and some examples.',
            'hard': 'Ask a complex, senior-level question. Expect deep knowledge, edge cases, and trade-offs.'
        };

        // Company style modifiers
        const companyGuide: Record<string, string> = {
            'general': '',
            'faang': 'Frame the question like FAANG interviews - focus on optimization, scalability, and precise analysis.',
            'startup': 'Frame like a startup interview - practical, real-world scenarios, and adaptability.',
            'product': 'Frame like a product-company interview - user-centric thinking and business impact.'
        };

        const difficultyMod = difficultyGuide[difficulty] || difficultyGuide['medium'];
        const companyMod = companyGuide[companyStyle] || '';

        if (followUp && previousAnswer) {
            systemPrompt = `You are a senior interviewer conducting a ${type} interview about ${topic}.
Difficulty: ${difficulty || 'medium'}. ${difficultyMod}
${companyMod}

The candidate just answered a question. Their answer was: "${previousAnswer.slice(0, 500)}"

Based on their response, generate a thoughtful follow-up question that:
1. Digs deeper into something they mentioned
2. OR challenges an assumption they made
3. OR asks them to clarify or expand on a point
4. Matches the ${difficulty || 'medium'} difficulty level

Return JSON: {"question": "your follow-up question", "hints": ["hint1", "hint2", "hint3"]}`;
        } else if (type === 'behavioral') {
            systemPrompt = `You are an experienced HR interviewer. 
Difficulty: ${difficulty || 'medium'}. ${difficultyMod}
${companyMod}

Generate a behavioral interview question using the STAR method framework.
Topic focus: ${topic}

For ${difficulty || 'medium'} difficulty:
- Easy: Basic self-introduction or simple teamwork questions
- Medium: Conflict resolution, challenging projects, deadline management
- Hard: Leadership failures, ethical dilemmas, strategic decisions

Return JSON: {"question": "your question here", "hints": ["hint1", "hint2", "hint3"]}`;
        } else {
            systemPrompt = `You are a Senior Software Engineer conducting a technical interview.
Difficulty: ${difficulty || 'medium'}. ${difficultyMod}
${companyMod}

Generate a technical interview question about: ${topic}

For ${difficulty || 'medium'} difficulty:
- Easy: Definition questions, basic concepts, simple code walkthrough
- Medium: Algorithm design, system components, optimization questions
- Hard: Complex system design, advanced algorithms, distributed systems challenges

The question should be clear, specific, and discussable in 2-3 minutes.

Return JSON: {"question": "your question here", "hints": ["hint1", "hint2", "hint3"]}`;
        }

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
                    { "role": "user", "content": "Generate the interview question now. Output strictly valid JSON." }
                ],
                "response_format": { "type": "json_object" },
                "temperature": 0.85
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

