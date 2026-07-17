export class AppError extends Error {
  constructor(message, { status = 500, code = "INTERNAL_ERROR", details = null } = {}) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function asAppError(error) {
  if (error instanceof AppError) return error;

  if (error?.name === "APIConnectionTimeoutError") {
    return new AppError("GPT-5.6 took too long to finish. Try a smaller ticket set and retry.", {
      status: 504,
      code: "OPENAI_TIMEOUT",
    });
  }

  const status = Number(error?.status || 0);
  if (status === 401 || status === 403) {
    return new AppError("OpenAI rejected the server credential. Check the deployment secret and project access.", {
      status: 502,
      code: "OPENAI_AUTH_ERROR",
    });
  }
  if (status === 429) {
    return new AppError("OpenAI is temporarily rate-limiting this workspace. Wait a moment and retry.", {
      status: 429,
      code: "OPENAI_RATE_LIMIT",
    });
  }
  if (status >= 400 && status < 500) {
    return new AppError("The AI analysis request was rejected. Check the uploaded data and model access.", {
      status: 422,
      code: "OPENAI_REQUEST_ERROR",
    });
  }

  return new AppError("Something went wrong while analyzing the workspace. Please retry.", {
    status: 500,
    code: "INTERNAL_ERROR",
  });
}
