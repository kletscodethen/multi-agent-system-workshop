import { createInterface } from "readline"

export async function main(chatFn: (prompt: string) => Promise<void>) {
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
                await chatFn(userInput)
            }

            askQuestion() // Continue the loop
        })
    }

    askQuestion()
}