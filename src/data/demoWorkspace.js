import Papa from "papaparse";
import ticketsCsv from "../../samples/saas-billing/tickets.csv?raw";
import billingPolicy from "../../samples/saas-billing/billing-policy.md?raw";
import adminGuide from "../../samples/saas-billing/admin-guide.md?raw";
import analyticsExport from "../../samples/saas-billing/analytics-export.md?raw";

const rows = Papa.parse(ticketsCsv, { header: true, skipEmptyLines: true }).data;

const clusterForId = (id) => {
  if (id.startsWith("R-")) return 0;
  if (id.startsWith("I-")) return 1;
  if (id.startsWith("S-")) return 2;
  if (id.startsWith("U-")) return 3;
  return 4;
};

const statusById = new Map([
  ["R-1001", "covered"], ["R-1002", "covered"], ["R-1003", "covered"],
  ["R-1004", "covered"], ["R-1005", "covered"],
  ["R-1006", "missing"], ["R-1007", "missing"], ["R-1008", "missing"],
  ["R-1009", "missing"], ["R-1010", "missing"], ["R-1011", "missing"],
  ["R-1012", "missing"], ["R-1013", "missing"], ["R-1014", "missing"],
  ["I-2001", "covered"], ["I-2002", "covered"], ["I-2003", "covered"],
  ["I-2004", "partial"], ["I-2005", "partial"],
  ["S-3001", "covered"], ["S-3002", "covered"], ["S-3003", "covered"],
  ["S-3004", "covered"], ["S-3005", "partial"],
  ["U-4001", "partial"], ["U-4002", "partial"], ["U-4003", "missing"],
  ["U-4004", "covered"],
  ["E-5001", "covered"], ["E-5002", "contradiction"],
  ["E-5003", "contradiction"], ["E-5004", "partial"],
]);

const sourceByCluster = [
  "billing-policy.md",
  "billing-policy.md",
  "admin-guide.md",
  "admin-guide.md",
  "analytics-export.md",
];

const rationaleByStatus = {
  covered: "The current documentation contains the required rule or steps.",
  partial: "The document is relevant but omits a condition needed for a complete answer.",
  missing: "The current documentation does not define the policy needed to answer this question.",
  contradiction: "The documented limit conflicts with resolved Enterprise support outcomes.",
};

export const demoTickets = rows.map((row) => {
  const clusterId = clusterForId(row.id);
  const status = statusById.get(row.id) || "missing";
  return {
    id: row.id,
    subject: row.subject,
    description: row.description,
    resolution: row.resolution,
    priority: row.priority,
    createdAt: row.created_at,
    clusterId,
    status,
    confidence: status === "contradiction" ? 0.98 : 0.91,
    rationale: rationaleByStatus[status],
    missingInformation: status === "covered" ? [] : ["Explicit eligibility, timing, or limitation"],
    sourceNames: [sourceByCluster[clusterId]],
  };
});

const count = (clusterId, status) =>
  demoTickets.filter((ticket) => ticket.clusterId === clusterId && ticket.status === status).length;

const cluster = (clusterId, values) => ({
  clusterId,
  ticketIds: demoTickets.filter((ticket) => ticket.clusterId === clusterId).map((ticket) => ticket.id),
  ticketCount: demoTickets.filter((ticket) => ticket.clusterId === clusterId).length,
  counts: {
    covered: count(clusterId, "covered"),
    partial: count(clusterId, "partial"),
    missing: count(clusterId, "missing"),
    contradiction: count(clusterId, "contradiction"),
  },
  ...values,
});

export const demoDocuments = [
  { name: "billing-policy.md", text: billingPolicy, type: "text/markdown" },
  { name: "admin-guide.md", text: adminGuide, type: "text/markdown" },
  { name: "analytics-export.md", text: analyticsExport, type: "text/markdown" },
];

