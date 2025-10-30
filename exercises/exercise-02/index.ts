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
async function searchGoogle({ query }: { query: string }) {
};

/**
 * Declare the tool to the LLM
 */
const searchGoogleDeclaration: FunctionDeclaration = {
};

/**
 * Chat with Gemini
 */
async function chat(prompt: string) {
    // Add user message to history
    conversationHistory.push({ role: "user", parts: [{ text: prompt }] })

    const res = await googleClient.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: conversationHistory,

        // https://ai.google.dev/api/generate-content
        config: {},
    })

    const response = res.candidates[0].content.parts[0].text

    // Add assistant response to history
    conversationHistory.push({ role: "model", parts: [{ text: response }] })

    console.log(`\nAssistant: ${response}\n`)
}

if (require.main === module) {
    main(chat).catch(console.error);
}
