import "dotenv/config"
import { createInterface } from "readline"
import { FunctionDeclaration, GoogleGenAI } from "@google/genai";

const googleClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
})

export const buildSystemInstruction = ({
    role,
    backstory,
    goal,
}) => {
    const systemInstruction = [
        `You are an expert ${role}`,
        `Backstory: ${backstory}`,
        `Primary goal: ${goal}`,
        `You will be given instructions and/or a task from the user.`,
        `Carefully read the instructions, think step-by-step, and follow them precisely.`,
        `If tools are provided, decide whether using them is necessary for accuracy or freshness.`,
        `Prefer clear, concise responses in your final answer.`,
    ];

    return systemInstruction.join("\n");
};


// Conversation loop logic, now reusable
export type Persona = {
    role: string;
    backstory: string;
    goal: string;
}
export type Tool = {
    declaration: FunctionDeclaration;
    implementation: { [functionName: string]: (args: any) => Promise<any> }
}

export const runAgentWithTools = async (
    persona: Persona,
    task: string,
    toolBox: Tool[] | undefined,
): Promise<string> => {
    const conversationHistory = [{ role: "user", parts: [{ text: task }] }];

    const MAX_TURNS = 10; // Safety limit to prevent infinite loops
    let finalAnswer = "";

    // Main conversation loop
    for (let turn = 0; turn < MAX_TURNS; turn++) {
        const res = await googleClient.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: conversationHistory,
            config: {
                systemInstruction: {
                    role: "system",
                    parts: [{ text: buildSystemInstruction({ ...persona }) }],
                },
                tools: toolBox
                    ? [{ functionDeclarations: toolBox?.map((tool) => tool.declaration) }]
                    : [],
            },
        })

        // Get response parts
        const parts = res.candidates?.[0]?.content?.parts ?? [];
        const text = parts.find((p: any) => p.text)?.text;

        // Add response to conversation
        if (text) {
            console.log(`\nAssistant: ${text.trim()}`);
            finalAnswer = text.trim();
            conversationHistory.push({ role: "model", parts: [{ text }] });
        }

        // Check for function calls
        const fnCalls = parts.filter((p: any) => p.functionCall).map((p: any) => p.functionCall);
        if (fnCalls.length === 0) {
            if (finalAnswer) return finalAnswer;
            break;
        }

        // Run tools
        const toolImplementations = Object.assign({}, ...toolBox?.map((tool) => tool.implementation) || []);
        const toolResponses: any[] = [];
        for (const fn of fnCalls) {
            if (fn.name && toolImplementations) {
                console.log(`\nCalling ${fn.name}()...`);

                // Look up the implementation 
                const implementation = toolImplementations[fn.name];

                // Execute the function with its arguments
                const result = implementation(fn.args).catch(() => { });

                // Package the result in Gemini's expected format
                toolResponses.push({ functionResponse: { name: fn.name, response: result } });
            }
        }

        // Add results back to conversation
        if (toolResponses && toolResponses.length) {
            conversationHistory.push({ role: "tool", parts: toolResponses });
            console.log(`\nAgent is thinking...`);
        }
    }

    return finalAnswer;
};

// Agent with tool-usage conversation loop
export const Agent = (config: {
    persona: Persona;
    toolBox?: Tool[];
}) => ({
    persona: config.persona,
    toolBox: config.toolBox,
    execute: async (
        description: string,
        expectedOutput: string,
        context: Record<string, any> = {},
    ): Promise<string> => {
        // Build context from previous agents
        const contextPrompt = Object.entries(context)
            .map(([key, value]) => `${key}: ${value}`)
            .join("\n\n");

        // Combine task, expected output, and context into full prompt
        const fullTask = `
      Task: ${description}
      
      Expected Output: ${expectedOutput}
      
      ${contextPrompt ? `Context from previous work:\n${contextPrompt}` : ""}
      `.trim();

        // Run the conversation loop with tools
        return await runAgentWithTools(
            config.persona,
            fullTask,
            config.toolBox,
        );
    },
});

export const Task = (config: {
    agent: ReturnType<typeof Agent>;
    description: string;
    expectedOutput: string;
}) => {
    const { agent, description, expectedOutput } = config;

    return {
        agent,
        description,
        expectedOutput,
        result: undefined,
    };
};

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