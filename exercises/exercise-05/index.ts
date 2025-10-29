import { executeCrew, ideaGenerator, ideationTask, itineraryBuilder, itineraryTask } from "../exercise-04/solution";
import { main } from "./helpers";

async function chat(prompt: string) {
    try {
        // TODO - Validate prompt

        const result = await executeCrew({
            initialRequest: prompt,
            agents: [ideaGenerator, itineraryBuilder],
            tasks: [ideationTask, itineraryTask],
        });

        // TODO - Validate result
    } catch (error) {
        console.log("\n❌ Invalid result");
    }
};

if (require.main === module) {
    main(chat).catch(console.error);
}
