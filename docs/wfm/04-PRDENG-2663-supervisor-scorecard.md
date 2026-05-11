# Claude Code Prompt — PRDENG-2663: Supervisor Scorecard (Prototype)

> Paste this entire file as your prompt to Claude Code. This is **prototype 4 of 4** in the WFM Supervisor Reporting UI family. It closes out the system; the goal is a coherent rollup surface that reuses everything built in the prior three prototypes and adds only what's specific to a team-level view.

---

## Step 0 — Load shared context

Before writing any code, **read `00-CONTEXT.md`** in full, plus all three prior design-decisions docs (`notes/wfm-2660-design-decisions.md`, `notes/wfm-2661-design-decisions.md`, `notes/wfm-2662-design-decisions.md`) and the discovery file (`notes/wfm-prototype-discovery.md`).

This view is **prototype 4 of 4**. Almost every component it needs already exists. The mandate is **reuse**: any new component you reach for, ask first whether an existing one can be parameterized to fit. The two new things this view introduces are a **rollup-math layer** in the mock store (so KPIs can be computed for a Staffing Group, Forecast Group, or Queue scope from the same agent-level fixtures) and a **schedule-publication readiness panel** that doesn't appear elsewhere.

---

## Step 1 — Quick repo re-orientation

Spot-check that the shared spine is intact:

- `<HierarchyFilter />`, `<KpiTile />`, `<StatusPill />`, `<ActivityPill />`, `<AdherenceBadge />`, `<DegradedSourceBanner />`, `<DrillOutLink />`, `<RoleSwitcher />`, force-state dev tool — confirm all are imported from the shared paths, not duplicated
- **`<AdherenceTrendChart />`** — confirm it's reusable for aggregated series; if its prop contract assumes per-agent data, extend it to accept rollup series rather than forking the component
- `mocks/wfm/store` — confirm agent-level fixtures, queues, time-off, shift-trades, shift-exchanges. Audit the store for whether selectors exist for *rollup* aggregations across staffing groups, forecast groups, and queues; if not, this prototype adds them.

Update `notes/wfm-prototype-discovery.md` with anything that drifted. **Do not introduce a parallel chart component** — extend the existing one.

---

## Step 2 — UX strategy pass

Invoke the **`ux-strategist-designer`** skill. Frame the brief as:

> *I'm designing the Supervisor Scorecard for Centene WFM Leads (and Supervisors viewing their own team in context of peers). This is the team rollup surface — supervisors land here to answer "how is my team performing this week vs. peers, and is my schedule for next week ready?" Sources: Connect Data Lake (Phase 1; no Snowflake; no PowerBI). The page must roll up the same vocabulary as the per-agent Scorecard (Adherence %, Adherent Time, Scheduled Time, Non-Adherent Time) at three orthogonal scopes: Staffing Group, Forecast Group, Queue. Two unique requirements: a peer-comparison view that anonymizes peer groups when the viewer is a Supervisor (not a WFM Lead), and a schedule-publication readiness panel showing the next 18 weeks of upcoming schedule status with a drill-out to native Schedule Publication Report. Help me lock the rollup-scope picker, the peer-comparison anatomy, and the layout that keeps "this week's adherence" and "next week's schedule readiness" both legible without one drowning the other.*

Have the skill produce a design-decisions doc at `notes/wfm-2663-design-decisions.md` covering:

1. The primary task (assess team performance and forward-schedule readiness in one surface; identify which agent on the team is dragging the rollup)
2. Page IA: identity strip → time-range → rollup KPIs → peer comparison → trend → agent list → schedule-publication readiness → drill-out row
3. Rollup-scope behavior: how the page presents the choice between viewing rollup *by Staffing Group* (default for a Supervisor), *by Forecast Group* (default for WFM Lead), or *by Queue* (orthogonal — note: agent-to-queue is many-to-many and rollup may double-count without de-dup; how to surface that footnote)
4. Peer comparison anatomy: bar chart vs. ranked list — pick one and justify; how the *current* group is highlighted; sort options (by adherence, by out-of-adherence count, by team size)
5. Anonymization rule: Supervisor sees own group named, peers anonymized as "Group A / Group B / Group C"; WFM Lead sees all named. The role switcher in the page header is the lever for demoing this.
6. Agent list within the team — what columns, default sort (adherence ascending so the worst is first), drill-in to Agent Scorecard with filter context preserved
7. Schedule-publication readiness panel — visual model for "Generated / Reviewed / Published / Not Started" across upcoming weeks within the 18-week window; how to surface "you have 3 weeks unpublished" without inducing alarm fatigue
8. Empty / no-peers — when the parent forecast group has only one staffing group, peer comparison should not render an empty bar chart; the message must be neither sad nor an error

