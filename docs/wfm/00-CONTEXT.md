# WFM Supervisor Reporting UI — Prototype Context

> **Read this first, before any ticket-specific prompt.** This file describes the shared system that all four supervisor views live in. Each ticket prompt assumes you have this loaded and will not re-state it.

---

## Source of truth

- **Epic**: PRDENG-2655 — *WFM — SOW 4 CxPortal Reporting (M5)*
- **Discovery story (parent)**: PRDENG-2656 — *WFM SOW 4 M5 | CxPortal Reporting UI — Design Discovery & Stakeholder Review*
- **SOW milestone**: §d M5 — Agent UI + CxPortal Reporting UI, due **2026-07-15**, $100k engagement value
- **Customer**: Centene (Oklahoma LOB pilot, ~5,500 clinical agents — Doctors, Nurses)
- **Phase-1 data sources only**: Amazon Connect agent event stream, native real-time metrics, Connect Data Lake
- **Phase-2 (out of scope)**: Snowflake Analytics Layer, PowerBI

---

## The four views in the system

| Order | Ticket       | View                          | Surface type                  | Drills into          |
|-------|--------------|-------------------------------|-------------------------------|----------------------|
| 1     | PRDENG-2660  | Real-Time Workforce Dashboard | At-a-glance, real-time        | per-metric trend     |
| 2     | PRDENG-2661  | Agent Status Summary          | Dense table, real-time        | PRDENG-2662 Scorecard|
| 3     | PRDENG-2662  | Agent Scorecard               | Per-agent, historical         | native FCS reports   |
| 4     | PRDENG-2663  | Supervisor Scorecard          | Team rollup, historical       | PRDENG-2662 Scorecard|

Build them in this order. Each ticket prompt explicitly states what to import from earlier tickets.

---

## Audience & RBAC

| Role          | Default scope                              | Can see alerts config | Can open Agent Workspace from a row |
|---------------|--------------------------------------------|-----------------------|--------------------------------------|
| Supervisor    | Their own staffing group                   | View only             | If granted in their RBAC profile     |
| WFM Lead      | All forecast groups                        | Full CRUD             | Yes                                  |
| Admin         | All                                        | Full CRUD             | Yes                                  |

Assume a `useCurrentUser()` hook returns `{ role, defaultStaffingGroupId }` and the prototype offers a role switcher in the header so reviewers can see each variant.

---

## Shared vocabulary — use verbatim

These exact terms come from the SOW and **must** be the labels in the UI:

- **Adherence %** — % of scheduled time the agent was on the expected activity
- **Adherent Time** — total time spent on the expected activity
- **Scheduled Time** — total time the agent was scheduled to work
- **Non-Adherent Time** — Scheduled − Adherent (with sub-buckets: Late, Early-out, Off-activity)
- **Activity categories**: *Productive*, *Non-Productive*, *Time Off* (always title-cased)
- **Status categories**: *Available*, *On Call*, *Aux*, *Offline*, *Time Off*, *Unknown*, *Pending* (Pending = AUX code not yet mapped — see decision-pending block below)
- **Hierarchy**: *Forecast Group* → *Staffing Group* → *Agent*; *Queue* is **orthogonal** (routing, not staffing)
- **Grace period** — configurable up to 10 minutes per activity. Adherence trend visualizations include a band that shades the grace zone.

---

## Decision-pending blocks (visualize as design notes, not as gates)

The discovery ticket flags three external decisions with SOW-dated blockers. The prototype must show placeholder treatments for each so reviewers can see them:

1. **AUX code mapping** (Centene, due 2026-04-30). When a code is unmapped, render the status pill as gray with label "Pending" and a tooltip: *"Awaiting Centene AUX code mapping decision"*.
2. **Auth-level vs. line-level routing** (Centene, due 2026-05-15). Anywhere the queue dimension matters, expose both as toggleable in the filter, with a banner the first time the toggle is used.
3. **AWS proficiency attribute limit** (AWS, 60 days from SOW execution). Not directly visible in these views; ignore unless a sub-spec calls it in.

