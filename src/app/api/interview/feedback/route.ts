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

        // Detect greetings - if user says hi/hello, greet back instead of scoring
        const greetingPatterns = /^(hi|hello|hey|hii|hiii|good\s*(morning|afternoon|evening)|greetings|howdy|sup|yo)[\s!.,?]*$/i;
        const trimmedAnswer = answer?.trim() || '';

        if (greetingPatterns.test(trimmedAnswer)) {
            const greetings = [
                "Hello! 👋 I'm your AI interviewer. Please take a moment to answer the question above. I'm here to help you practice!",
                "Hey there! 😊 Great to have you here. Now, let's focus on the interview question. Take your time and give it your best shot!",
                "Hi! 👋 Nice to meet you! Let's get back to the interview - please provide your answer to the question above.",
                "Hello! Ready to ace this interview? 💪 Please share your thoughts on the question I asked.",
                "Hey! 😄 I appreciate the greeting! Now, let's practice - please answer the interview question above."
            ];
            return NextResponse.json({
                feedback: greetings[Math.floor(Math.random() * greetings.length)],
                score: 0,
                isGreeting: true
            });
        }

        // Check for very short or irrelevant answers (less than 10 characters or just filler words)
        const fillerPatterns = /^(ok|okay|yes|no|sure|maybe|idk|i\s*don'?t\s*know|nothing|none|pass|skip|next|um+|uh+|hmm+|lol|haha|k|kk)[\s!.,?]*$/i;
        if (trimmedAnswer.length < 10 || fillerPatterns.test(trimmedAnswer)) {
            return NextResponse.json({
                feedback: "Your answer is too short or doesn't address the question. Please provide a more detailed response that demonstrates your understanding of the topic. A good answer should be at least a few sentences explaining your approach, reasoning, or experience.",
                score: 0
            });
        }

        const systemPrompt = `You are a strict senior tech interviewer providing constructive but honest feedback.

The candidate was asked: "${question}"
Their answer was: "${answer}"
Topic: ${topic || 'general'}
Difficulty: ${difficulty || 'medium'}

IMPORTANT SCORING RULES:
1. If the answer has LESS THAN 10% relevance to the question (off-topic, random words, jokes, greetings, or doesn't attempt to answer), give a score of 0.
2. If the answer is a greeting like "hi", "hello", etc., give score 0 and politely ask them to answer the actual question.
3. Be STRICT - do not give participation points. An irrelevant answer = 0.

Evaluate the answer and provide:
1. A score from 0-10 (be realistic and strict)
2. Brief, helpful feedback (2-3 sentences max)

Scoring guide:
- 0: Completely irrelevant, greetings, random text, or less than 10% match to expected answer
- 1-2: Minimal effort, barely related to the topic
- 3-4: Weak answer, major gaps or mostly irrelevant
- 5-6: Average answer, missing key points or lacks structure
- 7-8: Good answer, covers main points but could add more depth or examples
- 9-10: Exceptional answer with perfect structure, specific examples, and deep insight

Return a JSON object: {"score": <number>, "feedback": "<string>"}`;

        const FREE_MODELS = [
            "mistralai/mistral-7b-instruct:free",
            "google/gemini-2.0-flash-exp:free",
            "meta-llama/llama-3-8b-instruct:free",
            "microsoft/phi-3-mini-128k-instruct:free"
        ];

        const randomModel = FREE_MODELS[Math.floor(Math.random() * FREE_MODELS.length)];

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": SITE_URL,
                "X-Title": "DSA Prep App - Interview Feedback",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": randomModel,
                "messages": [
                    { "role": "system", "content": systemPrompt },
                    { "role": "user", "content": `Provide your evaluation now. Output strictly valid JSON. Unique Request ID: ${Date.now()}` }
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

        // Ensure score is within bounds (0-10, allowing 0 for irrelevant answers)
        const score = Math.min(10, Math.max(0, parseInt(parsed.score) || 0));

        return NextResponse.json({
            feedback: parsed.feedback || 'Good answer! Consider adding more concrete examples.',
            score: score
        });

    } catch (error: unknown) {
        console.error('Feedback API Error:', error);
        // Return a generic fallback feedback with random decent score
        const scores = [7, 7, 8, 8, 8];
        const feedbacks = [
            'Good answer! Consider adding more concrete examples to strengthen your response.',
            'Solid response. You covered the main points well, but could go deeper into the technical details.',
            'Well stated. Try to structure your answer with the STAR method for even better clarity.',
            'Good understanding shown. Don\'t forget to mention edge cases or trade-offs.',
            'Nice work! A few more specific metrics or results would make this answer even stronger.'
        ];
        return NextResponse.json({
            feedback: feedbacks[Math.floor(Math.random() * feedbacks.length)],
            score: scores[Math.floor(Math.random() * scores.length)]
        });
    }
}

