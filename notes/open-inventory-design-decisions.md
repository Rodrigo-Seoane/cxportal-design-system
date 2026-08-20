# Open Inventory Design Decisions — WE Phase 2A

> Source of truth for implementation. Do not build anything that contradicts this without updating it first.

---

## 1. Who is on this page, and what decision do they make?

**User**: a prospective health-plan client (pre-sales) reacting to a concrete design, plus an internal WFM/ops lead who would run this day to day.

| Audience | Question | Where they look |
|---|---|---|
| Executive | "Is enterprise/state risk trending toward breach? Do we need a capacity conversation?" | KPI bands, state heat map, top-10 states table |
| Operational | "Which persona/LOB/state/stage is the bottleneck right now?" | Persona bars, Persona × State matrix, Aging by LOB, detail table |

This is one dashboard whose **emphasis** shifts with the `RoleSwitcher`, not two separate pages (spec §5) — see §7 below for exactly what that toggle does and doesn't change.

---

## 2. Filter bar placement — top bar vs. left rail

**Decision: top bar**, per explicit instruction, over the newer left-rail `Table Filter` pattern seen on the Forecast & Scheduling reference page (Figma `362:2527`).

**The inconsistency, stated plainly**: that reference page is the house pattern for CxPortal data views, and it puts five-plus filters in a 240px left rail with room for saved-view management. Open Inventory's deck instead calls for the older horizontal top-bar layout. Both are implemented elsewhere in this repo (WFM uses `HierarchyFilter` in `top-bar` mode; the rail exists as a documented alternative in that same component). This page intentionally does not follow the newer convention. If Open Inventory graduates past prototype, revisit this — the rail scales better once saved filter sets are heavily used.

---

## 3. State heat map — grid cartogram, not a real map

**Decision: grid cartogram** (`components/open-inventory/StateHeatMap.tsx`), not real US state SVG paths.

**Why**: the spec explicitly forbids fabricating or approximating real geometry, and forbids adding a mapping dependency (`react-simple-maps`, `d3-geo`, `topojson`) for what only needs 51 fills and a tooltip. No Figma or other in-repo source of real path data was available. The cartogram is the spec's own stated preference for this exact case — small states (RI, DE, VT) get the same visual weight as Texas or California, which is arguably *more* useful for a "which states are at risk" comparison than true geographic area. Layout lives in `mocks/open-inventory/us-grid-positions.ts` — a hand-authored, NPR-style tile grid, not sourced from a published reference (verified to have zero coordinate collisions across all 51 tiles).

---

## 4. DataCard — two anatomy extensions beyond the literal Figma component

Figma node `368:3998` (file `54ARm4erwwo8sI5rp2MQAq`) was read live via `get_design_context` and confirmed exactly: 148px wide, 8px padding, 8px internal gaps, 92px/112px heights, and the bg/border token pairs per surface for success/warning/error/neutral. Two things were added on top of that literal anatomy, both because the spec's own KPI requirements don't fit inside it:

1. **Sparkline.** §6.1 asks every KPI tile for "count, share of total as a percentage, and a small sparkline" — a third data row the 92px anatomy has no room for. `DataCard` auto-promotes to `xl` (112px) whenever a `sparkline` prop is passed, rather than leaving it to the caller to remember.
2. **Leading status icon.** §6.2's detail-page KPI row asks for "a leading status icon" per tile, which isn't part of the Figma anatomy (title / value / caption / chip only). Added as an optional icon slot to the left of the title text.

**`info` surface type**: the Figma component set only has success/warning/error/neutral variants. The spec explicitly calls out that the four-bucket due scheme needs a blue for "Due Tomorrow" and directs adding one. `info` follows the exact same `--surface-accent-{type}-light` / `--border-color-accent-{type}-light` naming already present in `globals.css` for the other three accent colors — a same-pattern extrapolation, not a guess.

**Variant coverage** (definition-of-done requirement — every DataCard variant exercised somewhere):
- 4 due-bucket tiles: `onlyText` + `valueVariation` (tinted value) + `surfaceType` per bucket, on every page.
- `Total Inventory` tile: `comparison` (`filtered / grand total`) + `neutral`, on every page.
- `At-Risk %` (detail pages only): `percentage` + `height="xl"` + `chipVisible`, chip text driven by a 15% threshold ("On Target" / "Needs Attention") — mirrors the Figma reference's own "On Target" / "Needs Attention" / "Below 90% Target" chip examples.

