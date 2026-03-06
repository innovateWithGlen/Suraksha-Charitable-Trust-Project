export function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const normalized = text.replace(/\r\n/g, "\n");
  if (!normalized.trim()) return [];

  // Split by double newline to preserve paragraph/list integrity
  const paragraphs = normalized.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    const cleaned = paragraph.replace(/\s+/g, " ").trim();
    if (!cleaned) continue;

    if ((currentChunk.length + cleaned.length) > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      // Create overlap by taking the last words of the previous chunk
      const overlapStr = currentChunk.slice(-overlap);
      currentChunk = overlapStr + " " + cleaned;
    } else {
      currentChunk += (currentChunk ? " " : "") + cleaned;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
