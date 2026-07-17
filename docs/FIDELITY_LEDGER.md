# Visual fidelity ledger

The concept and implementation were inspected together at desktop size after end-to-end browser QA.

| Element | Concept intent | Implemented result | Fidelity decision |
| --- | --- | --- | --- |
| Overall composition | Pale left rail, large white evidence field, right inspector, bottom replay rail | Same four-part composition and proportions | Preserved |
| Header | Large editorial headline with one blue replay action | Exact headline and action copy; headline wraps at 1440px because the functional inspector keeps its minimum readable width | Preserved with responsive wrap |
| Evidence map | Open concentric radar with five organic clusters and semantic dots | SVG radar uses five clusters, connecting rays, organic boundaries, and status-colored ticket dots | Preserved |
| Selected cluster | Blue outline and floating refund label | Exact selection treatment with 14-ticket and 64%-missing metadata | Preserved |
| Inspector | 36% coverage, failure explanation, evidence, source, primary draft action | Same hierarchy, plus accessible close control and a secondary ticket-inspection action | Preserved and extended |
| Replay rail | Before 36%, projected 86%, 12/14 answerable | Exact baseline sample state; live replay replaces it with measured results (96%, 13/14 in QA) | Preserved with real state |
| Navigation | Radar, Replay, Sources in a restrained left rail | Same destinations, icons, active treatment, and a small GPT-5.6 model indicator | Preserved and extended |
| Status language | Covered, partial, missing, contradiction | Exact four-state legend used consistently across map, inspector, and replay table | Preserved |
| Mobile behavior | Not specified in the static concept | Navigation becomes a compact top bar; the full radar remains horizontally scrollable; inspector and replay rail stack | Added for production usability |

## Above-the-fold copy comparison

| Location | Concept | Implementation | Reason for difference |
| --- | --- | --- | --- |
| Page headline | “Test your documentation against real customer questions.” | Exact match | Core positioning retained |
| Header action | “Run knowledge replay” | Exact match | Distinctive workflow retained |
| Selected cluster | “Refund after cancellation” | Exact match | Demo narrative retained |
| Failure explanation | “The doc doesn’t explain refund eligibility timing after cancellation.” | “The doc explains cancellation, but not refund eligibility or timing after cancellation.” | More precise about what the current source does cover |
| Evidence bullets | Illustrative refund bullets | Bullets tied to the shipped synthetic tickets | Replaced visual placeholder copy with auditable sample evidence |
| Coverage rail | Before 36% / Projected 86% | Exact sample match; updates after live replay | Functional state replaces static artwork |

## QA result

- Desktop checked at 1440 × 900.
- Mobile checked at 390 × 844.
- Mobile page width stays within the viewport; the evidence map itself is intentionally horizontally scrollable (`390px` viewport, `760px` map).
- Live article drafting, historical replay, contradiction blocking, source inventory, and question-level report were tested through the browser.
- No browser console warnings or errors remained after the final interaction pass.
