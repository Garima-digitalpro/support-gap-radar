import { createHandler } from "../../server/http.mjs";
import { draftPatch } from "../../server/workflows.mjs";

export default createHandler(draftPatch, { maxBytes: 1_500_000 });
