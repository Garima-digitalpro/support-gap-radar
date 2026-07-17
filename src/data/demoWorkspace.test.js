import { describe, expect, it } from "vitest";
import { demoDraft, demoReplay } from "./demoWorkspace.js";

describe("verified judge sample", () => {
  it("contains a complete evidence-grounded article with provenance", () => {
    expect(demoDraft.safeToDraft).toBe(true);
    expect(demoDraft.markdown).toContain("# Refunds after cancellation");
    expect(demoDraft.sourceBasis).toContain("billing-policy.md");
    expect(demoDraft.sampleProvenance).toContain("GPT-5.6");
  });

  it("replays all 14 refund questions with a conservative residual gap", () => {
    expect(demoReplay.evaluations).toHaveLength(14);
    expect(demoReplay.evaluations.filter((ticket) => ticket.status === "covered")).toHaveLength(13);
    expect(demoReplay.evaluations.find((ticket) => ticket.id === "R-1008")?.status).toBe("partial");
    expect(demoReplay.afterCoverage).toBe(96);
    expect(demoReplay.improvedCount).toBe(9);
  });
});
