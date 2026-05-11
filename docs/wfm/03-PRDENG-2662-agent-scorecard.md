# Claude Code Prompt — PRDENG-2662: Agent Scorecard (Prototype)

> Paste this entire file as your prompt to Claude Code. This is **prototype 3 of 4** in the WFM Supervisor Reporting UI family. It is the first deep historical surface in the system and introduces the trend-chart pattern that PRDENG-2663 will reuse.

---

## Step 0 — Load shared context

Before writing any code, **read `00-CONTEXT.md`** in full, plus the prior design-decisions docs (`notes/wfm-2660-design-decisions.md`, `notes/wfm-2661-design-decisions.md`) and the discovery file (`notes/wfm-prototype-discovery.md`).

This view is **prototype 3 of 4**. It depends heavily on shared components built in PRDENG-2660 and PRDENG-2661 — do not duplicate them. It introduces one significant new shared component, `<AdherenceTrendChart />`, that PRDENG-2663 will reuse for team-level trend rollups.

---

## Step 1 — Quick repo re-orientation + chart library decision

Spot-check that the shared spine still works:

- `<HierarchyFilter />`, `<StatusPill />`, `<ActivityPill />`, `<AdherenceBadge />`, `<DegradedSourceBanner />`, `<DrillOutLink />`, `<RoleSwitcher />`, force-state dev tool — confirm import paths and behavior
- `mocks/wfm/store` — confirm it has the historical adherence series, shift-trade entries, shift-exchange entries, and time-off entries this prototype will read

**Chart library decision** (this is the one new piece of repo-level infrastructure for this view):

Look at what the discovery doc captured for charting. If a charting library is already in the repo, use it — even if it's not the one you'd pick from scratch. If none is present, prefer **Recharts** (lightweight, React-friendly, common in Next.js shadcn projects) and add it as a dependency. Whatever you choose, build a tiny wrapper at the same shared UI path so future charts go through the wrapper rather than touching the library directly:

```ts
// components/wfm/charts/LineChart.tsx (or repo's equivalent)
// Thin wrapper that maps design-system tokens to chart colors,
// ensures all charts honor reduced-motion, and exposes a tabular-data
// toggle for screen-reader users.
```

Do not introduce a second chart library if one already exists. Document the decision in a short addendum to `notes/wfm-prototype-discovery.md` so the next prototype sees it.

---

## Step 2 — UX strategy pass

Invoke the **`ux-strategist-designer`** skill. Frame the brief as:

> *I'm designing the Agent Scorecard for Centene supervisors and WFM Leads. This is the per-agent historical surface — supervisors land here from the Status Summary table when they want to understand "is this agent's adherence trending poorly, and if so, why?" Sources: Connect Data Lake (Phase 1; no Snowflake). The page must show the trend in one chart that's instantly readable, and surround it with the context a supervisor needs to interpret it: shift trades, shift exchanges, approved time off. The grace-period concept (configurable up to 10 minutes per activity) must be visible in the chart itself so a supervisor doesn't mistake threshold-zone behavior for non-adherence. Help me lock the chart anatomy, the side-context layout, and how an empty/no-history state for a brand-new agent feels supportive rather than broken.*

Have the skill produce a design-decisions doc at `notes/wfm-2662-design-decisions.md` covering:

