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
