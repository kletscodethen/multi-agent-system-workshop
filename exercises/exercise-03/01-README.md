# Exercise 3 — Retrieval-Augmented Generation (RAG)

Use a vector database to fetch relevant information and feed them into the model before it generates an answer

## Steps
1. Connect to Pinecone
2. Create an index (dimension must match embedding model)
3. Ingest: embed your content and upsert to vector db
4. Retrieve: embed the query and fetch top matches

## Short exercise ✨

Augment the model with preference data:

1. Add sample preferences
2. Return to Exercise 2’s loop and expose `searchFromVectorDB` as a tool
