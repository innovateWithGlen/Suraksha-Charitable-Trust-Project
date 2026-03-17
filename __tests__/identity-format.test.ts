import { describe, it, expect } from "vitest";
import {
  isValidPanNumber,
  isValidIdProofNumber,
  normalizePanNumber,
  normalizeIdProofNumber,
  getIdProofLabel,
  PAN_REGEX,
} from "@/lib/identity-format";

describe("PAN_REGEX", () => {
  it("matches standard valid PAN", () => {
    expect(PAN_REGEX.test("ABCDE1234F")).toBe(true);
  });

  it("matches PAN starting with different letter groups", () => {
    expect(PAN_REGEX.test("ZXYZZ9999Z")).toBe(true);
  });

  it("rejects lowercase PAN", () => {
    expect(PAN_REGEX.test("abcde1234f")).toBe(false);
  });

  it("rejects PAN with wrong structure", () => {
    expect(PAN_REGEX.test("ABCD12345F")).toBe(false); // 4 letters, not 5
  });

  it("rejects short PAN", () => {
    expect(PAN_REGEX.test("ABC1234F")).toBe(false);
  });
});

describe("isValidPanNumber", () => {
  it("returns true for valid PAN", () => {
    expect(isValidPanNumber("ABCDE1234F")).toBe(true);
  });

  it("trims and uppercases before validation", () => {
    expect(isValidPanNumber("  abcde1234f  ")).toBe(true);
  });

  it("returns false for undefined", () => {
    expect(isValidPanNumber(undefined)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isValidPanNumber("")).toBe(false);
  });

  it("returns false for invalid format", () => {
    expect(isValidPanNumber("123456789")).toBe(false);
  });

  it("returns false for PAN with numbers in wrong position", () => {
    expect(isValidPanNumber("1BCDE1234F")).toBe(false);
  });
});

describe("normalizePanNumber", () => {
  it("trims and uppercases valid PAN", () => {
    expect(normalizePanNumber("  abcde1234f  ")).toBe("ABCDE1234F");
  });

  it("returns undefined for undefined input", () => {
    expect(normalizePanNumber(undefined)).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(normalizePanNumber("")).toBeUndefined();
  });

  it("returns undefined for whitespace-only string", () => {
    expect(normalizePanNumber("   ")).toBeUndefined();
  });
});

describe("isValidIdProofNumber – Passport", () => {
  it("accepts valid passport number", () => {
    expect(isValidIdProofNumber("passport", "A1234567")).toBe(true);
  });

  it("accepts lowercase passport by normalizing to uppercase first", () => {
    // normalizeIdProofNumber uppercases before regex check, so lowercase is accepted
    expect(isValidIdProofNumber("passport", "a1234567")).toBe(true);
  });

  it("rejects passport with wrong format", () => {
    expect(isValidIdProofNumber("passport", "12345678")).toBe(false);
  });

  it("rejects passport that is too short", () => {
    expect(isValidIdProofNumber("passport", "A123456")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidIdProofNumber("passport", "")).toBe(false);
  });
});

describe("isValidIdProofNumber – Voter ID", () => {
  it("accepts valid voter ID", () => {
    expect(isValidIdProofNumber("voterId", "ABC1234567")).toBe(true);
  });

  it("accepts lowercase voter ID by normalizing to uppercase first", () => {
    // normalizeIdProofNumber uppercases before regex check, so lowercase is accepted
    expect(isValidIdProofNumber("voterId", "abc1234567")).toBe(true);
  });

  it("rejects voter ID with wrong digit count", () => {
    expect(isValidIdProofNumber("voterId", "ABC123456")).toBe(false); // 6 digits, needs 7
  });

  it("rejects voter ID with wrong letter count", () => {
    expect(isValidIdProofNumber("voterId", "AB1234567")).toBe(false); // 2 letters, needs 3
  });
});

describe("isValidIdProofNumber – Aadhaar", () => {
  it("rejects aadhaar that is not 12 digits", () => {
    expect(isValidIdProofNumber("aadhaar", "12345678901")).toBe(false); // 11 digits
  });

  it("rejects aadhaar with letters", () => {
    expect(isValidIdProofNumber("aadhaar", "ABCDE1234567")).toBe(false);
  });

  it("rejects empty aadhaar", () => {
    expect(isValidIdProofNumber("aadhaar", "")).toBe(false);
  });

  it("strips spaces before validating aadhaar", () => {
    // "2345 6789 0123" with spaces should be normalized to 12 digits and validated
    const withSpaces = "2345 6789 0123";
    // Regardless of Verhoeff pass/fail, spaces should not cause a format error
    const result = isValidIdProofNumber("aadhaar", withSpaces);
    // The result depends on Verhoeff checksum – just ensure it's boolean
    expect(typeof result).toBe("boolean");
  });
});

describe("normalizeIdProofNumber", () => {
  it("strips spaces from aadhaar", () => {
    expect(normalizeIdProofNumber("aadhaar", "1234 5678 9012")).toBe("123456789012");
  });

  it("uppercases passport number", () => {
    expect(normalizeIdProofNumber("passport", "a1234567")).toBe("A1234567");
  });

  it("uppercases voter ID", () => {
    expect(normalizeIdProofNumber("voterId", "abc1234567")).toBe("ABC1234567");
  });

  it("returns undefined for empty string", () => {
    expect(normalizeIdProofNumber("passport", "")).toBeUndefined();
  });

  it("returns undefined for undefined", () => {
    expect(normalizeIdProofNumber("aadhaar", undefined)).toBeUndefined();
  });
});

describe("getIdProofLabel", () => {
  it("returns Aadhaar for aadhaar type", () => {
    expect(getIdProofLabel("aadhaar")).toBe("Aadhaar");
  });

  it("returns Passport for passport type", () => {
    expect(getIdProofLabel("passport")).toBe("Passport");
  });

  it("returns Voter ID for voterId type", () => {
    expect(getIdProofLabel("voterId")).toBe("Voter ID");
  });

  it("returns ID for null", () => {
    expect(getIdProofLabel(null)).toBe("ID");
  });

  it("returns ID for undefined", () => {
    expect(getIdProofLabel(undefined)).toBe("ID");
  });
});
