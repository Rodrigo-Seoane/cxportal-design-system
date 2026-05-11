# WFM Reporting — Cross-Prototype System Audit

**Covers:** PRDENG-2660 · PRDENG-2661 · PRDENG-2662 · PRDENG-2663  
**Date:** 2026-05-08

---

## 1. Shared Infrastructure Consistency

### WFMContext + Store
All four prototypes wrap their page content in `<WFMContext.Provider>`. The provider receives the same `WFMStore` shape in each page. `ForceStateTool` and `RoleSwitcher` read from this context and behave identically across all four views.

### Force State Matrix

| State     | PRDENG-2660 (RTWF) | PRDENG-2661 (Agent Status) | PRDENG-2662 (Agent Scorecard) | PRDENG-2663 (Supervisor Scorecard) |
|-----------|--------------------|-----------------------------|-------------------------------|-------------------------------------|
| data      | ✅ | ✅ | ✅ | ✅ |
| loading   | ✅ | ✅ | ✅ | ✅ |
| error     | ✅ | ✅ | ✅ | ✅ |
| degraded  | ✅ | ✅ | ✅ | ✅ |
| empty     | ✅ | ✅ | ✅ | ✅ |

### Role Matrix

| Role        | RTWF | Agent Status | Agent Scorecard | Supervisor Scorecard |
|-------------|------|--------------|-----------------|----------------------|
| supervisor  | ✅ (SG-scoped) | ✅ (SG-scoped) | ✅ (access gated by SG match) | ✅ (peer names anonymized) |
| wfm-lead    | ✅ (all access) | ✅ (all access) | ✅ (all access) | ✅ (peer names visible) |
| agent       | ✅ (read-only) | ✅ (own row only) | ✅ (own agent only) | N/A — agent role cannot access supervisor scorecard |

---

## 2. Shared Component Audit

### AdherenceTrendChart
Used in PRDENG-2662 (agent-level) and PRDENG-2663 (team rollup level). Same component, same props interface. The only difference is the `series` data source — `generateAgentHistory` vs. `selectRollupSeriesForScope`.

Event markers render identically (circle = non-adherent, triangle = shift-trade, square = shift-exchange). In PRDENG-2663, only labor-override trades appear on the team chart — individual exchange events are suppressed to avoid noise at rollup level.

### KpiTile
Used in all four prototypes. `state` prop drives loading/error/empty/stale variants consistently. `thresholds` (green/amber) are set per tile based on business meaning.

### DrillOutLink
All drill-outs pass a `report` key and `params` object. Role-gating via `requiredRole="wfm-lead"` is consistent across all pages. The component renders a disabled/grayed state for insufficient-role users rather than hiding the link.

### StatusPill + AdherenceBadge
Used in both PRDENG-2661 (agent status summary table) and PRDENG-2663 (supervisor agent list table). Renders identically.

### HierarchyFilter
Present on all four pages in `mode="top-bar"` with `defaultRange="last30"`. The filter strip is cosmetic in the prototypes — it does not drive the scope ID or time range used in the page computations — but its presence ensures visual consistency with the production shell.

### DegradedSourceBanner
Appears at the top of every page when `forceState === 'degraded'`. Consistent placement and wording.

---

## 3. Deep-Link Flow

### Agent Status Summary → Agent Scorecard
`AgentTable` row click: `/wfm/reporting/agent-scorecard/[agentId]`  
No query params currently passed (range resets to `last30`). Acceptable for prototype — in production the active range would be forwarded.

### Supervisor Scorecard → Agent Scorecard
Row click passes `range`, `cfrom`, `cto`, and `origin` (current scope ID) as query params. The agent scorecard does not yet render a "back to scorecard" breadcrumb using `origin`, but the param is present for future implementation.

### Scope Type Switching (Supervisor Scorecard)
`switchScopeTo(scopeId, newType)` navigates to a new scope ID while preserving query params. Tested with:
- `sg-triage-day` → `fg-cx-ops` (SG → FG)
- `sg-triage-day` → `q-billing` (SG → Queue)

---

## 4. Mock Data Consistency

All mock data uses `TODAY = '2026-05-08'` as the base reference date. This is defined in:
- `mocks/wfm/store.ts` (`HIST_BASE`)
- Each page component (`const TODAY = '2026-05-08'`)

If the date were to diverge between files, date range calculations would produce inconsistent results. In production this would come from the server; in the prototype it's a constant to ensure reproducibility.

Seeded random generator (`seededRandFrom`) ensures the same agentId always produces the same history. Rollup results are therefore deterministic — refreshing the page produces identical numbers.

---

## 5. Known Prototype Limitations (not bugs)

| Limitation | Notes |
|------------|-------|
| HierarchyFilter does not drive page data | Cosmetic presence only; filter changes don't re-query |
| No back-navigation breadcrumb using `origin` param | The param is passed; rendering it is deferred |
| Queue scope peer comparison is always empty | Mock data doesn't define queue peer relationships |
| Agent list in supervisor scorecard has no pagination | Small mock dataset; not needed for prototype |
| Rollup uses 15-agent sample | Representative for prototype; production would aggregate server-side |
| Schedule readiness data is randomly seeded per scope | Seeded = deterministic per scope ID; not real FCS data |

---

## 6. Branches and Commits

| Prototype | Branch | Status |
|-----------|--------|--------|
| PRDENG-2660 Real-Time Workforce | `prototype/wfm-real-time-workforce` | Committed |
| PRDENG-2661 Agent Status Summary | `prototype/wfm-agent-status-summary` | Committed |
| PRDENG-2662 Agent Scorecard | `prototype/wfm-agent-scorecard` | Committed |
| PRDENG-2663 Supervisor Scorecard | `prototype/wfm-supervisor-scorecard` | Pending commit |