1. The primary task (interpret an agent's adherence trend with enough context to act fairly — distinguish a real problem from a low-adherence day caused by approved time off, a labor-rule-overriding shift trade, or a one-off event)
2. Page IA: header → time-range selector → main chart → side panels → drill-out row
3. Chart anatomy: line series, grace-period band overlay, event markers (non-adherent events, shift trades, shift exchanges) — how each is visually distinct without becoming busy
4. The grace-period band: how to visualize "configurable up to 10 minutes per activity" so it's understood as a tolerance zone rather than an inferior outcome
5. Comparison-window strategy: each KPI card shows a delta against the previous equivalent period — what's the right copy ("vs. previous 7 days") and what happens when the previous period has no data
6. Side-context panels: shift-trade history, shift-exchange history, time-off pattern — how they are laid out so the supervisor can scan "was there a legitimate reason for that dip?"
7. Empty / no-history pattern (agent with <7 days of data) — how to communicate "more data is coming" without failing the page
8. Insufficient-permissions pattern — the supervisor opened a scorecard for an agent outside their staffing-group RBAC scope; how the friendly-forbidden state guides them back without being punitive

Keep it under 800 words. It's the source of truth for the implementation.

---

## Step 3 — Implement

Invoke the **`react-frontend-architect`** skill. Implementation brief follows.

### Route

```
/wfm/reporting/agent-scorecard/[agentId]
```

This is the route the Agent Status Summary already navigates to. Filter context arrives as URL params (forecast group, staffing group, queue, time-range) — preserve them on entry and write any range changes back to the URL so a copied URL restores the exact view.

### Page layout

Reuse the existing app shell. Single column with these regions:

1. **Page header** — breadcrumb (Reporting → Agent Status Summary → {Agent name}); page title is the agent name; page actions slot (Force-state dev tool, Role switcher, Refresh, drill-out CTAs collapsed into a "Open in…" dropdown for narrower viewports)
2. **Identity strip** — agent name, employee ID / AD identifier, forecast group, staffing group, shift profile, current `<StatusPill />`. The current status reads live from the mock store (so if the agent's status changes while the supervisor is on this page, the pill updates with the same row-highlight pattern as the Status Summary table).
3. **Time-range selector** — row of preset chips (Last 7 days / Last 30 days / Last 90 days / Quarter to date / Custom). Custom opens a date-range picker capped at 18 weeks. Range value is persisted in the URL. **The range applies uniformly** across the KPI cards' deltas, the trend chart, and the side panels.
4. **KPI card row** — 4 cards across using the existing `<KpiTile />` from prototype 1, in *summary* mode (no sparkline; show a delta against previous equivalent period instead):
    - *Adherence %* — value with trend arrow + delta
    - *Adherent Time* — value formatted "36h 12m of 40h"
    - *Scheduled Time* — value formatted "40h"
    - *Non-Adherent Time* — value with sub-bucket counts as a secondary line ("Late: 8 · Early-out: 2 · Off-activity: 5")
5. **`<AdherenceTrendChart />`** — the main visualization (component spec below); occupies the page's primary horizontal real estate
6. **Two-column side-context section** below the chart:
    - Left: **Shift trades** (cards or compact table, see spec)
    - Right: **Shift exchanges** (visually distinct from trades — different icon, different accent — so a supervisor can tell them apart at a glance)
7. **Time-off strip** — full-width mini calendar / heat strip showing approved time-off days within the selected range, hover for type and approval status
8. **Drill-out row** — explicit row of `<DrillOutLink />` CTAs at the page bottom: *Open in Schedule Adherence Report*, *Open in Schedule Publication Report*. Each pre-fills `agentId` and the current range as URL params. Visible to roles per `00-CONTEXT.md` RBAC.
9. **Adherence-threshold affordance** — a small read-only chip near the chart showing the currently-configured grace period ("Grace: ±5 min per activity") with a tooltip: *"Grace period is the time tolerance per activity before adherence drops. Configured in FCS by an Admin."* Read-only here.

### `<AdherenceTrendChart />` — the new shared component

Build at the shared chart path established in Step 1. It will be reused by the Supervisor Scorecard.

**Props:**

```ts
type Props = {
  series: { date: string; adherencePct: number; adherentMin: number; scheduledMin: number; nonAdherentMin: number }[]
  events: ChartEvent[] // non-adherent events, shift trades, shift exchanges
  gracePeriodMinutes: number // 0..10
  range: { from: string; to: string }
  state: 'loading' | 'data' | 'empty' | 'error' | 'stale'
  onMarkerClick?: (event: ChartEvent) => void
}

type ChartEvent =
  | { kind: 'non-adherent'; date: string; durationMin: number; activityName: string }
  | { kind: 'shift-trade'; date: string; counterpartyAgent: string; status: 'approved' | 'pending' | 'rejected' }
  | { kind: 'shift-exchange'; date: string; counterpartyAgent: string; status: 'approved' | 'pending' | 'rejected' }
```

**Visualization rules:**

- Line series of Adherence % over time (one point per day; per-shift granularity available as a toggle)
- Y-axis 0–100%, with a gridline every 25%
- **Grace-period band overlay**: shaded zone on the lower portion of the chart between (100% − {gracePeriodMinutes}/scheduledMinutesPerDay × 100) and 100%, in a distinct lower-saturation color. The band width adapts as `gracePeriodMinutes` changes. Hover within the band shows a tooltip: *"Within grace period — counted as adherent per FCS configuration"*.
- Event markers: non-adherent events as circles, shift trades as triangles, shift exchanges as squares — meaning conveyed by **shape + color**, never color alone. Marker size is sufficient for keyboard focus.
- Hover tooltip per data point: date, adherence %, scheduled min vs. adherent min vs. non-adherent min — exact values, not rounded to ambiguity
- Click marker → calls `onMarkerClick` (the page surfaces the event detail in a right-side flyout reusing the repo's drawer pattern)
- States:
    - `loading` — skeleton chart that preserves height
    - `empty` — chart area with helpful message ("Adherence trend will appear after 7 days of activity") and a faint placeholder series so the page doesn't feel hollow
    - `error` — chart area with retry CTA; if cached series exists, render it with reduced opacity + "Stale" indicator
    - `stale` — render the series at reduced opacity with a small banner above the chart: "Data cached as of {timestamp}"
- **Tabular toggle**: button above the chart "View as table" → swaps the chart for an accessible table of the same data points and event log. Preserves the current selection / hovered-point context if possible.
- **Keyboard navigation**: Tab to enter the chart; arrow keys move between points; Enter on a marker opens the event detail flyout
- **Reduced motion**: respect `prefers-reduced-motion`; disable any line-draw or marker-pop animation

### Shift-trade panel

Compact table or card list (decision lives in the design-decisions doc):

| Field            | Notes                                                  |
|------------------|--------------------------------------------------------|
| Date             | of the trade                                           |
| Counterparty     | other agent's name                                     |
| Original shift   | "Mon 06:00–14:00"                                      |
| Traded shift     | "Tue 14:00–22:00"                                      |
| Hours variance   | "+0h" / "-2h" / etc.                                   |
| Labor override   | flag icon if rules were overridden (per SOW config)    |
| Status           | Approved / Pending / Rejected                          |

Empty state: "No shift trades in this period". Drill-in (where RBAC allows) opens the native shift-trade configuration page in a new tab via `<DrillOutLink />`.

### Shift-exchange panel

Same compact pattern as trades but visually distinct. Per-exchange fields: date, counterparty, original shift, exchanged shift, status.

### Time-off strip

Full-width strip below the side-context section. Implementation options (decision in the design-decisions doc):

- **Option A**: mini calendar (one box per day across the range, color-coded by time-off type)
- **Option B**: horizontal heat strip with month dividers

Hover on any day reveals time-off type + approval status. Days within the selected range that have time off correlate with dips in the adherence chart — the supervisor uses this to distinguish *legitimate low-adherence days* from *real adherence problems*.

### Status update reflection

The identity strip's `<StatusPill />` subscribes to the same mock-store status events the Status Summary table uses. If the agent's status changes while the supervisor is on this page, the pill updates with the standard row-highlight pulse (respecting reduced-motion).

### States

Verify each by switching the Force-state dev tool (shared from prototype 1):

1. **Loading** — skeleton: header strip placeholder, KPI card skeletons, chart skeleton, side panels skeleton, time-off strip placeholder; layout doesn't shift
2. **Data — happy path** — agent with 30+ days of mixed-adherence data, 2 shift trades (one approved, one pending), 1 shift exchange, 2 approved time-off days
3. **Empty / no-history** — new agent with <7 days of data; KPI cards show partial-period values with a caveat indicator; chart shows the empty-state message; side panels each show their empty states
4. **Error** — inline error in each region with retry; chart falls back to last cached series with "Stale" indicator
5. **Insufficient permissions** — supervisor whose RBAC scope does not include this agent's staffing group; replace the entire page body with a friendly forbidden state: title "You don't have access to this agent's scorecard", body explaining staffing-group scope, primary CTA "Back to Agent Status Summary", secondary CTA "Request access" (mock — opens a placeholder flyout). Trigger this via the role switcher: switch to a Supervisor whose default staffing group differs from this agent's.
6. **Degraded source** — `<DegradedSourceBanner />` on top; identity strip's status pill freezes with "Stale" indicator; chart shows cached series; side panels indicate data may be stale

### Accessibility

Document at the top of the page file:

- Focus order: time-range selector → KPI cards → chart "View as table" toggle → chart entry point → first event marker → side panels → time-off strip → drill-out CTAs
- **Chart alt-text strategy**: above the chart, render a hidden-but-screen-reader-accessible summary like *"Adherence over last 30 days: range 78–94%, average 87%, 3 days below threshold, 2 shift trades, 1 shift exchange, 2 approved time-off days"* — generated from the same series data
- Tabular toggle (above) is the primary accessible alternative for screen-reader users
- Markers convey meaning by shape **and** color
- Color contrast: line series, grace band, markers must each pass AA against chart background
- Click targets: markers ≥ 44px (or expand the hit-area beyond the visual marker via SVG `<rect>` overlays)
- Reduced-motion variant disables line-draw animation, marker pop-in, identity-strip pulse

---

## Step 4 — Self-review with `ux-heuristics-auditor`

Run the **`ux-heuristics-auditor`** skill. Capture findings at `notes/wfm-2662-heuristics-audit.md`. Address P1/P2 issues before considering the ticket done.

Pay specific attention to: (a) the grace-period band — is it understood as a tolerance zone or misread as a bad zone? (b) the no-history empty state — does it feel supportive or broken? (c) the insufficient-permissions state — is it clearly informational and not punitive? (d) the side-context panels — do they help a supervisor distinguish a legitimate dip from a real adherence problem in under 5 seconds?

---

## Step 5 — Definition of done

- [ ] `notes/wfm-2662-design-decisions.md` exists and was followed
- [ ] Chart library decision documented in `notes/wfm-prototype-discovery.md`
- [ ] Route `/wfm/reporting/agent-scorecard/[agentId]` renders with filter context preserved from entry
- [ ] All six states verified via Force-state dev tool (loading / data / empty-no-history / error / insufficient-permissions / degraded)
- [ ] Time-range presets work; custom range capped at 18 weeks; URL persists
- [ ] `<AdherenceTrendChart />` lives in shared UI; PRDENG-2663 will reuse it
- [ ] Grace-period band visualized; tooltip explains the concept; band width updates with `gracePeriodMinutes`
- [ ] Event markers rendered with shape + color; click opens event detail flyout
- [ ] "View as table" toggle swaps chart for an accessible table of the same data
- [ ] Shift-trade and shift-exchange panels rendered with distinct visual treatment; counterparty agent links navigate to that agent's scorecard (preserves range)
- [ ] Time-off strip renders within the selected range; correlation with dips in the chart is observable
- [ ] Drill-out CTAs to native Schedule Adherence Report and Schedule Publication Report pre-fill `agentId` + range as URL params
- [ ] Identity strip's status pill subscribes to live mock events; updates with reduced-motion respect
- [ ] Adherence threshold affordance shows current grace value, read-only with tooltip
- [ ] `notes/wfm-2662-heuristics-audit.md` exists; P1/P2 findings resolved
- [ ] Branch `prototype/wfm-agent-scorecard` opened with the changes

---

## What this prototype is NOT

- Not Snowflake-sourced trend data (Phase 2; out of scope)
- Not PowerBI rendering (out of scope per SOW)
- Not the grace-period configuration surface — display only; configuration lives in FCS
- Not the alerts engine — alerts surface on the dashboard, not here
- Not real Connect Data Lake wiring — all series and events come from the mock store

---

## Hand-off to PRDENG-2663 (Supervisor Scorecard)

The next prototype reuses everything from prototypes 1–3. Specifically:

- All shared primitives stay; do not duplicate
- `<AdherenceTrendChart />` is the chart used for team-level rollup (same component, different aggregation of the underlying data)
- The Supervisor Scorecard's agent list will navigate **into this view** — same filter-context preservation pattern as Status Summary → Agent Scorecard
- Shift-trade, shift-exchange, time-off mock data is now seeded; Supervisor Scorecard will roll up across agents

Update `00-CONTEXT.md` with any chart-library decisions, new tokens, or component contract changes so the final prompt stays accurate.
