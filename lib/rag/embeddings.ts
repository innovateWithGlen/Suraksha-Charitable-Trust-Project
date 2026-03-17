import { embed } from "ai";
import { googleAI } from "@/lib/ai/google";

export async function createEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: googleAI.textEmbeddingModel("gemini-embedding-001"),
    value: text,
  });
  return embedding;
}

export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];

  // Process sequentially with a delay to respect Gemini Free Tier quotas
  for (const text of texts) {
    const embedding = await createEmbedding(text);
    embeddings.push(embedding);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return embeddings;
}
