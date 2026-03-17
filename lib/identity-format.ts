export type IdProofType = "aadhaar" | "passport" | "voterId";

export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const VOTER_ID_REGEX = /^[A-Z]{3}[0-9]{7}$/;
const PASSPORT_REGEX = /^[A-Z][0-9]{7}$/;

const verhoeffD = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
] as const;

const verhoeffP = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
] as const;

function verhoeffValidate(numStr: string): boolean {
  let c = 0;
  const reversedDigits = numStr
    .split("")
    .reverse()
    .map((n) => Number.parseInt(n, 10));

  for (let i = 0; i < reversedDigits.length; i += 1) {
    c = verhoeffD[c][verhoeffP[i % 8][reversedDigits[i]]];
  }

  return c === 0;
}

export function normalizePanNumber(value?: string): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toUpperCase();
  return normalized || undefined;
}

export function isValidPanNumber(value?: string): boolean {
  if (!value) return false;
  return PAN_REGEX.test(value.trim().toUpperCase());
}

export function normalizeIdProofNumber(type: IdProofType, value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (type === "aadhaar") {
    return trimmed.replace(/\s+/g, "");
  }

  return trimmed.toUpperCase();
}

export function isValidIdProofNumber(type: IdProofType, value?: string): boolean {
  const normalized = normalizeIdProofNumber(type, value);
  if (!normalized) return false;

  if (type === "aadhaar") {
    return /^\d{12}$/.test(normalized) && verhoeffValidate(normalized);
  }

  if (type === "passport") {
    return PASSPORT_REGEX.test(normalized);
  }

  return VOTER_ID_REGEX.test(normalized);
}

export function getIdProofLabel(type?: IdProofType | null): string {
  if (type === "aadhaar") return "Aadhaar";
  if (type === "passport") return "Passport";
  if (type === "voterId") return "Voter ID";
  return "ID";
}
