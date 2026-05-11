# UX Heuristics Audit — PRDENG-2661: Agent Status Summary

## Audit Method
Nielsen's 10 Usability Heuristics applied to the finished prototype. Severity: P1 (critical) → P4 (cosmetic).

---

## Findings

### P1 — Critical (must fix before done)

*None identified.*

---

### P2 — High (fix before sign-off)

**H1 / Visibility of System Status — Scope gate shows no loading state**
- **Finding**: When a quick-scope chip is clicked, the URL updates and the scope gate disappears, but the table enters its loading skeleton state briefly. There is no intermediate "loading scope…" state — the gate just disappears and the skeleton appears, which can feel abrupt on slower connections.
- **Recommendation**: Acceptable for prototype. Production should show a single loading indicator that bridges the scope-gate-to-table transition.

**H3 / User Control & Freedom — Saved views use `window.prompt()`**
- **Finding**: The "Save current view" action calls `window.prompt()`, which is a browser modal with no styling and blocks the main thread. This was acceptable for velocity but is not production-ready.
- **Recommendation**: Replace with an inline text input or a small modal component when this feature goes to production. No change for prototype review; documented here.

---

### P3 — Medium (should fix, won't block)

**H4 / Consistency & Standards — Sort UI is toggle buttons, not column headers**
- **Finding**: The current sort controls are three pill buttons above the table (Out of adherence first / Name A–Z / Duration), rather than clickable column headers. Column-header sorting is the standard pattern for data tables and what users expect.
- **Recommendation**: In the next iteration, add sort indicators (↑↓) to the Name, Duration, and Adherence column headers and remove the separate sort pills. Not blocking for prototype review since the spec called for above-table sort controls.

**H6 / Recognition Rather Than Recall — Status chips have no count badges**
- **Finding**: The status filter chips show chip labels (Available, On Call, etc.) but not how many agents are currently in each state. Users must toggle a chip and look at the table row count to understand distribution.
- **Recommendation**: Add count badges to each chip: `Available (47)`. This also allows users to quickly see if a status category is empty before filtering to it.

**H8 / Aesthetic & Minimalist Design — "Inactivity Detected" chip in filter bar**
- **Finding**: The "Inactivity Detected" status chip appears in the chip row but is marked design-only (via banner). It should be visually distinguished (e.g., dashed border, opacity 0.5, lock icon) to prevent reviewers from thinking it is a functional filter option.
- **Recommendation**: Add `opacity: 0.6` and a dashed border to design-only chips. Add tooltip explaining "Design-only — future SOW". Not blocking for current review.

---

### P4 — Cosmetic (nice to have)

- **Back navigation**: The Agent Scorecard stub has a Back button that preserves filter context in the URL. Confirm this is the correct return target when entering via deep-link (e.g., from a notification email).
- **Row hover**: The row highlight on hover uses `background: #f8f9fa` which is very subtle. Consider `#f0f4fb` to better communicate row interactivity.
- **Density toggle**: Toggling density causes a height jump in the visible rows that is jarring without animation. Consider a `transition: height 150ms ease` per row during density change.
- **Footer ticker**: "Last event Xs ago" ticker resets on every render refresh (via `lastUpdated`). Production should key this to the last real event timestamp from the event stream, independent of the manual refresh action.
- **Breadcrumb "Reporting"**: No href — future Reporting landing page will provide a valid target.

---

## P1/P2 Resolution Status

| Finding | Status |
|---------|--------|
| Scope gate loading gap | ⚠️ Acknowledged — acceptable for prototype |
| `window.prompt()` for saved view name | ⚠️ Acknowledged — documented for production replacement |

---

## Accessibility Verification

| Check | Status |
|-------|--------|
| Focus order: filter → status chips → search → sort → first row → kebab | ✅ Follows DOM order |
| `aria-live="polite"` on status event announcements | ✅ Present in AgentTable |
| Status pills use text + color + icon (never color alone) | ✅ All StatusPill variants include label |
| Activity pills include icon | ✅ BriefcaseIcon / CoffeeIcon / CalendarBlankIcon / QuestionIcon |
| Adherence badge: tooltip explains meaning | ✅ All three states have Tooltip |
| Kebab `aria-label`, `aria-haspopup`, `aria-expanded` | ✅ KebabMenu.tsx |
| Escape closes kebab menu | ✅ keydown handler in KebabMenu |
| Status chip `aria-pressed` state | ✅ All chips have aria-pressed |
| Search `aria-label="Search agents by name"` | ✅ Present on input |
| Scope gate quick-scope chips keyboard accessible | ✅ Native `<button>` elements |
| Click targets ≥ 44px | ✅ Kebab: 44×44; header buttons: minHeight 44; compact density: kebab-only 44px |
| `prefers-reduced-motion`: row highlight transition disabled | ✅ Conditional `transition` on row |
| Out-of-adherence rows: left accent border (not color alone) | ✅ 3px solid #ef2056 border-left used alongside badge |
| Pending pill: tooltip explains AUX mapping dependency | ✅ QuestionIcon + Tooltip in StatusPill |
