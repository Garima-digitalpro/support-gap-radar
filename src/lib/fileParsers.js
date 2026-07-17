import Papa from "papaparse";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { postJson } from "./api.js";

const MAX_TICKET_FILE_BYTES = 2_000_000;
const MAX_DOCUMENT_FILE_BYTES = 3_000_000;
const MAX_DOCUMENT_TEXT = 50_000;

function normalizedRow(row) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      String(key).trim().toLowerCase().replace(/[\s-]+/g, "_"),
      String(value ?? "").trim(),
    ]),
  );
}

function first(row, keys) {
  for (const key of keys) {
    if (row[key]) return row[key];
  }
  return "";
}

export function parseTicketsCsvText(text) {
  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.trim(),
  });

  if (result.errors.length) {
    const serious = result.errors.find((error) => error.type !== "FieldMismatch");
    if (serious) throw new Error(`CSV row ${serious.row + 2}: ${serious.message}`);
  }

  const tickets = result.data.map(normalizedRow).map((row, index) => ({
    id: first(row, ["id", "ticket_id", "case_id", "conversation_id"]) || `ticket-${index + 1}`,
    subject: first(row, ["subject", "title", "topic"]) || "Untitled ticket",
    description: first(row, ["description", "body", "question", "message", "request"]),
    resolution: first(row, ["resolution", "outcome", "answer", "final_reply", "solution"]),
    priority: first(row, ["priority", "severity"]) || "normal",
    createdAt: first(row, ["created_at", "created", "date", "timestamp"]),
  }));

  if (!tickets.length) throw new Error("The CSV does not contain any ticket rows.");
  const missingDescription = tickets.findIndex((ticket) => !ticket.description);
  if (missingDescription >= 0) {
    throw new Error(`Ticket row ${missingDescription + 2} needs a description, body, question, or message column.`);
  }
  return tickets;
}

export async function parseTicketsFile(file) {
  if (!file || file.size > MAX_TICKET_FILE_BYTES) {
    throw new Error("Ticket CSV files must be smaller than 2 MB.");
  }
  if (!file.name.toLowerCase().endsWith(".csv")) {
    throw new Error("Tickets must be uploaded as a CSV file.");
  }
  return parseTicketsCsvText(await file.text());
}

async function parsePdf(file) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  const pdf = await task.promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => item.str).join(" "));
  }
  await pdf.destroy();
  return pages.join("\n\n");
}

async function parseDocx(file) {
  const module = await import("mammoth/mammoth.browser");
  const mammoth = module.default || module;
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return result.value;
}

function arrayBufferToBase64(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let start = 0; start < bytes.length; start += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(start, start + chunkSize));
  }
  return window.btoa(binary);
}

async function parseLegacyDoc(file) {
  return postJson("/api/parse-document", {
    name: file.name,
    base64: arrayBufferToBase64(await file.arrayBuffer()),
  });
}

export async function parseDocumentFile(file) {
  if (!file || file.size > MAX_DOCUMENT_FILE_BYTES) {
    throw new Error("Documentation files must be smaller than 3 MB each.");
  }

  const extension = file.name.toLowerCase().split(".").pop();
  let text;
  if (["md", "markdown", "txt"].includes(extension)) text = await file.text();
  else if (extension === "pdf") text = await parsePdf(file);
  else if (extension === "docx") text = await parseDocx(file);
  else if (extension === "doc") return parseLegacyDoc(file);
  else throw new Error("Supported documentation formats are Markdown, text, PDF, .doc, and .docx.");

  const normalized = String(text || "").replaceAll(String.fromCharCode(0), "").trim();
  if (!normalized) throw new Error(`${file.name} did not contain readable text.`);
  return {
    name: file.name,
    type: file.type || `application/${extension}`,
    text: normalized.slice(0, MAX_DOCUMENT_TEXT),
  };
}

export function exportMarkdown(filename, markdown) {
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + ".md";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
