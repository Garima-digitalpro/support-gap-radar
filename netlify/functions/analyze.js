import { createHandler } from "../../server/http.mjs";
import { analyzeWorkspace } from "../../server/workflows.mjs";

export default createHandler(analyzeWorkspace, { maxBytes: 1_500_000 });
