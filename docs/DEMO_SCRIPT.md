# Demo video script — target 2:45

## 0:00–0:18 — The problem

**On screen:** Open on the SaaS evidence radar.

**Voiceover:**

“Support teams already have AI that summarizes tickets and writes articles. But they still cannot answer a crucial question: would our documentation have answered the questions customers actually asked? Support Gap Radar turns historical tickets into a documentation regression-test suite.”

## 0:18–0:42 — The radar

**On screen:** Move across the radar and select “Refund after cancellation.” Point out the semantic status legend and the before/projected rail.

**Voiceover:**

“Each cluster is a repeated customer problem. Green is covered, amber is partial, coral is missing, and purple is a contradiction. This refund cluster has only 36 percent current coverage. The inspector explains exactly what is absent and names the source document that should be patched.”

## 0:42–1:05 — Bring your own evidence

**On screen:** Open Sources. Show ticket CSV and documentation upload zones, inventory, and included samples.

**Voiceover:**

“The workflow is vendor-neutral. A team uploads an exported ticket CSV plus Markdown, text, PDF, or Word documentation. OpenAI embeddings group related questions and retrieve the most relevant passages. GPT-5.6 then decides answerability—similarity alone never counts as proof.”

## 1:05–1:35 — Draft a patch

**On screen:** Return to Radar, select the refund cluster, click “Draft article patch,” and show the editable workbench.

**Voiceover:**

“For a safe cluster, GPT-5.6 drafts a self-contained Markdown patch using the current docs and consistent resolved outcomes. This judge sample loads the exact result captured during live verification; custom uploads invoke the server API. The evidence sources stay visible and the article is editable. If docs and outcomes conflict, the app blocks publishing and asks for a human policy decision.”

## 1:35–2:05 — Knowledge Replay

**On screen:** Click “Replay questions.” Show the before/projected result, then open Replay and scan the row-level table.

**Voiceover:**

“Now the distinctive step: Knowledge Replay. The same historical questions run against the current docs plus the proposed patch. Instead of a vague AI score, every row shows the previous status, projected status, and evidence-based rationale. The result is projected documentation coverage—not a promise of ticket deflection.”

## 2:05–2:27 — Codex and GPT-5.6

**On screen:** Briefly show the repository structure, decision log, tests, and terminal check output.

**Voiceover:**

“I built the majority of the project in one Codex task. Codex helped research the competitive baseline, turn the idea into regression testing, generate the visual direction, implement the full React and serverless workflow, create synthetic datasets, and verify it with lint, fourteen tests, a production build, and a live GPT-5.6 smoke test.”

## 2:27–2:45 — Close

**On screen:** Export Markdown, then return to the radar hero.

**Voiceover:**

“Support Gap Radar gives knowledge teams a repeatable loop: find the gap, patch it from evidence, replay real questions, and ship with human review. Test your documentation against the questions customers actually asked.”

## Recording checklist

- Keep browser zoom at 100 percent and notifications off.
- Preload the SaaS demo and select the refund cluster.
- Complete one live draft/replay before recording if latency is unpredictable; preserve the result on screen.
- Show the contradiction cluster briefly—this is an important trust differentiator.
- Keep the video public or unlisted on YouTube and under three minutes.
- Include voice audio describing both Codex and GPT-5.6 use.
