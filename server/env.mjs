import fs from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";

let loaded = false;

export function loadLocalEnvironment() {
  if (loaded) return;
  loaded = true;

  const candidates = [
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), "../.env.local"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      loadEnv({ path: candidate, override: false, quiet: true });
    }
  }
}
