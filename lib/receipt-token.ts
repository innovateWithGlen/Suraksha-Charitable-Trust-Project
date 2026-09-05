import crypto from "crypto";

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function getSecret(): string {
  const secret =
    process.env.NEXTAUTH_SECRET || process.env.ENCRYPTION_KEY || "";
  if (!secret) {
    throw new Error("Receipt token secret not configured (NEXTAUTH_SECRET)");
  }
  return secret;
}

function sign(payload: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
}

export function signReceiptToken(
  certificateId: string,
  now: number = Date.now()
): string {
  const expiresAt = now + TOKEN_TTL_MS;
  const payload = `${certificateId}|${expiresAt}`;
  return `${expiresAt.toString(36)}.${sign(payload)}`;
}

export function verifyReceiptToken(
  certificateId: string,
  token?: string | null
): boolean {
  if (!token) return false;

  const [expBase36, signature] = token.split(".");
  if (!expBase36 || !signature) return false;

  const expiresAt = Number.parseInt(expBase36, 36);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;

  const expected = sign(`${certificateId}|${expiresAt}`);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;

  return crypto.timingSafeEqual(a, b);
}