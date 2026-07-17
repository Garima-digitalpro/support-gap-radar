export class ApiError extends Error {
  constructor(message, code = "API_ERROR", status = 500) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export async function postJson(path, payload) {
  let response;
  try {
    response = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ApiError("The application server is unreachable. Check your connection and retry.", "NETWORK_ERROR", 0);
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw new ApiError("The application server returned an unreadable response.", "INVALID_RESPONSE", response.status);
  }

  if (!response.ok) {
    throw new ApiError(
      body?.error?.message || "The request could not be completed.",
      body?.error?.code || "REQUEST_FAILED",
      response.status,
    );
  }
  return body.data;
}
