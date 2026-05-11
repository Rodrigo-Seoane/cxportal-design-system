# UX Heuristics Audit — PRDENG-2662: Agent Scorecard

## Audit Method
Nielsen's 10 Usability Heuristics applied to the finished prototype. Severity: P1 (critical) → P4 (cosmetic).

---

## Findings

### P1 — Critical (must fix before done)

*None identified.*

---

### P2 — High (fix before sign-off)

**H1 / Visibility of System Status — No "insufficient data" indicator on KPI cards for short ranges**
- **Finding**: When a "Last 7 days" range is selected for an agent with only 5 days of history, the KPI cards show real (partial) values without any caveat. A supervisor might interpret "83%" over 5 days as representative of the full 7-day period.
- **Fix recommended**: Add a small "Partial period" indicator (similar to the `Partial data` badge on the chart) to each KPI card when the filtered series count is less than the expected range days. Not implemented yet — tracked for next iteration.

---

### P3 — Medium (should fix, won't block)

**H4 / Consistency & Standards — Time-range selector uses pill buttons; HierarchyFilter uses dropdowns**
- **Finding**: The two filter UI patterns on this page (time-range pills vs. HierarchyFilter dropdowns) are visually inconsistent.
- **Recommendation**: The time-range pills are intentionally distinct because they toggle a single-select dimension (range), while HierarchyFilter handles multi-select cascading. This is a justifiable difference, not an error. Document in the design system.

**H7 / Flexibility & Efficiency — Custom date range requires two separate date inputs**
- **Finding**: The custom range uses two plain `<input type="date">` fields. Native date inputs have poor cross-browser visual consistency (especially on macOS/Safari) and lack a range-selection pattern.
- **Recommendation**: Replace with a date-range picker component in production. The discovery doc notes this gap. Acceptable for prototype; marked as production gap.

**H8 / Aesthetic & Minimalist Design — Drill-out CTAs show always, even when the agent is not in scope for that report**
- **Finding**: "Schedule Publication Report" is only shown to WFM Lead (RBAC-gated via DrillOutLink), but for a Supervisor, the row is hidden when no CTAs render, leaving an empty panel.
- **Fix**: Conditionally hide the entire "Open in FCS" panel when no CTAs are visible for the current role. Low impact for prototype.

---

### P4 — Cosmetic (nice to have)

- **Grace-period band label**: A label like "Grace zone" rendered inside the band (small, right-aligned) would make it immediately readable without requiring a hover. Currently only the legend below the chart explains it.
- **Event marker size on dense data**: With 90 days of data, the markers are very close together and may overlap. Production should implement a clustering or jitter strategy.
- **Time-off strip overflow**: For ranges > 90 days, a fallback summary is shown. Consider a paginated or scrollable strip for mid-range periods (30–90 days).
- **Non-adherent event flyout**: The flyout currently shows the first non-adherent event for a day. If a day has multiple non-adherent periods, only the first is represented. Production should aggregate or list all.
- **Back button preserves filter context**: Confirmed working for sg/fg/status params. Does not preserve the active time range (by design — each scorecard visit starts from the default range). Consider whether to preserve range too.

---

## Grace-Period Band Usability Review (per spec request)

**Q: Is it understood as a tolerance zone, or misread as a bad zone?**

The green color (#d4edda — light green) communicates positive/safe, not negative. The legend copy "Within grace period — counted as adherent per FCS configuration" uses the word "adherent" which is the positive outcome. The read-only chip "Grace: ±5 min per activity" reinforces that this is a configured tolerance, not a failure state.

**Risk**: The term "grace period" is domain-specific. First-time users may read it as "the area where you're getting away with something" (punitive framing). The tooltip copy should emphasize "tolerance zone" and avoid the word "grace" where possible. Consider: "Adherence tolerance zone — days where the line falls here count as fully adherent."

**Assessment**: P3 — No change to implementation, but tooltip copy should be updated in the next review cycle.

---

## No-History Empty State Review

**Q: Does it feel supportive or broken?**

The dashed border + centered copy ("Trend will appear after 7 days of activity") reads as a placeholder, not an error. The dashed border is commonly used for "pending" or "upcoming" states in design systems, which aligns with the intent. KPI cards in `empty` state show "No data in current scope" which is slightly ambiguous — it could mean "filter returned nothing" vs. "agent is new." A future revision should distinguish these.

**Assessment**: Supportive, not broken. Minor copy improvement recommended (P4).

---

## Insufficient-Permissions State Review

**Q: Is it clearly informational and not punitive?**

The orange shield icon, "informational" tone, and explicit mention of the user's own scope ("Your supervisor scope is limited to sg-triage-day") correctly frame the constraint as a scope rule rather than a security violation. The "Request access" CTA gives the user a productive next step instead of a dead end.

**Assessment**: Correctly implemented. Non-punitive. Passes.

---

## Side-Context Panels Review

**Q: Can a supervisor distinguish a legitimate dip from a real problem in under 5 seconds?**

The visual link between chart markers and panel headers works: the blue triangle in the chart header matches the shift-trade panel accent; the purple square matches the exchange panel. A supervisor who sees a blue triangle on a dip date should naturally look at the Shift Trades panel. The compact table makes this scan fast.

**Risk**: The panels filter by the selected date range, not by the dip date. A supervisor might need to scroll to find the relevant row. A future improvement: clicking a chart marker should scroll-to and highlight the corresponding panel row.

**Assessment**: Functional for prototype. Production should add row highlighting on marker click (P3).

---

## P1/P2 Resolution Status

| Finding | Status |
|---------|--------|
| Partial-period KPI caveat | ⚠️ Acknowledged — tracked for next iteration |

---

## Accessibility Verification

| Check | Status |
|-------|--------|
| Focus order: time-range → KPI → chart toggle → chart → panels → time-off → drill-out | ✅ Follows DOM order |
| Chart: sr-only summary generated from series data | ✅ Present (aria-live polite, visually hidden) |
| Chart tabular toggle for screen-reader users | ✅ "View as table" button |
| Event markers: shape + color (circle/triangle/square) | ✅ Never color alone |
| Chart keyboard: Tab → arrow keys → Enter to open flyout | ✅ onKeyDown on chart container |
| Chart container: tabIndex=0, aria-label describing keyboard interaction | ✅ Present |
| Marker click targets ≥ 44px (transparent rect overlay) | ✅ 44×44 rect overlay |
| Flyout: focus trap, Escape closes, aria-modal | ✅ Flyout.tsx |
| StatusPill in identity strip: live updates with reduced-motion respect | ✅ subscribeToStatusEvents |
| Insufficient permissions state: back CTA is keyboard accessible | ✅ Native Link |
| Time-off strip: day boxes have aria-label with date + type + status | ✅ Present |
| KPI cards: loading skeleton preserves layout height | ✅ Skeleton variant="rect" |
| Reduced-motion: chart line animation disabled | ✅ isAnimationActive={!prefersReducedMotion} |
| Grace chip: cursor:help + tooltip explains concept | ✅ Present |
