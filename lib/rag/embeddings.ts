import { embed } from "ai";
import { googleAI } from "@/lib/ai/google";

const LOCAL_EMBEDDING_DIM = 256;

function createLocalEmbedding(text: string): number[] {
  const vector = Array.from({ length: LOCAL_EMBEDDING_DIM }, () => 0);
  const normalized = text.toLowerCase();

  for (let i = 0; i < normalized.length; i += 1) {
    const code = normalized.charCodeAt(i);
    const idx = code % LOCAL_EMBEDDING_DIM;
    vector[idx] += 1;
  }

  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (!norm) return vector;
  return vector.map((value) => value / norm);
}

export async function createEmbedding(text: string): Promise<number[]> {
  try {
    const { embedding } = await embed({
      model: googleAI.textEmbeddingModel("gemini-embedding-001"),
      value: text,
    });
    return embedding;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown embedding error";
    console.warn(`Embedding API unavailable, using local fallback embeddings (${message}).`);
    return createLocalEmbedding(text);
  }
}

export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  const results = await Promise.all(texts.map((text) => createEmbedding(text)));
  return results;
}