---

## Filter taxonomy — implement once, reuse across all four views

A single `<HierarchyFilter />` component must support every view. Behavior:

- Cascading multi-select: Forecast Group → Staffing Group → Agent
- Orthogonal Queue multi-select
- Time-range selector with these presets: **Live** (Dashboard, Status Summary), **Last hour**, **Today**, **Last 7 days**, **Last 30 days**, **Last 90 days**, **Quarter to date**, **Custom**
- Custom range capped at **18 weeks** (matches native scheduling window)
- Filter chips with individual remove + Clear-All
- **State persists in the URL as query params** so any view is shareable (`?fg=ok-triage&sg=overnight-nurses&q=triage&range=last-7d`)
- Default scope per role (per RBAC table above)
- Search-within for forecast group and agent (typeahead)
- Read filter from URL on mount; write to URL on change (use `useSearchParams` from `next/navigation`)

---

## Drill-out CTAs to native FCS reports

All four views drill out to one or more of these. The native targets are AWS Connect FCS dashboards. For the prototype, render the link with the CxPortal external-link convention and a `target="_blank"` placeholder URL of the form:

```
https://connect.example.com/fcs/{report}?{params}
```

Reports referenced:

- *Schedule Adherence Report*
- *Schedule Publication Report*
- *Intraday Management Report*
- *Calendar view*
- *Queue & Agent Performance Dashboard*

URL params to include where applicable: `agentId`, `forecastGroupId`, `staffingGroupId`, `queueId`, `from`, `to`. Visual: trailing external-link icon on the CTA, plus the role-aware visibility rule (some CTAs only render for WFM Lead).

---

## Components to look for in the existing repo (and reuse)

When the per-ticket prompt tells you to explore the repo, look for and reuse:

- App shell / sidebar nav (the discovery story confirmed *Sidebar Nav* is the standard)
- *Right-side flyout* for review/confirmations (also confirmed standard)
- Page header, breadcrumb, page-actions slot
- Data table primitive with virtualization, sticky header, column resize, row selection
- Filter chips, multi-select combobox / typeahead
- Date-range picker
- Tabs, Tooltip, Popover, Dialog, Toast, Banner / Alert, Skeleton
- KPI / stat card primitive (extend if needed; **do not** introduce a new color scale — extend tokens)
- Pill / Badge primitive (extend variants for status and activity categories)
- Chart wrapper components (line, bar, sparkline) — if absent, scaffold a minimal wrapper around the existing chart library and use design-system tokens for colors

If a primitive doesn't exist, create it inside the existing component library directory using the same file/style conventions as neighboring components — never introduce a new styling approach.

---

## Net-new components this prototype family needs

Build these once, reuse across views:

- `<HierarchyFilter />` — described above
- `<KpiTile />` — primary value, label, secondary delta, sparkline, threshold band (green/amber/red/unknown), pulse on update, "Last updated" microcopy, click-to-drill
- `<StatusPill />` — bound to category color; shows AUX code in tooltip; "Pending" treatment for unmapped codes
- `<ActivityPill />` — three category variants (Productive, Non-Productive, Time Off)
- `<AdherenceBadge />` — "Out of adherence" indicator used on rows and in scorecards
- `<DegradedSourceBanner />` — banner across top of any page when source is degraded; supports cached-as-of timestamp + "Stale" pill on KPI tiles
- `<DrillOutLink />` — wraps the external-link convention to native FCS reports, with role gate
- `<AdherenceTrendChart />` — line chart with grace-band overlay, event markers, tabular toggle for a11y
- `<RoleSwitcher />` — header dev-tool only; visible in prototype; toggles `useCurrentUser()` between Supervisor / WFM Lead / Admin

Place these under whatever path your repo already uses for shared UI (e.g., `components/ui/` or `components/wfm/`). If unsure after exploring, prefer a new sub-folder `components/wfm/reporting/` so this family stays scoped.

