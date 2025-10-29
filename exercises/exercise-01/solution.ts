import "dotenv/config"
import { GoogleGenAI } from "@google/genai"
import { createInterface } from "readline"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

const googleClient = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
})

const conversationHistory: Array<{ role: string; parts: Array<{ text: string }> }> = []

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

async function main() {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: false })

    console.log("Chat with Gemini! (Type 'exit' or 'quit' to end)\n")

    const askQuestion = () => {
        rl.question("You: ", async (input) => {
            const userInput = input.trim()

            if (userInput.toLowerCase() === "exit" || userInput.toLowerCase() === "quit") {
                rl.close()
                return
            }

            if (userInput) {
                await chat(userInput)
            }

            askQuestion() // Continue the loop
        })
    }

    askQuestion()
}

if (require.main === module) {
    main().catch(console.error);
}