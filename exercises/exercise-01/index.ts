import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { createInterface } from "readline";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const googleClient = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

// TODO
async function chat() {
  //This contains the main logic to chat with Gemini
  // Step 1: Add user message to conversation history
  // Step 2: Generate LLM response
  // Step 3: Get the text from the response
  // Step 4: Add LLM response to conversation history
  // Step 5: Print the response
}

//Helper function that allows you to chat with Gemini via the terminal
async function main() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  console.log("Chat with Gemini! (Type 'exit' or 'quit' to end)\n");

  const askQuestion = () => {
    rl.question("You: ", async (input) => {
      const userInput = input.trim();

      if (
        userInput.toLowerCase() === "exit" ||
        userInput.toLowerCase() === "quit"
      ) {
        rl.close();
        return;
      }

      if (userInput) {
        await chat();
      }

      askQuestion();
    });
  };

  askQuestion();
}

if (require.main === module) {
  main().catch(console.error);
}
