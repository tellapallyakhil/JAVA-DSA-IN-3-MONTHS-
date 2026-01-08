import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { NextRequest, NextResponse } from "next/server";

const model = new ChatOpenAI({
    modelName: "google/gemini-2.0-flash-exp:free",
    openAIApiKey: process.env.OPENROUTER_API_KEY,
    configuration: {
        baseURL: "https://openrouter.ai/api/v1",
    },
    temperature: 0.7,
});

export async function POST(request: NextRequest) {
    try {
        const { problemTitle, difficulty } = await request.json();

        if (!problemTitle) {
            return NextResponse.json({ error: "Problem title is required" }, { status: 400 });
        }

        const systemPrompt = new SystemMessage(
            `You are an expert Java DSA tutor. Provide solutions in Java only. 
       Format your response with:
       ## Approach
       Brief explanation of the algorithm
       
       ## Java Code
       \`\`\`java
       // Full, clean, commented code
       \`\`\`
       
       ## Complexity Analysis
       - Time: O(?)
       - Space: O(?)`
        );

        const userPrompt = new HumanMessage(
            `Solve this DSA problem: "${problemTitle}" (Difficulty: ${difficulty}). 
       Provide an optimal Java solution with clear explanation.`
        );

        const response = await model.invoke([systemPrompt, userPrompt]);

        return NextResponse.json({
            solution: response.content,
            model: "langchain/google-gemini"
        });

    } catch (error) {
        console.error("LangChain API Error:", error);
        return NextResponse.json(
            { error: "Failed to generate solution. Please try again." },
            { status: 500 }
        );
    }
}