Keep it under 800 words.

---

## Step 3 — Implement

Invoke the **`react-frontend-architect`** skill. Implementation brief follows.

### Route

```
/wfm/reporting/supervisor-scorecard/[scope]
```

`[scope]` is a slug pair encoding the rollup scope, e.g., `sg-overnight-nurses`, `fg-ok-triage`, `q-triage-en`. The page reads the scope from the route, plus filter overrides from URL query params (so the same page can be deep-linked to a specific forecast group with a specific time range).

A canonical landing route exists at `/wfm/reporting/supervisor-scorecard` (no scope) that auto-routes to the user's default scope based on `useCurrentUser()`:

- Supervisor → their own staffing group
- WFM Lead / Admin → the highest-rollup forecast group available

### Page layout

Reuse the existing app shell. Single column with these regions:

1. **Page header** — breadcrumb (Reporting → Supervisor Scorecard); title is the scope's display name ("Forecast Group: OK — Triage" / "Staffing Group: Overnight Nurses"); page actions slot (Force-state dev tool, Role switcher, Refresh, drill-out CTAs collapsed into "Open in…" dropdown for narrow viewports)
2. **Identity strip** — scope name, parent scope (e.g., for a Staffing Group: parent Forecast Group; for a Forecast Group: parent line of business), agent count, supervisor name (if Staffing Group), time-range chip
3. **Rollup-scope picker** — small segmented control: *By Staffing Group* / *By Forecast Group* / *By Queue*. Default per role. Switching this changes the underlying rollup math AND updates the route. Switching to "By Queue" surfaces the de-dup footnote inline ("Agents serving multiple queues are counted once per queue — totals may exceed agent count").
4. **Time-range selector** — same component as Agent Scorecard; presets: Last 7 days / Last 30 days / Last 90 days / Quarter to date / Custom up to 18 weeks; persisted in URL; applies uniformly to KPI cards' deltas, peer comparison, trend, agent list
5. **Rollup KPI card row** — 4 cards across using `<KpiTile />` in summary mode, **using the same vocabulary as PRDENG-2662** so a supervisor can move between views without relearning labels:
    - *Team Adherence %* — value + delta vs. previous period
    - *Total Adherent Time* — formatted "1,448h 32m of 1,600h"
    - *Total Scheduled Time* — formatted "1,600h"
    - *Total Non-Adherent Time* — value with sub-bucket counts as a secondary line ("Late: 23 · Early-out: 8 · Off-activity: 14")
    - Plus a fifth (smaller / lower visual weight): *Out-of-Adherence Agent Count today*
    - Each card supports drill into an in-flyout chart of the metric over time for the team
6. **Peer comparison panel** — pattern decided in the design-decisions doc. The current scope is highlighted; sort controls are above the chart/list. Anonymization is computed via `useCurrentUser()`:
    - Supervisor: own group named; peers labeled "Group A", "Group B", etc.
    - WFM Lead / Admin: all groups named
    - The Role switcher in the page header is the demo lever for reviewers