`DataCard` stays in `components/open-inventory/` rather than being promoted to `components/ui/` (explicit decision — see conversation) — it's unproven outside this one prototype.

---

## 5. Persona × State matrix — cell shading is worst-case, not majority

Spec §6.2: "cell colour indicates the aging bucket carrying the highest risk." Implemented as **the most severe due bucket present in the cell** (Past Due beats a majority of Due 2+ Days), not the bucket with the most records. An ops matrix answers "where is my exposure," and a majority vote would hide a single past-due record sitting in an otherwise-healthy cell — exactly the thing a supervisor needs to see first. The same rule drives the state heat map's tile shading, for consistency between the two.

Every pixel value in the matrix (112px label column, 4px rule offset, 41×24 cells at 4px gaps, 40px row pitch) was confirmed live against Figma node `362:2527`'s Coverage Heat-Map structure, not estimated. The `41px` cell width is the one literal-pixel exception to the "everything on a 4px grid" styling rule below — it's a hard Figma-measured constant, not a chosen value.

---

## 6. Styling — Tailwind tokens only, one exception

WFM and Access Management both style with inline `style={{}}` objects and hardcoded hex values. Spec §7 diagnoses this as the direct cause of past layout inconsistency and bans it here: Tailwind utility classes bound to the token scale, zero inline styles except genuinely dynamic values (grid placement driven by data, computed bar widths), zero arbitrary pixel values. Tailwind's `@theme` block already generates the right utility 1:1 for nearly every value in the spec's pixel table (`gap-9`=36px section gaps, `p-6`=24px chart-card padding, `p-2`/`gap-2`=8px tile spacing, `gap-1`=4px). `bg-[var(--surface-accent-error-light)]` and similar are token *references*, not magic numbers — that's the only way to consume these accent tokens since they aren't wired into `@theme`'s color namespace yet. The sole literal-pixel exception is the `41px` matrix/heat-map-adjacent cell noted above.

---

## 7. Role gating — what `RoleSwitcher` actually changes

Both KPI bands (Regulatory TAT, Internal SLA) and the Monitor Risk band render identically regardless of role — both audiences need the same macro risk picture. `role` only gates the **Diagnose Drivers** band: the executive view drops the "Inventory by Type of Work" and "Inventory Aging" cards (the two most operationally granular breakdowns), showing only the LOB and top-10-state tables. This is a render-time filter in `DiagnoseDriversBand.tsx`, nothing more — cheap to unwind into two separate views later, per spec's own instruction to keep the split easy to walk back.

The Monitor Risk / Diagnose Drivers bands always compute against the **Regulatory TAT** clock, since both KPI bands above already give TAT and SLA equal billing — there was no unambiguous spec instruction for which clock these lower, clock-agnostic-looking bands should use, so TAT (the compliance-primary clock) was the more defensible default.

---

## 8. Sidebar icon — Phosphor, not lucide

The spec mandates lucide-react for all new Open Inventory code, and every component inside `components/open-inventory/` and `app/open-inventory/` follows that. The one exception: the new "Open Inventory" entry in `components/layout/Sidebar.tsx` uses a **Phosphor** icon (`PackageIcon`), matching every other nav group's icon rendering (weight, size) in that file. The mandate is about the feature's own code, not about forcing a visual seam into a persistent chrome file this change only edits, not authors.

---

## 9. Data reconciliation

One seeded dataset (`mocks/open-inventory/generator.ts`, 12,000 `AuthRecord`s, `1664525/1013904223` LCG — same formula as `mocks/wfm/store.ts`'s `seededRandFrom`, not `Math.random()`). Every number on every page is a pure aggregation over that one array (`mocks/open-inventory/aggregations.ts`), filtered by the same `FilterState` — so the four due-bucket counts always sum to the Total Inventory tile's count, at any filter combination, by construction rather than by coincidence.

Two things are deliberately **not** literal historical replays, because the dataset has no modeled resolve/close events:
- **14-day trend chart and sparklines** (`mocks/open-inventory/trend.ts`): a seeded backward walk from today's *real* bucket composition. The last point always exactly matches the live KPI totals; the earlier 13 points are a plausible, deterministic history, not a record-by-record reconstruction.
- **Per-state sparklines** in the top-10 table: same technique, scoped to one state's total.

This is flagged here rather than silently done, per the spec's own reconciliation requirement — the "must agree" property holds for every *current-snapshot* number; the trend lines are explicitly a stylized history.
