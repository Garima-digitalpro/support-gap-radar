import { createHandler } from "../../server/http.mjs";
import { replayPatch } from "../../server/workflows.mjs";

export default createHandler(replayPatch, { maxBytes: 1_500_000 });
