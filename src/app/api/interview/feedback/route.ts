import { NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(req: Request) {
    if (!OPENROUTER_API_KEY) {
        // Return fallback feedback with random score if no API key
        const scores = [7, 7, 8, 8, 8, 9];
        const score = scores[Math.floor(Math.random() * scores.length)];
        return NextResponse.json({
            feedback: 'Good effort! Consider adding more specific examples from your experience.',
            score: score
        });
    }

    try {
        const { question, answer, topic, difficulty } = await req.json();

        const systemPrompt = `You are a senior tech interviewer providing constructive feedback.

The candidate was asked: "${question}"
Their answer was: "${answer}"
Topic: ${topic || 'general'}
Difficulty: ${difficulty || 'medium'}

Evaluate the answer and provide:
1. A score from 1-10 (be realistic - 7-8 is a good answer, 9-10 is exceptional, below 6 needs work)
2. Brief, helpful feedback (2-3 sentences max)

Scoring guide:
- 9-10: Exceptional answer with perfect structure, specific examples, and deep insight
- 7-8: Good answer, covers main points but could add more depth or examples
- 5-6: Average answer, missing key points or lacks structure
- 3-4: Weak answer, major gaps or irrelevant
- 1-2: Poor answer, completely off-topic or minimal effort

Return a JSON object: {"score": <number>, "feedback": "<string>"}`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": SITE_URL,
                "X-Title": "DSA Prep App - Interview Feedback",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-exp:free",
                "messages": [
                    { "role": "system", "content": systemPrompt },
                    { "role": "user", "content": "Provide your evaluation now. Output strictly valid JSON." }
                ],
                "response_format": { "type": "json_object" },
                "temperature": 0.7
            })
        });

        const data = await response.json();

        if (!response.ok || !data.choices?.[0]) {
            throw new Error(data.error?.message || 'Invalid response');
        }

        const content = data.choices[0].message.content;
        const parsed = JSON.parse(content);

        // Ensure score is within bounds
        const score = Math.min(10, Math.max(1, parseInt(parsed.score) || 7));

        return NextResponse.json({
            feedback: parsed.feedback || 'Good answer! Consider adding more concrete examples.',
            score: score
        });

    } catch (error: any) {
        console.error('Feedback API Error:', error);
        // Return a generic fallback feedback with random decent score
        const scores = [7, 7, 8, 8];
        return NextResponse.json({
            feedback: 'Good answer! Consider adding more concrete examples to strengthen your response.',
            score: scores[Math.floor(Math.random() * scores.length)]
        });
    }
}

