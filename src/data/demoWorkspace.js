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

const bundledSampleProvenance = "Bundled Build Week judge sample based on the included synthetic tickets and reference documents.";

const seatChangesMarkdown = [
  "# Manage paid seats and recover workspace ownership",
  "",
  "## Who this applies to",
  "",
  "Workspace owners and admins who add or remove members, check seat billing, or need help after the workspace owner leaves the company.",
  "",
  "## Add or remove members",
  "",
  "1. Open **Settings > Members**.",
  "2. Invite a member to add access. A new paid member increases the seat count immediately.",
  "3. Added seats are prorated for the remaining billing period.",
  "4. Remove a member to revoke access immediately. The billed seat count also drops immediately.",
  "5. Credit for a removed paid seat appears on the next invoice.",
  "",
  "## Guests",
  "",
  "Read-only guests do not consume a paid Business seat. The guest limits shown on the plan page still apply.",
  "",
  "## Recover ownership",
  "",
  "If the workspace owner has left the company, a company-domain admin must contact support. Support verifies the admin before completing the ownership recovery workflow.",
  "",
  "## Important limitations",
  "",
  "This guidance does not define the proration formula, how credits appear as line items, the documents required for ownership verification, or the recovery completion time.",
  "",
  "## Related source notes",
  "",
  "Member access and guest seat behavior are documented in `admin-guide.md`. Billing adjustments and ownership recovery are based on consistently resolved outcomes U-4001 through U-4004.",
].join("\n");

const invoiceCorrectionsMarkdown = [
  "# Update billing details and correct invoices",
  "",
  "## Who this applies to",
  "",
  "Workspace owners who need to update legal details, add a VAT ID, download invoice records, or correct invoice information.",
  "",
  "## Update billing details",
  "",
  "1. Open **Billing profile**.",
  "2. Update the legal name, address, or VAT ID.",
  "3. The new details appear on future invoices and on the latest open invoice.",
  "",
  "## Correct a finalized invoice",
  "",
  "A finalized historical invoice cannot be edited. Contact support to request a correction note instead.",
  "",
  "## Download invoice records",
  "",
  "Open **Billing > Invoices**. Download an individual PDF, or choose **Download all CSV** for an annual invoice record.",
  "",
  "## Change billing currency",
  "",
  "A currency change applies from the next billing period. A finalized invoice cannot be reissued in a different currency.",
  "",
  "## Important limitations",
  "",
  "This guidance does not define correction-note processing time or whether a bulk ZIP of invoice PDFs is available.",
  "",
  "## Related source notes",
  "",
  "All rules and navigation paths are grounded in the Billing profile and invoices section of `billing-policy.md` and resolved outcomes I-2001 through I-2005.",
].join("\n");

const ssoSetupMarkdown = [
  "# Configure and maintain SAML SSO",
  "",
  "## Who this applies to",
  "",
  "Workspace admins on Business and Enterprise plans who configure SAML SSO, rotate certificates, enforce SSO, or verify multiple company domains.",
  "",
  "## Configure SAML SSO",
  "",
  "1. Open **Settings > Security > SAML SSO**.",
  "2. Copy the workspace ACS URL and Entity ID into the identity provider.",
  "3. Paste the IdP metadata URL or upload its metadata XML.",
  "4. Upload the active signing certificate.",
  "5. Verify every company domain that should use SSO. Multiple domains are supported, but each domain must be verified separately.",
  "6. Test with a non-admin account.",
  "7. Confirm that a recovery admin can still sign in, then enable **Enforce SSO**.",
  "",
  "## Replace an expired or rotated certificate",
  "",
  "Upload the replacement IdP signing certificate and test the connection before enforcing SSO again.",
  "",
  "## Important limitations",
  "",
  "SAML SSO is not available on the Pro plan. This guidance does not define identity-provider-specific field names beyond the workspace ACS URL, Entity ID, metadata, and signing certificate.",
  "",
  "## Related source notes",
  "",
  "Plan eligibility, setup, certificate rotation, enforcement safeguards, and separate domain verification are grounded in `admin-guide.md` and resolved outcomes S-3001 through S-3005.",
].join("\n");

