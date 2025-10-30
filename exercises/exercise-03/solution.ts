import "dotenv/config"
import { Pinecone, RecordMetadataValue } from "@pinecone-database/pinecone";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;

// config
const EMBEDDING_DIMENSION = 768;
const indexName = "new-index";

// clients
const googleClient = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
});

const pineconeClient = new Pinecone({
    apiKey: PINECONE_API_KEY,
});

const ingestDataToVectorDB = async (content: string): Promise<void> => {
    const index = pineconeClient.index(indexName);

    // embed content
    const embeddingsResponse = await googleClient.models.embedContent({
        model: "gemini-embedding-001",
        contents: content,
        config: {
            outputDimensionality: EMBEDDING_DIMENSION,
        },
    });

    // upsert to index
    if (embeddingsResponse.embeddings) {
        await index.upsert([
            {
                id: crypto.randomUUID(),
                values: embeddingsResponse.embeddings[0].values,
                metadata: {
                    feedback: content,
                },
            },
        ])
    }
}

const searchFromVectorDB = async (query: string): Promise<RecordMetadataValue[]> => {
    const index = pineconeClient.index(indexName);

    // Convert query to vector
    const embed = await googleClient.models.embedContent({
        model: "gemini-embedding-001",
        contents: [query],
        config: {
            outputDimensionality: EMBEDDING_DIMENSION, // must match index dimension
        },
    });

    // Search for similar vectors
    const results = await index.query({
        vector: embed.embeddings?.[0].values,
        topK: 10, // max results
        includeMetadata: true,
    });

    // filter results by score
    const SCORE_THRESHOLD = 0.55;
    const filtered = (results.matches ?? [])
        .filter(m => (m.score ?? -Infinity) >= SCORE_THRESHOLD)
        .slice(0, 2);

    // Return results
    return filtered.map(m => m.metadata?.feedback).filter(Boolean)
}

const main = async () => {
    // ingest data
    const chunks = [
        "Stars are the suns of other stars",
        "Planets are the moons of other planets",
        "France is a country in Europe",
        "Fruits are the food of animals",
        "Kings are the rulers of countries",
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