export const demoAnalysis = {
  workspaceId: "demo-saas-support",
  analyzedAt: "2026-07-17T08:30:00.000Z",
  tickets: demoTickets,
  clusters: [
    cluster(0, {
      label: "Refund after cancellation",
      coverage: 36,
      missingRate: 64,
      projectedCoverage: 86,
      projectedAnswerable: 12,
      whyItFails: "The doc explains cancellation, but not refund eligibility or timing after cancellation.",
      evidence: [
        "Customers ask whether refunds are prorated after cancelling.",
        "Renewal-day and accidental-renewal exceptions are undocumented.",
        "No guidance covers approval timing or failed cards.",
      ],
      bestSource: "billing-policy.md",
      safeToDraft: true,
      conflicts: [],
    }),
    cluster(4, {
      label: "Export limits",
      coverage: 38,
      missingRate: 50,
      projectedCoverage: null,
      whyItFails: "The documented 10,000-row limit conflicts with Enterprise resolutions.",
      evidence: ["Two Enterprise tickets were resolved with a 50,000-row entitlement."],
      bestSource: "analytics-export.md",
      safeToDraft: false,
      conflicts: ["Documentation says every plan is capped at 10,000 rows; support applied 50,000 for Enterprise."],
    }),
    cluster(3, {
      label: "Seat changes",
      coverage: 38,
      missingRate: 25,
      projectedCoverage: null,
      whyItFails: "Seat billing adjustments and ownership recovery are not documented.",
      evidence: ["Agents explain proration and credits manually."],
      bestSource: "admin-guide.md",
      safeToDraft: true,
      conflicts: [],
    }),
    cluster(1, {
      label: "Invoice corrections",
      coverage: 80,
      missingRate: 0,
      projectedCoverage: null,
      whyItFails: "Currency and bulk-download limitations need clearer wording.",
      evidence: ["Two invoice questions require support clarification."],
      bestSource: "billing-policy.md",
      safeToDraft: true,
      conflicts: [],
    }),
    cluster(2, {
      label: "SSO setup",
      coverage: 90,
      missingRate: 0,
      projectedCoverage: null,
      whyItFails: "Multiple-domain behavior is described but easy to miss.",
      evidence: ["One ticket needed a clarification about verifying each domain."],
      bestSource: "admin-guide.md",
      safeToDraft: true,
      conflicts: [],
    }),
  ],
  overallCoverage: 58,
  overallCounts: { covered: 14, partial: 6, missing: 10, contradiction: 2 },
  sourceCount: 3,
  chunkCount: 9,
  models: { model: "gpt-5.6", embeddingModel: "text-embedding-3-small" },
};

export const demoWorkspace = {
  tickets: demoTickets.map((ticket) => ({
    id: ticket.id,
    subject: ticket.subject,
    description: ticket.description,
    resolution: ticket.resolution,
    priority: ticket.priority,
    createdAt: ticket.createdAt,
  })),
  documents: demoDocuments,
};

const demoMarkdown = [
  "# Refunds after cancellation",
  "",
  "## Who this applies to",
  "",
  "Workspace owners who cancel a monthly or annual paid subscription, accidentally renew, or downgrade from Business to Pro.",
  "",
  "## Prerequisites",
  "",
  "- Only the workspace owner can cancel a subscription.",
  "- Refund eligibility depends on the purchase history, request timing, and—in some renewal cases—usage.",
  "",
  "## Cancellation and refund rules",
  "",
  "1. To cancel, go to **Settings > Billing > Manage subscription > Cancel plan** and confirm.",
  "2. Cancellation normally takes effect at the end of the current billing period. The workspace remains active until then.",
  "3. A full refund may be approved when requested within 14 days of the workspace’s first paid subscription purchase. This applies to monthly and annual plans.",
  "4. The 14-day window applies only to the first paid subscription per workspace. It does not restart if the workspace later subscribes again.",
  "5. Refunds are not prorated for unused time outside the 14-day first-purchase window.",
  "6. If cancellation occurred before the renewal cutoff timestamp but a renewal charge was still processed, the charge may be refunded.",
  "7. An accidental renewal may receive a one-time refund when requested within 48 hours and there has been no usage after renewal.",
  "8. When downgrading from Business to Pro, the unused Business portion is issued as account credit rather than a cash refund.",
  "",
  "## After a refund is approved",
  "",
  "- The refund must return to the original payment method.",
  "- If the original card is closed, contact the card issuer.",
  "- Refunds generally appear 5–10 business days after approval, depending on the bank.",
  "",
  "## Important limitations",
  "",
  "Cancellation alone does not guarantee a refund. Eligibility is determined separately under the rules above. This policy does not define failed-card handling.",
  "",
  "## Examples",
  "",
  "- **Annual plan cancelled after two weeks:** A full refund may be approved if this was the workspace’s first paid subscription and the request was within 14 days.",
  "- **Ten unused months remaining:** No prorated refund is provided outside the 14-day first-purchase window.",
  "- **Renewed yesterday by mistake:** A one-time refund may be approved if requested within 48 hours and the workspace was not used after renewal.",
  "- **Business downgraded to Pro:** The unused Business portion is applied as account credit, not returned as cash.",
  "",
  "## Related source notes",
  "",
  "Cancellation access, owner permissions, reactivation, and post-cancellation workspace status are documented in `billing-policy.md`. Refund rules are based on consistently resolved support outcomes R-1006 through R-1014.",
].join("\n");

