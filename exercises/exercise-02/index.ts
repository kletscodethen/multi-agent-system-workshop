import "dotenv/config"
import { getJson } from "serpapi";
import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { main } from "./helpers";

const googleClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
})

const conversationHistory: any[] = [];

async function searchGoogle({ query }: { query: string }) {
    // TODO
};

const searchGoogleTool: FunctionDeclaration = {
    // TODO
};

async function chat(prompt: string) {
    // TODO
}

if (require.main === module) {
    main(chat).catch(console.error);
}
