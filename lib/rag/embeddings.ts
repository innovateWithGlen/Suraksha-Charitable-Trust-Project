import { embed } from "ai";
import { openai } from "@ai-sdk/openai";

export async function createEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: text,
  });
  return embedding;
}

export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  const results = await Promise.all(texts.map((text) => createEmbedding(text)));
  return results;
}
