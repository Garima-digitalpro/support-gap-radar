# Support Gap Radar design system

The implementation follows [`design-concept.png`](./design-concept.png), generated with the built-in Image Generation tool before coding.

Final implementation captures: [`implementation-desktop.png`](./implementation-desktop.png) and [`knowledge-replay.png`](./knowledge-replay.png). The detailed comparison is in [`FIDELITY_LEDGER.md`](./FIDELITY_LEDGER.md).

## Visual idea

An editorial evidence board meets a scientific radar instrument. The evidence map is the focal point; navigation, controls, and the inspector stay quiet.

## Tokens

| Role | Value |
| --- | --- |
| Canvas | `#ffffff` (true white) |
| Navigation | `#f5f7fb` |
| Ink | `#0a1737` |
| Muted ink | `#667085` |
| Border | `#d8deea` |
| Action blue | `#1457e6` |
| Covered | `#18aa75` |
| Partial | `#f3a000` |
| Missing | `#ff6559` |
| Contradiction | `#8f31a9` |

Typography uses Inter-compatible system sans fallbacks, deliberate control sizing, and a compact B2B hierarchy. Corners are 12–16px only where they communicate grouping. The evidence canvas stays open rather than becoming a card grid.

## Component families

- App shell: collapsible rail, page header, content stage.
- Evidence map: contour rings, cluster outlines, ticket dots, semantic legend.
- Inspector: one selected-cluster panel with evidence and one primary action.
- Replay rail: before/projected coverage and answerability delta.
- Source workspace: two functional upload zones and file inventory.
- Article workbench: editable Markdown, provenance, conflicts, replay action, export.

## Responsive behavior

- Below 980px, the navigation becomes a compact top bar and inspector moves below the map.
- Below 680px, headline/action stack, evidence map remains horizontally legible, and replay metrics wrap without overflow.
