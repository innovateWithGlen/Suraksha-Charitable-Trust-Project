import dbConnect from "@/lib/mongodb";
import TrustDocument from "@/lib/models/TrustDocument";
import { createEmbedding } from "@/lib/rag/embeddings";

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return -1;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (!normA || !normB) return -1;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function retrieveRelevantChunks(query: string, topK = 5) {
  await dbConnect();
  const queryEmbedding = await createEmbedding(query);

  const docs = await TrustDocument.find({ isActive: true }).lean();
  const scored: Array<{ score: number; text: string; title: string }> = [];

  for (const doc of docs) {
    for (const chunk of doc.chunks || []) {
      if (!chunk.embedding?.length || !chunk.text) continue;
      const score = cosineSimilarity(queryEmbedding, chunk.embedding);
      scored.push({ score, text: chunk.text, title: doc.title });
    }
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, topK);
}
