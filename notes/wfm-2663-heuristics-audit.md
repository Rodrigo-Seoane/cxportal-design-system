# PRDENG-2663 — Supervisor Scorecard: Heuristics Audit

**Prototype 4 of 4 · Evaluated against Nielsen's 10 Usability Heuristics**

---

## P1 — Critical Issues

None identified.

---

## P2 — Significant Issues (addressed in prototype)

### Range × Rollup partial-period caveat
**Issue:** When switching from "By Staffing Group" to "By Queue" on a 90-day range, the agent count may appear inflated (de-dup issue). A callout warning was added near the scope picker, but no calculation adjustment was made in the prototype.

**Accepted because:** In production the backend would normalize counts server-side. The footnote is the correct prototype response — it communicates the limitation without fabricating incorrect math.

---

## P3 — Minor Issues

### Scope-type picker lacks keyboard shortcut affordance
The segmented control uses `aria-pressed` buttons but has no visible keyboard hint. Tab navigation works correctly. No fix applied — standard tab-stop behavior is sufficient for prototype fidelity.

### Agent list pagination not implemented
The agent list renders all agents in one pass. For large staffing groups this could produce a very long table. Scroll-based windowing (used in the Agent Status Summary prototype) was not added here given the lower scope count in mock data.

### Custom date range validation feedback
Entering an invalid custom range (from > to) produces no visible error — the dates simply produce an empty result. Acceptable at prototype stage; in production, field-level validation messages would be required.

---

## P4 — Cosmetic / Nice-to-Have

- The "Out of Adherence Now" tile uses today's snapshot count (`rollupKpi.outOfAdherenceCount`) regardless of selected time range. A "(today)" label in the tile subtitle would reduce potential confusion with cumulative range counts.
- Schedule readiness urgency threshold (2 weeks) is hardcoded. In production this would be a configurable planning parameter.

---

## Accessibility Verification

| Criterion | Status |
|-----------|--------|
| Scope picker — `aria-pressed` on segmented buttons | ✅ |
| Time-range buttons — `aria-pressed` | ✅ |
| Peer comparison sort buttons — `aria-pressed` | ✅ |
| Schedule week columns — `tabIndex=0`, `aria-label` with date + status + coverage | ✅ |
| Agent list rows — `tabIndex=0`, `aria-label` with name + adherence, Enter key drill-through | ✅ |
| Status colors not color-alone — icons accompany all status states | ✅ |
| Peer anonymization — does not change on sort (stable mapping) | ✅ |
| Degraded banner — visible in all stale/degraded force states | ✅ |
| AdherenceTrendChart — reuses keyboard nav and tabular toggle from PRDENG-2662 | ✅ |
| Focus ring — all interactive elements in schedule panel have `box-shadow` focus ring via `onFocus` | ✅ |
| Page header breadcrumb — `nav aria-label="Breadcrumb"` | ✅ |
