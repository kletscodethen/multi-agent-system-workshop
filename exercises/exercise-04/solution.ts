import { searchGoogleDeclaration, searchGoogle } from "../exercise-02/solution";
import { Agent, main, Task, Tool } from "./helpers";

export const searchGoogleTool: Tool = {
    declaration: searchGoogleDeclaration,
    implementation: {
        searchGoogle: async (args: { query: string }) => {
            return await searchGoogle(args);
        },
    },
};

// Create agents with their tools
export const ideaGenerator = Agent({
    persona: {
        role: "Idea Generator",
        backstory: "Expert at generating ideas for activities",
        goal: "Generate ideas for activities based on user preferences and the weather for the desired location",
    },
    toolBox: [searchGoogleTool],
});

// Create tasks with clear expected outputs
export const ideationTask = Task({
    agent: ideaGenerator,
    description:
        "Come up with 5 activities based on user preferences and weather conditions. You should search the web for common hidden gems in that area",
    expectedOutput: "A list of 5 types of general activities they could do",
});


// Orchestrator for multiple agents
async function executeCrew(config: {
    initialRequest: string
    agents: ReturnType<typeof Agent>[]
    tasks: ReturnType<typeof Task>[]
}) {
    const context: Record<string, any> = {
        userRequest: `User Request: ${config.initialRequest}`,
    };

    // Sequential execution
    for (const task of config.tasks) {
        // Accumulated context
        task.result = await task.agent.execute(
            task.description,
            task.expectedOutput,
            context,
        );

        // Agent's result to context for next agent
        const roleName = task.agent.persona.role.replace(/\s+/g, "");
        context[`${roleName}Output`] = task.result;
    }

    // Return the final task's result
    return config.tasks[config.tasks.length - 1].result;
};

async function chat(prompt: string) {
    await executeCrew({
        initialRequest: prompt,
        agents: [ideaGenerator],
        tasks: [ideationTask],
    });
};

if (require.main === module) {
    main(chat).catch(console.error);
}
