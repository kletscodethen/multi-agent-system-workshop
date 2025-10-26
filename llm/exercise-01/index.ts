import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

const googleClient = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
})

async function chat() {
    // TODO
}

async function main() {
    await chat()
}

main()