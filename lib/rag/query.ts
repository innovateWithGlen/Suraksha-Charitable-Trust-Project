import dbConnect from "@/lib/mongodb";
import TrustDocument from "@/lib/models/TrustDocument";
import { createEmbedding } from "@/lib/rag/embeddings";

type ScoredChunk = {
  score: number;
  text: string;
  title: string;
};

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

function normalizeQuery(query: string): string {
  const q = query.toLowerCase();
  if (/\b80g\b/.test(q)) {
    return `${query} tax deduction certificate form 10be donation eligibility`;
  }
  if (/\b12a\b|10ac/.test(q)) {
    return `${query} registration form 10ac section 12ab urn`; 
  }
  if (/csr-?1|csr/.test(q)) {
    return `${query} csr-1 registration number certificate`; 
  }
  return query;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function lexicalScore(query: string, chunkText: string, title: string): number {
  const qTokens = new Set(tokenize(query));
  if (!qTokens.size) return 0;

  const textTokens = new Set(tokenize(`${title} ${chunkText}`));
  let hits = 0;
  qTokens.forEach((token) => {
    if (textTokens.has(token)) hits += 1;
  });

  return hits / qTokens.size;
}

function blendScore(semantic: number, lexical: number): number {
  const semanticSafe = semantic < 0 ? 0 : semantic;
  return semanticSafe * 0.7 + lexical * 0.3;
}

export async function retrieveRelevantChunks(query: string, topK = 5) {
  await dbConnect();
  const normalizedQuery = normalizeQuery(query);
  const queryEmbedding = await createEmbedding(normalizedQuery);

  const docs = await TrustDocument.find({ isActive: true }).lean();
  const scored: ScoredChunk[] = [];

  for (const doc of docs) {
    for (const chunk of doc.chunks || []) {
      if (!chunk.embedding?.length || !chunk.text) continue;
      const semantic = cosineSimilarity(queryEmbedding, chunk.embedding);
      const lexical = lexicalScore(normalizedQuery, chunk.text, doc.title);
      const score = blendScore(semantic, lexical);
      scored.push({ score, text: chunk.text, title: doc.title });
    }
  }

  const sorted = scored.sort((a, b) => b.score - a.score);
  const limitedPerSource = new Map<string, number>();
  const diversified: ScoredChunk[] = [];

  for (const item of sorted) {
    const count = limitedPerSource.get(item.title) || 0;
    if (count >= 2) continue;
    diversified.push(item);
    limitedPerSource.set(item.title, count + 1);
    if (diversified.length >= topK) break;
  }

  return diversified;
}
