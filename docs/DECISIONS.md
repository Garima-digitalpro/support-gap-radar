# Decision log

## D001 — Treat tickets as tests, not training data

The product is positioned as documentation regression testing. Historical customer questions are replayable test cases. This differentiates the core interaction from support-platform article generators.

## D002 — Show projected coverage, not promised deflection

The UI labels before/after values as documentation coverage and clearly marks the after value as projected. It never claims guaranteed ticket deflection or financial impact.

## D003 — Separate semantic retrieval from policy judgment

OpenAI embeddings locate related tickets and documentation chunks. GPT-5.6 then evaluates whether the retrieved content fully answers a question. Similarity alone is never presented as proof of coverage.

## D004 — Make contradictions first-class

Coverage has four states: covered, partial, missing, and contradiction. Draft generation is blocked when historical resolutions or documentation conflict, preventing the model from inventing a policy.

## D005 — Keep the key server-side

The browser calls Netlify Functions. `OPENAI_API_KEY` is read only on the server, never exposed through a `VITE_` variable, bundled JavaScript, or repository file.

## D006 — Use an immediately explorable sample state

The app opens with a realistic, precomputed SaaS-support radar so judges see the product value immediately. Uploading and analyzing new data invokes the live OpenAI workflow.

## D007 — Isolate the hackathon repository

The project lives in `support-gap-radar/` because the parent workspace contains unrelated projects. This keeps the eventual GitHub repository clean and judge-testable.

## D008 — Keep the AI contract structured

All three GPT-5.6 workflows use Zod-backed Structured Outputs: coverage audit, patch drafting, and historical replay. This makes every status and explanation explicit, validates model output before it reaches the UI, and avoids brittle JSON extraction.

## D009 — Optimize for a first-time hackathon demo

The MVP uses recorded files rather than live support integrations. This keeps setup reliable for judges while preserving a clear path to Zendesk, Salesforce, Front, or Freshdesk connectors later. The distinctive workflow is demonstrated without requiring a vendor account.

## D010 — Parse common document formats close to the user

CSV, Markdown, text, PDF, and `.docx` extraction happen in the browser. Only legacy `.doc` needs a guarded server parser. This reduces unnecessary file transfer while keeping the OpenAI key and model calls server-side.