export const demoDraftsByCluster = {
  0: demoDraft,
  1: {
    safeToDraft: true,
    title: "Update billing details and correct invoices",
    summary: "Clarifies editable billing details, finalized-invoice corrections, bulk records, and currency changes.",
    markdown: invoiceCorrectionsMarkdown,
    sourceBasis: ["billing-policy.md", "Resolved outcomes I-2001 through I-2005"],
    blockingConflicts: [],
    unansweredQuestions: ["How long does a correction note take?", "Can owners download all invoice PDFs in one archive?"],
    sampleProvenance: bundledSampleProvenance,
  },
  2: {
    safeToDraft: true,
    title: "Configure and maintain SAML SSO",
    summary: "Makes plan eligibility, certificate rotation, recovery access, and per-domain verification explicit.",
    markdown: ssoSetupMarkdown,
    sourceBasis: ["admin-guide.md", "Resolved outcomes S-3001 through S-3005"],
    blockingConflicts: [],
    unansweredQuestions: ["Which identity providers have provider-specific setup guides?"],
    sampleProvenance: bundledSampleProvenance,
  },
  3: {
    safeToDraft: true,
    title: "Manage paid seats and recover workspace ownership",
    summary: "Adds seat proration, removal credits, guest behavior, and the supported ownership-recovery path.",
    markdown: seatChangesMarkdown,
    sourceBasis: ["admin-guide.md", "Resolved outcomes U-4001 through U-4004"],
    blockingConflicts: [],
    unansweredQuestions: ["What proration formula is used?", "What evidence is required for ownership recovery?"],
    sampleProvenance: bundledSampleProvenance,
  },
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
    ticketId: ticket.id,
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

const replayEvaluation = (ticket, status, rationale, missingInformation = []) => ({
  ...ticket,
  ticketId: ticket.id,
  status,
  confidence: status === "covered" ? 0.96 : 0.92,
  rationale,
  missingInformation,
  sourceNames: [sourceByCluster[ticket.clusterId], "Proposed patch"],
});

const replayTickets = (clusterId, evaluations) => demoTickets
  .filter((ticket) => ticket.clusterId === clusterId)
  .map((ticket) => {
    const evaluation = evaluations[ticket.id];
    return replayEvaluation(ticket, evaluation.status, evaluation.rationale, evaluation.missingInformation);
  });

export const demoReplaysByCluster = {
  0: demoReplay,
  1: {
    evaluations: replayTickets(1, {
      "I-2001": { status: "covered", rationale: "The patch explains where owners update legal details and that the latest open invoice receives the change." },
      "I-2002": { status: "covered", rationale: "The patch directs owners to Billing profile and states that the VAT ID appears on future invoices." },
      "I-2003": { status: "covered", rationale: "The patch states that finalized invoices cannot be edited and directs the owner to request a correction note." },
      "I-2004": { status: "covered", rationale: "The patch provides both the individual PDF and Download all CSV options under Billing > Invoices." },
      "I-2005": { status: "covered", rationale: "The patch states that currency changes start next period and finalized invoices cannot be reissued." },
    }),
    summary: "The clarified article answers all five historical invoice questions without requiring an agent to infer a rule.",
    remainingRisks: ["Correction-note timing and bulk PDF availability remain undocumented."],
    beforeCoverage: 80,
    afterCoverage: 100,
    answerableBefore: 3,
    answerableAfter: 5,
    improvedCount: 2,
    projected: true,
    models: { model: "gpt-5.6", embeddingModel: "text-embedding-3-small" },
    sampleProvenance: bundledSampleProvenance,
  },
  2: {
    evaluations: replayTickets(2, {
      "S-3001": { status: "covered", rationale: "The patch includes the ACS URL, Entity ID, metadata, certificate, domain verification, and testing sequence." },
      "S-3002": { status: "covered", rationale: "The patch tells admins to upload a replacement signing certificate and retest before enforcing SSO." },
      "S-3003": { status: "covered", rationale: "The patch requires a successful test and a verified recovery-admin login before Enforce SSO is enabled." },
      "S-3004": { status: "covered", rationale: "The patch clearly limits SAML SSO to Business and Enterprise plans." },
      "S-3005": { status: "covered", rationale: "The patch makes clear that multiple domains are supported and every domain is verified separately." },
    }),
    summary: "The rewritten setup sequence makes the separate verification requirement explicit for all five historical SSO questions.",
    remainingRisks: ["Identity-provider-specific field names may still require separate guides."],
    beforeCoverage: 90,
    afterCoverage: 100,
    answerableBefore: 4,
    answerableAfter: 5,
    improvedCount: 1,
    projected: true,
    models: { model: "gpt-5.6", embeddingModel: "text-embedding-3-small" },
    sampleProvenance: bundledSampleProvenance,
  },
  3: {
    evaluations: replayTickets(3, {
      "U-4001": { status: "covered", rationale: "The patch states that removal changes the seat count immediately and that the credit appears on the next invoice." },
      "U-4002": { status: "covered", rationale: "The patch states that added paid seats are prorated for the remaining billing period." },
      "U-4003": { status: "partial", rationale: "The patch identifies company-domain admin verification and support ownership recovery, but not the required evidence or contact path.", missingInformation: ["Ownership verification evidence and support contact path"] },
      "U-4004": { status: "covered", rationale: "The patch states that read-only Business guests do not consume paid seats, subject to plan limits." },
    }),
    summary: "Three of four seat questions are fully answerable. Ownership recovery remains partial because the verification evidence is not documented.",
    remainingRisks: ["Define the ownership-recovery evidence, contact path, and expected completion time."],
    beforeCoverage: 38,
    afterCoverage: 88,
    answerableBefore: 1,
    answerableAfter: 3,
    improvedCount: 3,
    projected: true,
    models: { model: "gpt-5.6", embeddingModel: "text-embedding-3-small" },
    sampleProvenance: bundledSampleProvenance,
  },
};
