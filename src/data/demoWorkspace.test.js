import { describe, expect, it } from "vitest";
import {
  demoDraft,
  demoDraftsByCluster,
  demoReplay,
  demoReplaysByCluster,
} from "./demoWorkspace.js";

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

  it("bundles safe drafts and replay results for every draftable demo cluster", () => {
    expect(Object.keys(demoDraftsByCluster)).toEqual(["0", "1", "2", "3"]);
    expect(Object.keys(demoReplaysByCluster)).toEqual(["0", "1", "2", "3"]);

    for (const clusterId of [0, 1, 2, 3]) {
      expect(demoDraftsByCluster[clusterId].safeToDraft).toBe(true);
      expect(demoDraftsByCluster[clusterId].markdown).toMatch(/^# /);
      expect(demoReplaysByCluster[clusterId].evaluations.length).toBeGreaterThan(0);
      expect(demoReplaysByCluster[clusterId].evaluations.every((ticket) => ticket.ticketId)).toBe(true);
    }
  });
});