7. **Team trend** — `<AdherenceTrendChart />` from PRDENG-2662, fed with the rollup series (one series for the current scope; optional overlay series for the parent scope's average). Reuse the component; pass `series` aggregated at the current scope and `events` populated from team-level events (e.g., a labor-rule-overriding shift trade is a team-level event worth marking). Honor the same grace-period band visualization.
8. **Agent list** — compact table of agents in this scope. Columns:
    - Agent name (clickable)
    - Adherence % (period)
    - Out-of-Adherence count
    - Scheduled hours
    - Time-off days
    - Default sort: adherence **ascending** (worst first — the supervisor's first task is to see who needs attention)
    - Click row → navigates to `/wfm/reporting/agent-scorecard/{agentId}` preserving the time range and the originating scope
    - Empty state: "No agents in this group for the selected period"
9. **Schedule-publication readiness panel** — full-width row of upcoming weeks within the 18-week window. Visual model decided in the design-decisions doc; the spec calls for:
    - One column per upcoming week
    - Each column shows status (Generated / Reviewed / Published / Not Started), publication date, % of agents covered
    - Color treatment: green for *Published*, amber for *Generated/Reviewed*, red/warning for *Not Started* on weeks within 2 weeks of starting (use existing tokens; do not introduce new colors)
    - A "weeks unpublished" summary chip at the top of the panel ("3 of next 8 weeks not yet published")
    - Each column has a `<DrillOutLink />` to native Schedule Publication Report pre-filtered by week + scope
    - Empty state: "No upcoming schedules generated" + link to the native generate-schedules page (which is out of CxPortal scope, but a reviewer should see the affordance)
10. **Drill-out row** — explicit row of `<DrillOutLink />` CTAs at the page bottom: *Open in Intraday Management Report*, *Open in Schedule Publication Report*, *Open in Queue & Agent Performance Dashboard*. Each pre-fills `forecastGroupId` / `staffingGroupId` / `queueId` (whichever applies to the current scope) and the time range as URL params. Visible to roles per `00-CONTEXT.md` RBAC.

### Rollup math layer (the new piece in the mock store)

Add selectors to `mocks/wfm/store` for:

```ts
// All return KPI data with the same shape as <KpiTile /> consumes
selectRollupForStaffingGroup(staffingGroupId, range)
selectRollupForForecastGroup(forecastGroupId, range)
selectRollupForQueue(queueId, range) // documents de-dup behavior
selectRollupSeriesForScope(scope, range) // for the trend chart
selectPeerScopesForScope(scope) // returns sibling staffing groups within the same forecast group
selectScheduleReadinessForScope(scope, weeksAhead) // returns 18 weeks of mock status
```

Document the rollup approach in code comments at the top of the selectors file:

- **By Staffing Group**: weighted average of agent-level adherence, weighted by scheduled time
- **By Forecast Group**: roll up across child staffing groups using the same weighting
- **By Queue**: rollup across agents who serve that queue; **agents serving multiple queues are counted once per queue** — surface this footnote on the page
- **Time values**: shown as h/m formatting (`formatHm` utility)
- **Percentages**: rounded to 1 decimal at display time, not in the selector

The same selectors will be the basis of the future build story's API contract — they're worth getting right at the prototype level.

### Anonymization helper

Add a small utility:

```ts
function anonymizeScopeName(scope, viewerRole, viewerScopeId): string
```

Returns the actual name when `viewerRole !== 'supervisor'` or when `scope.id === viewerScopeId`; returns `"Group A"` / `"Group B"` etc. otherwise. Memoize per-render so the same peer always gets the same anon label across the page.

### States

Verify each by switching the Force-state dev tool (shared from prototype 1):

1. **Loading** — skeleton: identity strip + scope picker, KPI cards, peer comparison, trend chart, agent list, schedule readiness panel; layout doesn't shift
2. **Data — happy path** — Staffing Group "Overnight Nurses" with 4 peer staffing groups in the same Forecast Group, 30-day range, mixed adherence, 12 agents in the team, 3 of next 8 weeks unpublished
3. **Empty** — scope selected has no agents in the time-range — KPI cards show zero values with caveat indicator; agent list shows empty state; schedule readiness still renders if upcoming schedules exist
4. **Error** — inline error in each region with retry; cached values shown with "Stale" pill; agent list shows last-cached rows
5. **No peers** — switch to a Forecast Group containing only one Staffing Group; peer comparison panel shows "No peer groups available — this is the only staffing group in this forecast group" rather than an empty chart
6. **Degraded source** — `<DegradedSourceBanner />` on top; KPIs show last-known with "Stale" pill; trend chart cached with reduced opacity; agent list rows show "Stale" badge in header
7. **Anonymization (Supervisor view)** — toggle Role switcher to Supervisor; peers in the comparison panel now show as "Group A", "Group B"; current group remains named; agent names in the team list remain visible (the supervisor manages this team)

### Accessibility

Document at the top of the page file:

- Focus order: scope picker → time-range → KPI cards → peer comparison sort → peer comparison entries → trend chart "View as table" toggle → trend → agent list → schedule readiness columns → drill-out CTAs
- Peer comparison chart: provide alt-text summary ("This staffing group ranks 4th of 6 by adherence; range 78–94%") and the "View as table" toggle the trend chart already exposes
- Anonymized peers: ensure each anonymized label is stable across screen-reader announces (don't reshuffle on re-render)
- Schedule readiness columns: each column is keyboard-focusable; Enter opens the drill-out; status conveyed by **color + text + icon**, never color alone
- Color contrast: KPI cards, trend, peer comparison, schedule readiness all pass AA against page bg
- Reduced-motion variant disables KPI tile pulse, chart line-draw, peer-comparison sort animation

---

## Step 4 — Self-review with `ux-heuristics-auditor`

Run the **`ux-heuristics-auditor`** skill. Capture findings at `notes/wfm-2663-heuristics-audit.md`. Address P1/P2 issues before considering the ticket done.

Pay specific attention to: (a) the rollup-scope picker — is the choice between *Staffing Group / Forecast Group / Queue* obvious and is the de-dup footnote understood? (b) the peer comparison anonymization — does the reviewer believe the rule by toggling roles? (c) the schedule-publication readiness panel — does it communicate forward risk without inducing alarm? (d) the agent-list drill-in — does the time range and originating scope feel preserved in the next view?

---

## Step 5 — Definition of done

- [ ] `notes/wfm-2663-design-decisions.md` exists and was followed
- [ ] Route `/wfm/reporting/supervisor-scorecard/[scope]` and the canonical `/wfm/reporting/supervisor-scorecard` (auto-routes by role) both render
- [ ] All seven states verified via Force-state dev tool (loading / data / empty / error / no-peers / degraded / anonymization)
- [ ] Time-range presets work; custom range capped at 18 weeks; URL persists
- [ ] Rollup-scope picker switches the underlying selectors; URL updates; de-dup footnote surfaces on Queue scope
- [ ] Peer comparison renders the current scope highlighted; sort controls work; anonymization toggles correctly when role changes
- [ ] `<AdherenceTrendChart />` is reused (not duplicated) — extended only as needed to accept rollup series
- [ ] Agent list defaults to adherence-ascending sort; row click → Agent Scorecard with range + scope preserved
- [ ] Schedule-publication readiness panel renders 18 weeks; status states styled correctly; drill-out per-column works
- [ ] Drill-out row CTAs open new-tab placeholder URLs with correct params per scope
- [ ] All KPI vocabulary matches Agent Scorecard verbatim
- [ ] Rollup math documented in `mocks/wfm/store` with weighting strategy and de-dup behavior in code comments
- [ ] `notes/wfm-2663-heuristics-audit.md` exists; P1/P2 findings resolved
- [ ] Branch `prototype/wfm-supervisor-scorecard` opened with the changes

---

## What this prototype is NOT

- Not Snowflake-sourced data (Phase 2; out of scope)
- Not PowerBI rendering (out of scope per SOW)
- Not the schedule generation UI — that lives natively in FCS; the readiness panel only *reports* status and drills out
- Not forecasting visualization (out of scope per SOW §b Forecasting Out of Scope)
- Not real Connect Data Lake wiring — all rollups read from the mock store

---

## Closing the family — final consistency pass

After this prototype lands, do one final pass across all four routes to confirm the family hangs together:

1. Open the four routes in sequence: Real-Time Workforce Dashboard → Agent Status Summary → Agent Scorecard → Supervisor Scorecard. Confirm shared components render identically across views (no visual drift).
2. Test the deep-link flow end-to-end: from the dashboard's agent panel, click an agent row → Status Summary preserves filter; from there, click an agent name → Agent Scorecard preserves range + scope; from the Agent Scorecard's identity strip, navigate up to Supervisor Scorecard for that agent's staffing group; from there, drill back into another agent. The whole loop should feel like one app.
3. Toggle the Role switcher across all four views; confirm RBAC visibility behaves consistently (Supervisor sees own scope only; WFM Lead sees all; Admin sees all + management affordances).
4. Toggle the Force-state dev tool across all four views with the same state selected; confirm the degraded-source banner, stale indicators, and skeletons are visually consistent.
5. Run `ux-heuristics-auditor` one more time across the four routes as a *system audit*, not a per-view audit. Capture findings at `notes/wfm-system-audit.md`. The system audit is the final gate before this family is ready for stakeholder review.

This last pass is what turns four prototypes into a coherent reporting UI.
