import { createHandler } from "../../server/http.mjs";
import { parseLegacyWord } from "../../server/legacy-doc.mjs";

export default createHandler(parseLegacyWord, { maxBytes: 4_200_000 });