---

## States — every view must implement these

Every view in this family must have explicit treatments for:

1. **Loading** — skeleton placeholders that preserve layout (no shift)
2. **Data — happy path** — populated with realistic mock data at Oklahoma scale (~5,500 agents in the system, but never render all in one table)
3. **Empty** — when filters return zero matches, with helpful copy and a Clear-Filters CTA
4. **Error** — 5xx returned; inline error with retry; cached values shown with "Stale" pill where applicable
5. **Partial-data** — one region loaded, another still loading or stale; explicit per-region indicator
6. **Degraded source** — Connect agent event stream unavailable (single-region DR); banner across top with cached-as-of timestamp; alerts paused indicator

The prototype should expose a "Force state" dev tool in the header that lets reviewers cycle through these — easier than triggering them with mock data.

---

## Mock data

Generate mock data that is plausible at Oklahoma scale. Put generators in a `mocks/wfm/` directory (or wherever your repo collects fixtures):

- 6 forecast groups (e.g., *OK — Triage*, *OK — Behavioral Health*, *OK — Pharmacy*, *OK — Member Services*, *OK — Provider Services*, *OK — Care Mgmt*)
- 18 staffing groups (3 per forecast group on average; vary day/evening/overnight)
- ~200 agents per staffing group sampled — total bank of ~3,600 in the mock; system claims 5,500
- 12 Connect queues
- ~30 days of historical adherence data per agent for scorecard views
- Status events streamed (mock with `setInterval`) for real-time views

Persist mock state in a single in-memory store (Zustand or React context — match whatever the repo uses). Same agents and groups across all views so drill-ins are coherent.

---

## Accessibility — required for all four views (WCAG 2.1 AA)

Every prompt will repeat that the result must be a11y-compliant. Specifically:

- Focus order documented in code comments at the top of each page file
- Status / activity / adherence pills use **text + color**, never color alone
- ARIA live regions for streaming updates (announce "Agent X moved to Available")
- Reduced-motion variant for all pulses / animations (`prefers-reduced-motion`)
- Minimum click target 44px
- Keyboard navigation across tables (arrow keys, Enter to drill in)
- Charts include a tabular-data toggle as alternative for screen-reader users

---

## Out of scope (do not build, even if tempting)

- Custom Agent Workspace — agent-side surfaces are handled by AWS Connect Agent Workspace native
- CareCentral integration
- Forecasting visualization
- Snowflake-sourced data or PowerBI rendering
- Inactivity-detection backend (the Status Summary view will *visualize* the indicator but mark it "discovery / design only — implementation out of scope per SOW §e")
- Real backend wiring — these are prototype-only, all data is mocked

---

## Workflow each ticket follows

Each ticket prompt instructs Claude Code to run this exact sequence:

1. Read `00-CONTEXT.md` (this file).
2. **Explore the repo first.** Inventory the design tokens, app shell, component library, routing pattern, and mock-data conventions before writing any code. Produce a short notes file listing what was found and what's missing.
3. Invoke the **`ux-strategist-designer`** skill to make the "why-before-what" pass: who is the user for this view, what is the primary task, what decisions are made on this surface, what is the IA, what is the interaction model. This produces a short design-decisions doc, not code.
4. Invoke the **`react-frontend-architect`** skill to implement the prototype against the spec, reusing repo primitives and the shared components listed above.
5. Run the **`ux-heuristics-auditor`** skill against the finished prototype as a self-review pass.
6. Open the prototype on the relevant route(s) and verify all six states render via the "Force state" dev tool.
7. Commit on a per-ticket branch: `prototype/wfm-{view-slug}` (e.g., `prototype/wfm-realtime-workforce-dashboard`).

Definition of done for each prototype: all states render, filter persists in URL, drill paths navigate correctly with context preserved, role switcher changes RBAC visibility, a11y annotations and keyboard navigation present, no real backend calls.
