import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { createInterface } from "readline"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

const googleClient = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
})

async function chat() {
    // TODO
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
                await chat()
            }

            askQuestion()
        })
    }

    askQuestion()
}

main()