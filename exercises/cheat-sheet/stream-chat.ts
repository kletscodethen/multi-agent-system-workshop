import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

const googleClient = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
})

const conversationHistory: any[] = [];

export async function streamChat(prompt: string) {
   // ⬇️Add user message to history
   conversationHistory.push({ role: "user", parts: [{ text: prompt }] });

   const res = await googleClient.models.generateContentStream({
       model: "gemini-2.0-flash-exp",
       contents: conversationHistory,
   })

   process.stdout.write("\nAssistant: ");

   let response = "";
   for await (const chunk of res) {
       const text = chunk.candidates[0].content.parts[0].text;
       response += text;
       process.stdout.write(text);
   }

   console.log(); // newline after stream
   conversationHistory.push({ role: "model", parts: [{ text: response }] });
}
