import fs from "node:fs/promises";
import path from "node:path";
import Papa from "papaparse";
import { analyzeWorkspace } from "../server/workflows.mjs";

const root = process.cwd();
const sampleDirectory = path.join(root, "samples", "saas-billing");
const ticketCsv = await fs.readFile(path.join(sampleDirectory, "tickets.csv"), "utf8");
const billingPolicy = await fs.readFile(path.join(sampleDirectory, "billing-policy.md"), "utf8");
const rows = Papa.parse(ticketCsv, { header: true, skipEmptyLines: true }).data.slice(0, 6);

const result = await analyzeWorkspace({
  tickets: rows.map((row) => ({
    id: row.id,
    subject: row.subject,
    description: row.description,
    resolution: row.resolution,
    priority: row.priority,
    createdAt: row.created_at,
  })),
  documents: [{ name: "billing-policy.md", text: billingPolicy }],
});

console.log(JSON.stringify({
  ok: true,
  model: result.models.model,
  embeddingModel: result.models.embeddingModel,
  ticketCount: result.tickets.length,
  clusterCount: result.clusters.length,
  coverage: result.overallCoverage,
}, null, 2));
