const PLACEHOLDER_TOKEN_HINT = "your_real_token";

export type BlobObjectAccess = "public" | "private";

const BLOB_TOKEN_KEYS = ["BLOB1_READ_WRITE_TOKEN", "BLOB_READ_WRITE_TOKEN"] as const;

type BlobTokenKey = (typeof BLOB_TOKEN_KEYS)[number];

export function getBlobTokenInfo(): { token: string; key: BlobTokenKey } | null {
  for (const key of BLOB_TOKEN_KEYS) {
    const token = process.env[key];
    if (typeof token === "string") {
      return { token, key };
    }
  }

  return null;
}

export function getBlobTokenValidation() {
  const tokenInfo = getBlobTokenInfo();
  const token = tokenInfo?.token;

  if (!token) {
    return {
      ok: false,
      error:
        "Blob storage is not configured. Missing BLOB1_READ_WRITE_TOKEN or BLOB_READ_WRITE_TOKEN in server environment (.env.local for local development).",
    };
  }

  const normalized = token.trim();
  if (!normalized) {
    return {
      ok: false,
      error:
        "Blob storage is not configured. The Blob read/write token is empty. Set BLOB1_READ_WRITE_TOKEN (or BLOB_READ_WRITE_TOKEN) in .env.local and restart the server.",
    };
  }

  if (normalized.includes(PLACEHOLDER_TOKEN_HINT)) {
    return {
      ok: false,
      error:
        "Blob storage is not configured. Replace the placeholder Blob token with your actual Vercel Blob read/write token.",
    };
  }

  if (!normalized.startsWith("vercel_blob_rw_")) {
    return {
      ok: false,
      error:
        "Blob storage token format is invalid. BLOB1_READ_WRITE_TOKEN (or BLOB_READ_WRITE_TOKEN) should start with vercel_blob_rw_.",
    };
  }

  return { ok: true, error: "", key: tokenInfo?.key };
}

export function isAllowedImageMimeType(mimeType: string) {
  return ["image/jpeg", "image/png", "image/webp"].includes(mimeType);
}

export function getBlobObjectAccess(): BlobObjectAccess {
  const raw = (process.env.BLOB_OBJECT_ACCESS || "private").trim().toLowerCase();
  return raw === "public" ? "public" : "private";
}

export function getCoverImageBlobAccess(): BlobObjectAccess {
  const raw = (process.env.BLOB_COVER_IMAGE_ACCESS || "public").trim().toLowerCase();
  return raw === "private" ? "private" : "public";
}

export function getExpenseBlobAccess(): BlobObjectAccess {
  const raw = (process.env.BLOB_EXPENSE_ACCESS || "public").trim().toLowerCase();
  return raw === "private" ? "private" : "public";
}
