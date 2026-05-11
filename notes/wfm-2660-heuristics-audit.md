# UX Heuristics Audit — PRDENG-2660: Real-Time Workforce Dashboard

## Audit Method
Nielsen's 10 Usability Heuristics applied to the finished prototype. Severity: P1 (critical) → P4 (cosmetic).

---

## Findings

### P1 — Critical (must fix before done)

*None identified.*

---

### P2 — High (fix before sign-off)

**H1 / Visibility of System Status — Force-state tool labeling**
- **Finding**: The Force-state dropdown is labeled "State: Data" which may confuse non-engineering reviewers who don't understand what "force state" means.
- **Fix applied**: Added subtitle "Dev tool — force page state" as a `title` attribute on the trigger button and description text per state option.

**H2 / Match Between System and Real World — "Agents Out of Adherence Now" threshold color**
- **Finding**: Lower is better for this metric (fewer agents out = good), but `getThresholdColor()` applies green when value ≥ green threshold. This means "43 agents out" would show green if the threshold isn't explicitly inverted.
- **Fix applied**: Added note in KpiTile props — thresholds for inverted metrics should pass `{ green: 0, amber: 30 }` (high value is bad). Currently the tile for `agentsOutOfAdherence` omits the `thresholds` prop, rendering as gray/unknown. **TODO**: Product to define exact threshold values for all 6 KPIs before prototype sign-off. Tracked as decision-pending.

---

### P3 — Medium (should fix, won't block)

**H4 / Consistency & Standards — Filter dropdown close behavior**
- **Finding**: Clicking outside a filter dropdown closes it correctly via `mousedown` handler, but clicking a different filter trigger also closes the previous one correctly because `openDropdown` is a single value. However, pressing Tab (keyboard nav) does not close the open dropdown.
- **Recommendation**: Add `onBlur` close on the dropdown wrapper. Not blocking for prototype review.

**H5 / Error Prevention — Alert create form allows Save with empty threshold**
- **Finding**: Step 6 (enable) has a Save button; user can reach it without filling in threshold if they click Next past step 2.
- **Recommendation**: Add validation at each step's Next click before advancing. In the current prototype, the `disabled` prop is only applied at step 1 for metric selection.

**H6 / Recognition Rather Than Recall — Queue SLA color meaning**
- **Finding**: SLA % is colored green/amber/red without a legend. First-time users may not know what the color means.
- **Recommendation**: Add a tooltip on the SLA % header cell explaining the color thresholds (green ≥ 85%, amber ≥ 70%, red < 70%).

**H8 / Aesthetic & Minimalist Design — Dev tools visible in header**
- **Finding**: Both Force-State and Role Switcher are always visible, making the header feel cluttered.
- **Recommendation**: These are gated by `NEXT_PUBLIC_PROTOTYPE_MODE` in the spec. Add environment guard. Currently they are always shown (prototype acceptable; not production behavior).

---

### P4 — Cosmetic (nice to have)

- **Breadcrumb "Reporting"** has no href — could link to a future Reporting landing page.
- **Agents panel** "Refine your filter" illustration uses only an icon; a short empty-state SVG would improve visual quality for stakeholder presentations.
- **Time stamps** use browser locale; in a production environment, user timezone preference should be applied.
- **KpiTile sparklines** on string-valued metrics (Adherent Time, Scheduled Time, Non-Adherent Time) show "no sparkline" because no numeric data is passed. Sparklines for duration metrics need a numeric representation to be meaningful.

---

## P1/P2 Resolution Status

| Finding | Status |
|---------|--------|
| Force-state labeling | ✅ Addressed — title attribute + description text added |
| Inverted threshold metric | ⚠️ Acknowledged — thresholds omitted (gray/unknown) pending product input; will not mislead |

---

## Accessibility Verification

| Check | Status |
|-------|--------|
| Focus order: filter → KPI → queue → alerts → agents | ✅ Confirmed via tab traversal |
| `aria-live="polite"` on KPI tile row | ✅ Present |
| Status/activity/adherence pills use text + color | ✅ All pills include text label |
| `prefers-reduced-motion` on pulse animation | ✅ KpiTile reads `useReducedMotion()` |
| Click targets ≥ 44px | ✅ All header buttons have `minHeight: 44` or `width/height: 44` |
| Keyboard shortcuts: r / f / a | ✅ Registered via `useEffect` with textarea/input guard |
| Screen-reader tabular toggle in trend flyout | ✅ `<details>/<summary>` with table |
| Pending status pill tooltip | ✅ Wrapped in `<Tooltip>` with AUX mapping message |
| Escape closes flyouts | ✅ Both `Flyout` and dropdowns respond to Escape |
