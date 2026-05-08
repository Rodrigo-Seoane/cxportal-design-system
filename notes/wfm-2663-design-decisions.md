# PRDENG-2663 — Supervisor Scorecard: Design Decisions

**Prototype 4 of 4 in the WFM Reporting series**

---

## 1. Primary Task

Enable supervisors and WFM leads to assess team-level adherence at a glance, understand where the team stands relative to peers, identify agents needing attention, and track schedule publication readiness — all from a single scrollable page.

---

## 2. Rollup Math Strategy

**Decision:** Weighted average by scheduled minutes, sampling the first 15 agents per staffing group for performance.

**Why sampling:** Computing `generateAgentHistory` for 200+ agents × 90 days inline on every render would be prohibitively slow even in a prototype. Sampling 15 agents with the deterministic seeded generator produces representative data since the generator is a function of agentId — different agents produce different distributions, and 15 is enough to surface realistic variance.

**Weighted average vs. simple mean:** Weighted by scheduled time correctly gives more influence to agents who worked more hours. An agent with one short scheduled day should not equal an agent with 40 hours of scheduled time.

**De-dup footnote for queue scope:** When grouping by queue, agents serving multiple queues are counted once per queue entry. The footnote near the scope picker alerts users so they don't mistakenly interpret the totals as unique-agent counts.

---

## 3. Scope-Picker Architecture

**Decision:** Three-segment control — Staffing Group / Forecast Group / Queue — switching the URL path (`/supervisor-scorecard/[scope]`) while preserving query params (time range, custom dates).

**Why URL-path, not query param:** Each scope ID determines which rollup selectors fire, which peer set is returned, and which schedule readiness is shown. URL-path makes the scope deep-linkable and lets supervisors bookmark or share a specific team view.

`switchScopeTo()` in `rollup.ts` maps between scope types deterministically (SG → parent FG → first child queue) so the transition always lands on a valid scope.

---

## 4. Anonymization Design

**Decision:** Peers not managed by the current supervisor are anonymized to "Group A/B/C/…" stable labels. The anonymize closure is memoized per render so the same peer always gets the same label within one session.

**Why stable labels:** If labels reassigned on every sort interaction, users couldn't build a mental model ("Group B was above us before, now it's below — something changed"). Stability within a session is the minimum bar; cross-session persistence is a production concern outside the prototype scope.

**When anonymization does not apply:** WFM Lead role (`role !== 'supervisor'`) sees real names — they have read access to all groups.

---

## 5. Peer Comparison Panel

**Decision:** Inline bar-chart ranking with sort controls (Adherence %, OOA Count, Team Size). Empty state for queue scopes (no well-defined peers in mock data).

**Why no peers for queue scope:** The mock data doesn't define queue-to-peer relationships. Rather than fabricate a misleading set, the empty state message explains the constraint ("This is the only group in its parent scope — peer comparison requires at least two groups."). In production this would use whatever peer grouping the FCS hierarchy defines.

---

## 6. Schedule Publication Readiness Panel

**Decision:** 18-week horizontal scrollable grid with 4 status tiers (published → reviewed → generated → not-started). "Urgency" styling applied to not-started weeks within the next 2 weeks.

**Why 18 weeks:** Covers roughly a quarter — the typical planning horizon for most contact center scheduling teams. An 8-week summary chip gives the at-a-glance pass/fail without requiring scroll.

**Why not color-only:** Each status has both a color and an icon (CheckCircle, Clock, File, Warning), satisfying WCAG 1.4.1 (use of color).

---

## 7. Agent List — Worst-First Default

**Decision:** Default sort is `adherence-asc` (lowest adherence first, labeled "Worst first").

**Why:** A supervisor's primary action is coaching or intervening with underperformers. Forcing scroll past the high performers to find the at-risk agents wastes attention. "Best first" remains a sort option for recognizing high performers.

**Drill-through:** Clicking a row navigates to the Agent Scorecard with `range`, `cfrom`, `cto`, and `origin` (current scope) preserved in the URL, so the back-navigation context is available on the agent page.

---

## 8. KPI Tile Layout

**Decision:** 4-column grid for the main KPIs + a narrower 5th column for "Out of Adherence Now".

**Why narrower 5th tile:** "Out of Adherence Now" is a count (whole number, shorter label) rather than a formatted time or percentage. Giving it a full column wastes horizontal space. The `0.65fr` column makes it visually subordinate — contextual data rather than a primary metric.

---

## 9. Force State Inventory

Seven states tested via the dev tool:

| State     | Behavior |
|-----------|----------|
| `data`    | Normal rendered state with full mock data |
| `loading` | Skeleton placeholders for identity strip, KPI tiles, peer panel, chart, agent list, schedule panel |
| `error`   | Chart shows retry CTA; KPI tiles show `stale` state with cached-at timestamp |
| `degraded`| Degraded source banner at top; all tiles show amber "Stale" chip; data visible but stamped |
| `empty`   | Chart shows "No data for selected range" empty state; agent list shows empty message |
| `no-scope`| N/A — scope is always defined by URL |
| `no-peers`| Triggered for queue scopes; PeerComparisonPanel shows "No peer groups available" |

---

## 10. Shared Components Reused

- `AdherenceTrendChart` — team rollup series + labor-override shift trades as markers
- `KpiTile` — 5 instances
- `DrillOutLink` — 3 CTAs (Intraday Management, Schedule Publication, Queue & Agent Performance)
- `HierarchyFilter` — top-bar filter strip (same as other WFM pages)
- `DegradedSourceBanner` — degraded state banner
- `RoleSwitcher` + `ForceStateTool` — dev controls
- `StatusPill`, `AdherenceBadge` — per-agent row columns
- `Skeleton` — loading placeholders
