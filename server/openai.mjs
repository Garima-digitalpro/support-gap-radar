import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { loadLocalEnvironment } from "./env.mjs";
import { AppError, asAppError } from "./errors.mjs";

let client;

export function getModels() {
  loadLocalEnvironment();
  return {
    model: process.env.OPENAI_MODEL || "gpt-5.6",
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
  };
}

export function getOpenAIClient() {
  loadLocalEnvironment();
  if (!process.env.OPENAI_API_KEY) {
    throw new AppError("This deployment is missing its server-side OpenAI API key.", {
      status: 503,
      code: "OPENAI_NOT_CONFIGURED",
    });
  }
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 27_000,
      maxRetries: 0,
    });
  }
  return client;
}

export async function embedTexts(texts) {
  const openai = getOpenAIClient();
  const { embeddingModel } = getModels();
  const vectors = [];

  try {
    for (let start = 0; start < texts.length; start += 100) {
      const batch = texts.slice(start, start + 100);
      const response = await openai.embeddings.create({
        model: embeddingModel,
        input: batch,
        encoding_format: "float",
      });
      vectors.push(...response.data.map((item) => item.embedding));
    }
    return vectors;
  } catch (error) {
    throw asAppError(error);
  }
}

export async function parseStructured({
  schema,
  schemaName,
  system,
  payload,
  maxOutputTokens = 6_000,
}) {
  const openai = getOpenAIClient();
  const { model } = getModels();

  try {
    const response = await openai.responses.parse({
      model,
      store: false,
      max_output_tokens: maxOutputTokens,
      reasoning: { effort: "low" },
      input: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(payload) },
      ],
      text: {
        verbosity: "low",
        format: zodTextFormat(schema, schemaName),
      },
    });

    if (!response.output_parsed) {
      throw new AppError("GPT-5.6 did not return a usable structured result.", {
        status: 502,
        code: "EMPTY_MODEL_OUTPUT",
      });
    }
    return response.output_parsed;
  } catch (error) {
    throw asAppError(error);
  }
}
