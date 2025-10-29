import "dotenv/config"
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;

// clients
const googleClient = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
});

const pineconeClient = new Pinecone({
    apiKey: PINECONE_API_KEY,
});

const ingestDataToVectorDB = async (content: string) => {
    // TODO
}

const searchFromVectorDB = async (query: string) => {
    // TODO
}

const main = async () => {
    // ingest data
    const chunks = [
        "Stars are the suns of other stars",
        "Planets are the moons of other planets",
        "France is a country in Europe",
        "Fruits are the food of animals"
    ]
    for (const chunk of chunks) {
        await ingestDataToVectorDB(chunk);
    }

    // search
    console.log(await searchFromVectorDB("Tell me a fact about royalty"));
}

if (require.main === module) {
    main().catch(console.error);
}
