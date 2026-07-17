import { describe, expect, it, vi } from "vitest";
import { AppError } from "./errors.mjs";
import { createHandler } from "./http.mjs";

describe("serverless HTTP handler", () => {
  it("returns workflow data for a JSON POST", async () => {
    const workflow = vi.fn(async (payload) => ({ received: payload.value }));
    const response = await createHandler(workflow)(new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value: 7 }),
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: { received: 7 } });
  });

  it("rejects unsupported methods", async () => {
    const response = await createHandler(vi.fn())(new Request("http://localhost/api/test"));
    expect(response.status).toBe(405);
    await expect(response.json()).resolves.toMatchObject({ error: { code: "METHOD_NOT_ALLOWED" } });
  });

  it("converts expected application errors to safe responses", async () => {
    const workflow = vi.fn(async () => {
      throw new AppError("Upload at least four tickets.", { status: 422, code: "TOO_FEW_TICKETS" });
    });
    const response = await createHandler(workflow)(new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    }));

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "TOO_FEW_TICKETS", message: "Upload at least four tickets." },
    });
  });

  it("rejects malformed JSON", async () => {
    const response = await createHandler(vi.fn())(new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "not-json",
    }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: { code: "INVALID_JSON" } });
  });
});
