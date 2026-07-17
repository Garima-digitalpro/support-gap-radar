import { AppError } from "./errors.mjs";

export async function parseLegacyWord(payload) {
  const name = String(payload?.name || "document.doc");
  const base64 = String(payload?.base64 || "");
  if (!name.toLowerCase().endsWith(".doc") || !base64) {
    throw new AppError("A legacy .doc file is required.", {
      status: 422,
      code: "INVALID_LEGACY_DOCUMENT",
    });
  }
  if (base64.length > 4_000_000) {
    throw new AppError("Legacy Word files must be smaller than 3 MB.", {
      status: 413,
      code: "LEGACY_DOCUMENT_TOO_LARGE",
    });
  }

  try {
    const module = await import("word-extractor");
    const WordExtractor = module.default || module;
    const extractor = new WordExtractor();
    const document = await extractor.extract(Buffer.from(base64, "base64"));
    const text = document.getBody().replaceAll(String.fromCharCode(0), "").trim();
    if (!text) throw new Error("empty document");
    return { name, text };
  } catch {
    throw new AppError("This .doc file could not be read. Try saving it as .docx and upload again.", {
      status: 422,
      code: "LEGACY_DOCUMENT_PARSE_FAILED",
    });
  }
}
