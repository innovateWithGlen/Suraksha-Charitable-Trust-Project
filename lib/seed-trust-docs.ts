import { loadEnvConfig } from "@next/env";
import fs from "node:fs/promises";
import path from "node:path";

loadEnvConfig(process.cwd());

type SourceDoc = {
  title: string;
  filename: string;
  relativePath: string;
};

const sourceDocs: SourceDoc[] = [
  {
    title: "Trust Deed",
    filename: "01-trust-deed.txt",
    relativePath: "demo-docs/01-trust-deed.txt",
  },
  {
    title: "Form 10AC (12A Registration)",
    filename: "02-form-10ac-12a-registration.txt",
    relativePath: "demo-docs/02-form-10ac-12a-registration.txt",
  },
  {
    title: "Form 10BE (80G Approval)",
    filename: "03-form-10be-80g-approval.txt",
    relativePath: "demo-docs/03-form-10be-80g-approval.txt",
  },
  {
    title: "CSR-1 Registration Certificate",
    filename: "04-csr1-registration-certificate.txt",
    relativePath: "demo-docs/04-csr1-registration-certificate.txt",
  },
];

async function run() {
  const { default: dbConnect } = await import("@/lib/mongodb");
  const TrustDocument = (await import("@/lib/models/TrustDocument")).default;
  const { chunkText } = await import("@/lib/rag/chunk");
  const { createEmbeddings } = await import("@/lib/rag/embeddings");

  await dbConnect();

  let upserted = 0;

  for (const doc of sourceDocs) {
    const absolutePath = path.join(process.cwd(), doc.relativePath);
    const content = await fs.readFile(absolutePath, "utf8");

    const chunks = chunkText(content);
    if (!chunks.length) {
      throw new Error(`No chunkable content in ${doc.relativePath}`);
    }

    const embeddings = await createEmbeddings(chunks);
    const embeddedChunks = chunks.map((text, index) => ({
      text,
      embedding: embeddings[index],
      chunkIndex: index,
    }));

    await TrustDocument.findOneAndUpdate(
      { filename: doc.filename },
      {
        $set: {
          title: doc.title,
          filename: doc.filename,
          fileType: "text",
          mimeType: "text/plain",
          fileSize: Buffer.byteLength(content, "utf8"),
          chunks: embeddedChunks,
          totalChunks: embeddedChunks.length,
          isActive: true,
        },
      },
      { upsert: true, returnDocument: "after", runValidators: true }
    );

    upserted += 1;
  }

  const totalDocs = await TrustDocument.countDocuments({ isActive: true });

  console.log("Trust docs ingestion complete.");
  console.log(`Documents upserted: ${upserted}`);
  console.log(`Active docs in RAG store: ${totalDocs}`);
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Trust docs seed failed:", error);
    process.exit(1);
  });
