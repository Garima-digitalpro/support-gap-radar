# Build Week submission pack

## Core listing

**Project name:** Support Gap Radar

**Category:** Work and Productivity

**Tagline:** Test your documentation against the questions customers actually asked.

**One-sentence pitch:** Support Gap Radar turns historical customer tickets into documentation regression tests, drafts evidence-grounded fixes, and replays the same questions to show projected coverage improvement before a knowledge team publishes.

## Project description

Support teams already have AI that summarizes conversations and generates knowledge articles. Support Gap Radar addresses the next problem: proving whether a proposed article would have answered the questions customers actually asked.

Teams upload a vendor-neutral CSV of historical support tickets and their current documentation in Markdown, text, PDF, or Word format. OpenAI embeddings group semantically related questions and retrieve the most relevant documentation passages. GPT-5.6 performs a structured coverage audit, classifying every ticket as covered, partial, missing, or contradiction. The result is an interactive evidence radar that makes repeated gaps and conflicting policies visible.

For a safe cluster, GPT-5.6 drafts an editable, evidence-grounded Markdown patch. Knowledge Replay then retests the same historical questions against the current documentation plus the proposed patch and reports question-level before/after results. If documentation and resolved outcomes disagree, drafting is blocked until a human makes the policy decision.

Unlike a generic support summarizer, the product creates a reusable regression-testing loop: detect, patch, replay, review. It reports projected documentation coverage—not guaranteed support deflection—and keeps the API key server-side.

## Judge walkthrough

1. Open the app; the SaaS billing sample is immediately visible without an API call.
2. Select **Refund after cancellation** and inspect the missing ticket dots and cited gap evidence.
3. Click **Draft article patch** to create an editable GPT-5.6 proposal.
4. Click **Replay questions** and inspect the projected before/after result.
5. Open **Replay** for question-level evidence.
6. Select **Export limits** to see the contradiction guardrail block unsafe drafting.
7. Open **Sources** to test one of the three included sample packs or custom data.

## Technical highlights

- React 19 + Vite responsive interface
- Netlify Functions with server-only OpenAI credentials
- `text-embedding-3-small` semantic clustering and retrieval
- Deterministic k-means and cosine similarity
- GPT-5.6 Structured Outputs validated with Zod
- Browser parsing for CSV, Markdown, text, PDF, and `.docx`; guarded server parsing for legacy `.doc`
- Editable Markdown output and export
- Conservative four-state coverage model with contradiction blocking
- `store: false` for OpenAI Responses
- 12 focused automated tests plus a live GPT-5.6 integration smoke test

## URLs to complete

- **Public demo:** pending deployment
- **Code repository:** pending publication
- **Demo video:** pending recording/upload
- **Codex `/feedback` session ID:** run `/feedback` in the primary build task after the final implementation pass

## Final checklist

- [x] Working project built primarily with Codex
- [x] GPT-5.6 used for core functionality
- [x] Category selected
- [x] Public-license file included
- [x] README with setup and testing instructions
- [x] Three synthetic sample datasets
- [x] Clear judge walkthrough
- [x] Lint, automated tests, production build, and live API smoke test pass
- [ ] Browser and responsive QA screenshots captured
- [ ] Public demo deployed and tested without local state
- [ ] Public GitHub repository created and tested from a clean clone
- [ ] Under-three-minute YouTube demo uploaded
- [ ] Codex `/feedback` submitted and session ID recorded
- [ ] Devpost form completed before the deadline
