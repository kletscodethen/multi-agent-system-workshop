import "dotenv/config"
import { getJson } from "serpapi";
import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { main } from "./helpers";

const googleClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
})

const conversationHistory: any[] = [];

/**
 * Search Google for information.
 */
async function searchGoogle({ query }: { query: string }) {
    const MAX_RESULTS = 10;

    const data = await getJson({ engine: "google", api_key: process.env.SERP_API_KEY, q: query.trim(), num: MAX_RESULTS });

    const results = (data.organic_results ?? [])
        .slice(0, MAX_RESULTS)
        .map(({ title, link, snippet }) => ({ title, link, snippet }));

    return results;
};

/**
 * Declare the tool to the LLM
 */
const searchGoogleTool: FunctionDeclaration = {
    name: "searchGoogle",
    description: "Search Google for information.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            query: {
                type: Type.STRING,
                description: "Search query, e.g. 'things to do today near me'.",
            },
        },
        required: ["query"],
    },
};

/**
 * Chat with Gemini
 */
async function chat(prompt: string) {
    // Add user message to history
    conversationHistory.push({ role: "user", parts: [{ text: prompt }] })

    const MAX_TURNS = 10; // Safety limit to prevent infinite loops

    // Loop until llm provides final answer or hits max turns
    for (let turn = 0; turn < MAX_TURNS; turn++) {
        const res = await googleClient.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: conversationHistory,
            config: {
                tools: [{ functionDeclarations: [searchGoogleTool] }],
            },
        })

        const parts = res.candidates?.[0]?.content?.parts ?? [];

        // Get first text part
        const text = parts.find((p: any) => p.text)?.text;
        if (text) {
            console.log(`\nAssistant: ${text}`); // backticks
            conversationHistory.push({ role: "model", parts: [{ text }] });
        }

        // Collect function calls
        const fnCalls = parts.filter((p: any) => p.functionCall).map((p: any) => p.functionCall);
        if (fnCalls.length === 0) break;

        // Run tools
        const toolResponses: any[] = [];
        for (const fnCall of fnCalls) {
            console.log(`\nCalling ${fnCall.name}()...`);

            if (fnCall.name === "searchGoogle") {
                const searchResults = await searchGoogle(fnCall.args as { query: string });
                toolResponses.push({ functionResponse: { name: fnCall.name, response: { results: searchResults } } });
            }
        }

        // Add tool responses back to the conversation
        if (toolResponses.length > 0) {
            conversationHistory.push({ role: "tool", parts: toolResponses });
            console.log(`\nAgent is thinking...`);
        }
    }
}

main(chat)