export const demoDraft = {
  safeToDraft: true,
  title: "Refunds after cancellation",
  summary: "Adds refund eligibility, renewal exceptions, downgrade credits, refund destination, and timing.",
  markdown: demoMarkdown,
  sourceBasis: [
    "billing-policy.md",
    "R-1001 through R-1005: documented cancellation behavior",
    "R-1006 through R-1014: resolved refund, renewal, credit, destination, and timing outcomes",
  ],
  blockingConflicts: [],
  unansweredQuestions: [
    "What exact timestamp defines the renewal cutoff, and where can owners view it?",
    "How should owners submit a refund request?",
    "What is the failed-card handling policy?",
  ],
  sampleProvenance: "Generated with GPT-5.6 during the verified build session.",
};

const replayRationales = {
  "R-1001": "The documentation states that cancellation takes effect at period end and access remains active until then.",
  "R-1002": "The exact cancellation navigation path is documented.",
  "R-1003": "The documentation states that only the workspace owner can cancel.",
  "R-1004": "The owner can reactivate from Billing before the paid period ends.",
  "R-1005": "The documentation explains that the workspace becomes read-only for 30 days after the paid period.",
  "R-1006": "The patch defines a 14-day first-purchase refund window for annual plans, subject to confirming first-purchase status and exact timing.",
  "R-1007": "The patch explicitly denies prorated refunds for unused time outside the 14-day first-purchase window.",
  "R-1008": "The patch provides a refund rule for cancellation before the renewal cutoff, but it does not define the cutoff timestamp or explain how to verify it.",
  "R-1009": "The patch documents the one-time accidental-renewal exception, its 48-hour limit, and the no-usage condition.",
  "R-1010": "The patch explicitly states that the 14-day first-purchase window applies to monthly and annual plans.",
  "R-1011": "The patch states that the 14-day window applies only to the workspace's first paid subscription and does not restart.",
  "R-1012": "The patch specifies account credit for the unused Business portion rather than a cash refund.",
  "R-1013": "The patch requires return to the original payment method and directs customers with closed cards to the issuer.",
  "R-1014": "The patch gives a refund arrival estimate of 5–10 business days after approval, depending on the bank.",
};

export const demoReplay = {
  evaluations: demoTickets.filter((ticket) => ticket.clusterId === 0).map((ticket) => ({
    ...ticket,
    status: ticket.id === "R-1008" ? "partial" : "covered",
    confidence: ticket.id === "R-1008" ? 0.92 : 0.96,
    rationale: replayRationales[ticket.id],
    missingInformation: ticket.id === "R-1008" ? ["Defined and verifiable renewal cutoff"] : [],
    sourceNames: ["billing-policy.md", "Proposed patch"],
  })),
  summary: "The combined documentation covers 13 of 14 tickets. The renewal-day scenario is only partially answerable because the renewal cutoff is not defined or verifiable from the documentation.",
  remainingRisks: ["Define the renewal cutoff timestamp and how owners can verify it."],
  beforeCoverage: 36,
  afterCoverage: 96,
  answerableBefore: 5,
  answerableAfter: 13,
  improvedCount: 9,
  projected: true,
  models: { model: "gpt-5.6", embeddingModel: "text-embedding-3-small" },
  sampleProvenance: "Generated with GPT-5.6 during the verified build session.",
};
