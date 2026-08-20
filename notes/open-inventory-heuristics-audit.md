# UX Heuristics Audit — Open Inventory (WE Phase 2A)

## Audit Method
Nielsen's 10 Usability Heuristics applied to the finished prototype. Severity: P1 (critical) → P4 (cosmetic).

---

## Findings

### P1 — Critical (must fix before done)

**H2 / Match Between System and Real World — white text on mid-tone bucket fills**
- **Finding**: `StateHeatMap` and `PersonaStateMatrix` originally rendered `text-white` on `--{success,warning,error,info}-default` fills. Computed contrast ratios (WCAG relative-luminance formula): warning-default ≈ 2.05:1, error-default ≈ 3.81:1 against white — both fail the 4.5:1 AA threshold for the ~10px text used in these cells (and warning-default fails even the 3:1 large-text/UI-component threshold). This also broke with the codebase's own established convention: `components/ui/chip.tsx` pairs every shade *except the darkest (500) tier* with dark text, never white, for exactly this reason.
- **Fix applied**: both components now use `text-[var(--text-body-primary)]` (dark) on all bucket fills. Confirmed against the same convention chip.tsx already uses.

---

### P2 — High (fix before sign-off)

**H8 / Aesthetic and Minimalist Design — PH/BH segmented control duplicates the filter bar's own dropdown**
- **Finding**: the metric-detail pages render a segmented All/PH/BH control (spec §6.2) *and* the shared `FilterBar`'s "Type of Work" multi-select, both bound to the same `filters.typesOfWork` state. A reviewer could reasonably ask why there are two controls for one dimension.
- **Status**: intentional per spec, which asks for the segmented control in addition to the shared filter bar. Both controls read/write the same store field, so they can never disagree with each other. Not fixed — documented so it isn't mistaken for an oversight.

**H1 / Visibility of System Status — `valueVariation` tinted value text sits on a same-hue tinted background**
- **Finding**: `DataCard`'s `valueVariation` renders the big value in e.g. `--text-warning` (≈ warning-default) on top of `--surface-accent-warning-light`. Both colors share a hue family, which lowers effective contrast versus putting the same colored text on plain white (the pattern `KpiTile.tsx` in WFM uses). Estimated contrast is below the 3:1 large-text threshold for at least the warning/success pairs.
- **Status**: acknowledged, not fixed. The DataCard anatomy and its light-tinted surface come directly from the confirmed Figma component (`368:3998`) — changing the background would deviate from the source component rather than from this build's own choice. Flagged here as a decision-pending item for design review, same disposition as WFM's own inverted-threshold finding in its equivalent audit.

---

### P3 — Medium (should fix, won't block)

**H6 / Recognition Rather Than Recall — "worst-case" cell shading could read as a majority vote**
- **Finding**: `PersonaStateMatrix` and `StateHeatMap` shade a cell by the single most-severe bucket *present*, not the majority bucket — a cell that's 90% Due 2+ Days but has one Past Due record shades red.
- **Fix applied**: both components carry an explicit caption/legend stating the rule in plain language, so this doesn't have to be inferred from color alone.

**H4 / Consistency and Standards — Load More resets are per-table, not global**
- **Finding**: `InventoryDetailTable`'s `displayCount` resets to 10 on any filter or clock change (per `GUIDELINES.md`'s Load More pattern), but sort-order changes do not reset it. This is intentional — re-sorting shouldn't discard progressive-loading state — but it means a user who has loaded 40 rows and then re-sorts will see a different set of 40 than "top 40 by the new sort," not "top 10." Not a defect, but worth a second look if a future reviewer expects sort to also reset paging.

**H5 / Error Prevention — Saved filter set naming has no duplicate-name guard**
- **Finding**: `SavedFilterSetsMenu`'s save flow (`window.prompt`) will happily create two sets with the same label.
- **Recommendation**: add a duplicate-name check before saving. Not blocking for a local-only, single-user prototype feature.

---

### P4 — Cosmetic (nice to have)

- The dashboard's two KPI bands both show a `Total Inventory` tile with an identical filtered/grand-total pair — correct (population count doesn't depend on which clock's due-buckets are being shown), but a first-time viewer might expect the two Total tiles to differ the way the four bucket tiles do.
- `StateHeatMap`'s tooltip uses a custom `group-hover` panel rather than the DS `Tooltip` primitive (`components/ui/tooltip.tsx`), since the DS primitive is built around a single anchor element, not 51 independent grid cells; a native `title` attribute alone was judged insufficiently discoverable for this density of targets.
- 14-day trend lines and per-state sparklines are a seeded synthetic walk ending on the true current snapshot (see `notes/open-inventory-design-decisions.md` §9), not a literal historical replay — acceptable for a pre-sales prototype but worth flagging if a client asks "where does this history come from."

---

## P1/P2 Resolution Status

| Finding | Status |
|---|---|
| White text on mid-tone bucket fills | ✅ Fixed — dark text throughout, matching chip.tsx's convention |
| PH/BH segmented control duplicates filter bar | ℹ️ Intentional per spec — documented, not a defect |
| `valueVariation` text-on-tint contrast | ⚠️ Acknowledged — inherited from the confirmed Figma anatomy; flagged for design review |

---

## Accessibility Verification

| Check | Status |
|---|---|
| Focus order: page actions → filter bar → KPI tiles → charts/tables (per-page a11y header comments) | ✅ Documented in each `page.tsx` header block |
| `aria-live="polite"` on KPI tile rows (dashboard + metric detail) | ✅ Present |
| Due-bucket color always paired with a text label, never color alone | ✅ Verified across DataCard, StatusLegend, PersonaStateMatrix caption, StateHeatMap tooltip |
| `prefers-reduced-motion` | ✅ All sparklines/mini-charts render with `isAnimationActive={false}`; no page-authored motion added |
| Disabled per-row "Detail" button has an explanatory `aria-label`/`title` rather than a dead link | ✅ `InventoryDetailTable` |
| Sortable table headers expose `aria-sort` | ✅ Via `components/ui/table.tsx`'s existing `TableHead` primitive |
| Saved filter sets persist and survive reload | ✅ `localStorage` under `open-inventory-saved-filter-sets`, verified via the store's read/write helpers |
| Load More button only renders while more rows remain | ✅ `InventoryDetailTable` |
