import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn (className utility)", () => {
  it("returns a single class unchanged", () => {
    expect(cn("text-red-500")).toBe("text-red-500");
  });

  it("merges multiple class strings", () => {
    const result = cn("p-4", "m-2");
    expect(result).toContain("p-4");
    expect(result).toContain("m-2");
  });

  it("deduplicates conflicting Tailwind classes (last wins)", () => {
    // tailwind-merge resolves conflicts: p-2 and p-4 → p-4
    const result = cn("p-2", "p-4");
    expect(result).toBe("p-4");
  });

  it("removes conflicting text color (last wins)", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("ignores falsy values", () => {
    const result = cn("text-sm", false, undefined, null, "font-bold");
    expect(result).toBe("text-sm font-bold");
  });

  it("handles conditional classes via object syntax", () => {
    const isActive = true;
    const result = cn({ "bg-green-500": isActive, "bg-gray-200": !isActive });
    expect(result).toBe("bg-green-500");
  });

  it("handles array of classes", () => {
    const result = cn(["text-lg", "font-semibold"]);
    expect(result).toBe("text-lg font-semibold");
  });

  it("returns empty string when no classes provided", () => {
    expect(cn()).toBe("");
  });

  it("handles nested arrays and conditions", () => {
    const result = cn("base", ["text-sm", false && "hidden"], { "font-bold": true });
    expect(result).toContain("base");
    expect(result).toContain("text-sm");
    expect(result).toContain("font-bold");
    expect(result).not.toContain("hidden");
  });
});
