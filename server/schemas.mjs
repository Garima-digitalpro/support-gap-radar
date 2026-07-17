import { z } from "zod";

export const CoverageStatus = z.enum(["covered", "partial", "missing", "contradiction"]);

export const TicketEvaluation = z.object({
  ticketId: z.string(),
  status: CoverageStatus,
  confidence: z.number().min(0).max(1),
  rationale: z.string(),
  missingInformation: z.array(z.string()),
  sourceNames: z.array(z.string()),
});

export const CoverageAuditSchema = z.object({
  evaluations: z.array(TicketEvaluation),
  clusterSummaries: z.array(
    z.object({
      clusterId: z.number().int().nonnegative(),
      label: z.string(),
      whyItFails: z.string(),
      evidence: z.array(z.string()),
      bestSource: z.string(),
      safeToDraft: z.boolean(),
      conflicts: z.array(z.string()),
    }),
  ),
});

export const DraftPatchSchema = z.object({
  safeToDraft: z.boolean(),
  title: z.string(),
  summary: z.string(),
  markdown: z.string(),
  sourceBasis: z.array(z.string()),
  blockingConflicts: z.array(z.string()),
  unansweredQuestions: z.array(z.string()),
});

export const ReplaySchema = z.object({
  evaluations: z.array(TicketEvaluation),
  summary: z.string(),
  remainingRisks: z.array(z.string()),
});
