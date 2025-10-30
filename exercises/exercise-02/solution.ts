import "dotenv/config"
import { getJson } from "serpapi";
import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { main } from "./helpers";

const googleClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
})

const conversationHistory: Array<{ role: string; parts: Array<{ text: string }> }> = []

/**
 * Search Google for information.
 */
export async function searchGoogle({ query }: { query: string }) {
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
export const searchGoogleDeclaration: FunctionDeclaration = {
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
                tools: [{ functionDeclarations: [searchGoogleDeclaration] }],
            },
        })

        // Get response parts
        const parts = res.candidates?.[0]?.content?.parts ?? [];
        const response = parts.find((p: any) => p.text)?.text;

        // Add response to conversation
        if (response) {
            console.log(`\nAssistant: ${response}`);
            conversationHistory.push({ role: "model", parts: [{ text: response }] });
        }

        // Check for function calls
        const fnCalls = parts.filter((p: any) => p.functionCall).map((p: any) => p.functionCall);
        if (fnCalls.length === 0) break;

        // Run tools
        const toolResponses: any[] = [];
        for (const fn of fnCalls) {
            console.log(`\nCalling ${fn.name}()...`);

            if (fn.name === "searchGoogle") {
                // Execute the function with its arguments
                const searchResults = await searchGoogle(fn.args as { query: string });

                // Package the result in Gemini's expected format
                toolResponses.push({ functionResponse: { name: fn.name, response: { results: searchResults } } });
            }
        }

        // Add results back to conversation
        if (toolResponses.length > 0) {
            conversationHistory.push({ role: "tool", parts: toolResponses });
            console.log(`\nAgent is thinking...`);
        }
    }
}

if (require.main === module) {
    main(chat).catch(console.error);
}