import { Agent, main, Task, Tool } from "./helpers";

// TODO
export const tool: Tool = {} as any
export const agent = Agent({} as any);
export const task = Task({} as any);

async function executeCrew(config: {
    initialRequest: string
    agents: ReturnType<typeof Agent>[]
    tasks: ReturnType<typeof Task>[]
}) {
    // TODO
};

async function chat(prompt: string) {
    // TODO
};

if (require.main === module) {
    main(chat).catch(console.error);
}
