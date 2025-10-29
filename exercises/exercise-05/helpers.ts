import "dotenv/config"
import { createInterface } from "readline"

export function cutBeforeJsonFence(s: string) {
  const re = /^[\s\S]*?(?=```json(?:\r?\n)?|```)/i;
  return s.replace(re, "").replace(/```json\n?|```/g, "")
}

export async function main(chatFn: (prompt: string) => Promise<void>) {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: false })

    console.log("Ask for travel recommendations!\n\nMake sure to include the location and your preferences ✨\n")

    const askQuestion = () => {
        rl.question("You: ", async (input) => {
            const userInput = input.trim()

            if (userInput) {
                await chatFn(userInput)
                rl.close()
                return
            }

            askQuestion() // Continue the loop
        })
    }

    askQuestion()
}