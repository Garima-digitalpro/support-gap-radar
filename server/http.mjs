import { AppError, asAppError } from "./errors.mjs";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

async function readJson(request, maxBytes = 1_500_000) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > maxBytes) {
    throw new AppError("The request is larger than this MVP accepts.", {
      status: 413,
      code: "REQUEST_TOO_LARGE",
    });
  }
  try {
    return await request.json();
  } catch {
    throw new AppError("Send a valid JSON request body.", {
      status: 400,
      code: "INVALID_JSON",
    });
  }
}

export function createHandler(workflow, { maxBytes } = {}) {
  return async function handler(request) {
    if (request.method === "OPTIONS") return jsonResponse({ ok: true });
    if (request.method !== "POST") {
      return jsonResponse({ error: { code: "METHOD_NOT_ALLOWED", message: "Use POST for this endpoint." } }, 405);
    }

    try {
      const payload = await readJson(request, maxBytes);
      const result = await workflow(payload);
      return jsonResponse({ data: result });
    } catch (error) {
      const safe = asAppError(error);
      return jsonResponse(
        {
          error: {
            code: safe.code,
            message: safe.message,
            details: safe.details,
          },
        },
        safe.status,
      );
    }
  };
}
