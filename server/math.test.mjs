import { describe, expect, it } from "vitest";
import {
  calculateCoverage,
  chunkDocuments,
  cosineSimilarity,
  countStatuses,
  kMeans,
  retrieveTopChunks,
} from "./math.mjs";

describe("documentation analysis math", () => {
  it("groups nearby vectors deterministically", () => {
    const { assignments, centroids } = kMeans([
      [1, 0],
      [0.96, 0.04],
      [0, 1],
      [0.03, 0.97],
    ], 2);

    expect(assignments[0]).toBe(assignments[1]);
    expect(assignments[2]).toBe(assignments[3]);
    expect(assignments[0]).not.toBe(assignments[2]);
    expect(centroids).toHaveLength(2);
  });

  it("retrieves the most semantically similar documentation chunk", () => {
    const chunks = [
      { id: "billing::0", sourceName: "billing.md", text: "Refund policy" },
      { id: "sso::0", sourceName: "sso.md", text: "SSO setup" },
    ];
    const result = retrieveTopChunks([1, 0], chunks, [[0.98, 0.02], [0, 1]], 1);

    expect(result[0].sourceName).toBe("billing.md");
    expect(cosineSimilarity([1, 0], [0.98, 0.02])).toBeGreaterThan(0.99);
  });

  it("chunks source documents without losing source names", () => {
    const chunks = chunkDocuments([
      { name: "policy.md", text: "First paragraph.\n\nSecond paragraph is longer." },
    ], 20);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.sourceName === "policy.md")).toBe(true);
    expect(chunks.map((chunk) => chunk.text).join(" ")).toContain("First paragraph");
  });

  it("uses conservative weighted coverage", () => {
    const items = [
      { status: "covered" },
      { status: "partial" },
      { status: "missing" },
      { status: "contradiction" },
    ];

    expect(calculateCoverage(items)).toBe(38);
    expect(countStatuses(items)).toEqual({ covered: 1, partial: 1, missing: 1, contradiction: 1 });
  });
});
