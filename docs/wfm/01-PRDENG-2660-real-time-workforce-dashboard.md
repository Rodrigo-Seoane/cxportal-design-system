# Claude Code Prompt — PRDENG-2660: Real-Time Workforce Dashboard (Prototype)

> Paste this entire file as your prompt to Claude Code, after dropping `00-CONTEXT.md` into the project. This is **prototype 1 of 4** in the WFM Supervisor Reporting UI family. It establishes the shared primitives the next three prototypes will reuse.

---

## Step 0 — Load shared context

Before writing any code, **read `00-CONTEXT.md`** in full. It defines the system this view lives in: the four views, shared vocabulary, filter taxonomy, RBAC, drill paths, the components to reuse vs. build, and the six required states. Everything in this prompt assumes that file is loaded — do not re-derive its contents.

This view is **prototype 1 of 4**. Components you build here (`<HierarchyFilter />`, `<KpiTile />`, `<DegradedSourceBanner />`, `<DrillOutLink />`, `<RoleSwitcher />`, mock-data store) will be reused by PRDENG-2661 / 2662 / 2663. Build them as first-class shared components, not view-local helpers.

---

## Step 1 — Explore the repo first

Do not write any production code yet. Produce a notes file at `notes/wfm-prototype-discovery.md` capturing:

- Next.js version, app router vs. pages router, package manager
- Design system location: where tokens live (CSS variables / Tailwind config / theme provider), where the component library lives
- A list of every existing UI primitive you'll reuse, with import paths: button, input, select / combobox, dialog, drawer / flyout, dropdown menu, tooltip, toast, banner, skeleton, table, tabs, breadcrumb, sidebar, page header
- Charting library if one is already in the repo (Recharts? Visx? Something else?). If none, note it — we'll pick when we get to the dashboard's sparklines.
- Existing patterns for: routing & route groups, layouts, mock data / fixtures, state management (Zustand? React Query? Context?), data fetching wrapper, RBAC or auth-aware hooks
- The conventions for naming files, exports, prop types, story / test file colocation

End the notes file with a short "Gaps" section listing anything from `00-CONTEXT.md`'s component list that does not yet exist in the repo and will need to be created. Do not start coding until this file is complete.

---

## Step 2 — UX strategy pass

Invoke the **`ux-strategist-designer`** skill (B2B SaaS specialist). Frame the brief as:

> *I'm designing a Real-Time Workforce Dashboard for Centene WFM Leads and shift Supervisors managing ~5,500 clinical agents (Doctors, Nurses) on Amazon Connect. This is the supervisor's "is the floor healthy right now" surface. Sources: Connect agent event stream + native real-time metrics (Phase 1; no Snowflake). Audience leans clinical, mixed technical comfort. Help me lock the IA, the primary scanning path, the alert visualization model, and the degraded-source pattern before I implement.*

Have the skill produce a design-decisions doc at `notes/wfm-2660-design-decisions.md` covering:

1. Who is on this page and what decision are they making in 5 seconds, 30 seconds, 5 minutes?
2. The IA: regions on the page, their priority, their visual weight
3. Primary scanning path (where does the eye land first, second, third)
4. Real-time KPI tile model: which 6–8 metrics get top billing, threshold strategy (green / amber / red / unknown), comparison-window strategy
5. Alert visualization: how triggered alerts surface on the dashboard itself (pulsing pill on KPI tile + top banner + link to alert config), and how alert config lives without dominating the page
6. Degraded-source UX: what does the supervisor see when the agent event stream is down, and how do we keep them productive
7. Drill-down vs. drill-out: when does a click open an in-app trend, when does it open the native Queue & Agent Performance Dashboard in a new tab
8. Hierarchy filter placement (left rail vs. top bar) and rationale given the rest of the CxPortal app shell

This doc is short — under 800 words — and is the source of truth for the implementation step. Do not build anything that contradicts it without updating it first.

---

## Step 3 — Implement

Invoke the **`react-frontend-architect`** skill. The implementation brief follows.

### Route

Add a new route to the existing app following the project's routing convention. Target path:

```
/wfm/reporting/real-time-workforce
```

If the repo nests reporting routes differently, adapt — but keep the slug `real-time-workforce` so the next three views can sit alongside (`/wfm/reporting/agent-status-summary`, `/wfm/reporting/agent-scorecard/[agentId]`, `/wfm/reporting/supervisor-scorecard/[scope]`).

### Page layout

Reuse the existing app shell (sidebar nav). The page itself is a single column with these regions, top to bottom:

1. **Page header** — title "Real-Time Workforce Dashboard", breadcrumb (Reporting → Real-Time Workforce), page actions slot (Manage Alerts CTA — RBAC-gated, Force-state dev tool, Role switcher dev tool, Refresh)
2. **`<HierarchyFilter />`** — top filter bar variant (per the UX decision in Step 2; defer to that doc if it lands on left rail instead)
3. **`<DegradedSourceBanner />`** — only renders when state requires it
4. **KPI tile row** — 6 tiles, responsive grid: *Adherence %*, *Adherent Time*, *Scheduled Time*, *Non-Adherent Time*, *Agents Available*, *Agents Out of Adherence Now*
5. **Two-column section below KPI row**:
   - Left ~60%: **Queue panel** — table of Connect queues with live metrics (volume, SLA %, agents on queue, longest wait), each row has a `<DrillOutLink />` to native Queue & Agent Performance Dashboard
   - Right ~40%: **Active alerts panel** — list of currently-triggered alerts with affected metric, threshold, scope, time-since-triggered, "View" affordance scrolling to the affected KPI tile
6. **Agents panel** (below queue/alerts) — compact agent list scoped to current filter, columns: Agent name, Status pill, Status duration, Activity, Adherence indicator. **Click row → navigates to PRDENG-2661 Agent Status Summary** with the same filter context. Row count shown in panel header. If the filter doesn't narrow scope below 200 agents, show a "Refine your filter to see agents" empty-ish state with a Clear-Filters CTA — never render all 5,500.

### Components to build (in shared lib, will be reused by next prototypes)

Build each at the path your repo uses for shared UI (decided in Step 1):

#### `<HierarchyFilter />`

- Props: `value`, `onChange`, `mode: 'top-bar' | 'left-rail'`, `defaultRange: 'live' | string`
- URL sync: read on mount, write on change. Use `useSearchParams` (or whatever the repo uses).
- Cascading combobox: Forecast Group → Staffing Group → Agent (typeahead at each level)
- Orthogonal Queue multi-select
- Time-range with presets per `00-CONTEXT.md` (Live + named ranges + Custom up to 18 weeks)
- Filter chip row with individual remove + Clear All
- Default scope per role (use `useCurrentUser()`); when role changes via the dev switcher, reset to that role's default

#### `<KpiTile />`

- Props: `label`, `value`, `unit?`, `delta?`, `deltaWindow?`, `sparkline?`, `thresholds?: { green, amber, red }`, `state: 'loading' | 'data' | 'unknown' | 'stale' | 'empty'`, `onClick?`
- States:
  - `loading`: skeleton, preserves height
  - `data`: large value, label, secondary delta with arrow, sparkline (last 60 min for real-time view), pulse animation on value update (respects `prefers-reduced-motion`)
  - `unknown`: gray treatment when threshold config not loaded
  - `stale`: amber "Stale" pill + cached-as-of timestamp microcopy under tile
  - `empty`: skeleton + cause indicator ("No data in current scope" vs. "Source unavailable")
- Threshold band: applies a colored bottom-border or accent (do not flood the tile bg — keeps it scannable)
- "Last updated 23s ago" microcopy under each tile, updates every second
- Click drills into a per-metric trend chart filtered by current scope (open as a flyout from the right side, reuse the repo's drawer/flyout pattern). Trend chart is in-flyout so the dashboard stays in view.

#### `<AlertConfigFlyout />`

- Right-side flyout (matches CxPortal standard)
- List view: alerts with metric, operator, threshold, scope, recipients, frequency, enabled toggle, last-triggered
- Create / Edit form: stepwise — (1) metric (2) threshold with live-preview against current data (3) scope using `<HierarchyFilter />` (4) recipients (mock channels: Centene email, Slack #wfm-alerts, Teams) (5) frequency (immediate / batched) (6) enable
- Empty list: "No alerts configured" + onboarding copy
- Permission gate: only visible to WFM Lead and Admin per `useCurrentUser()`
- Clicking "Manage Alerts" in the page header opens this flyout

#### `<DegradedSourceBanner />`

- Top-of-page banner, dismissible per session
- Displays: cached-as-of timestamp, what's affected ("Agent event stream — KPIs and agent panel showing cached data"), retry CTA
- Pairs with the "Stale" pill on each KPI tile (driven from same store)

#### `<DrillOutLink />`

- Wraps an external-link with the CxPortal external-link visual convention (icon + new-tab indicator)
- Props: `report: 'schedule-adherence' | 'schedule-publication' | 'intraday-management' | 'queue-agent-performance' | 'calendar'`, `params: { agentId?, forecastGroupId?, staffingGroupId?, queueId?, from?, to? }`, `requiredRole?: 'supervisor' | 'wfm-lead' | 'admin'`
- Builds the URL as `https://connect.example.com/fcs/{report}?{params}` for the prototype
- Hides itself if user lacks `requiredRole`

#### `<RoleSwitcher />` (dev tool only — not real product)

- Header dropdown: Supervisor / WFM Lead / Admin
- Updates `useCurrentUser()`
- Visible only when `process.env.NEXT_PUBLIC_PROTOTYPE_MODE === 'true'` (or whatever the repo's flag pattern is)

#### Force-state dev tool

- Header button that opens a small popover: pick *Loading*, *Data*, *Empty*, *Error*, *Partial-data*, *Degraded source*
- Stored in the same in-memory store, propagates to all the regions on the page so reviewers can see each state without engineering data conditions

### Mock data store

Create `mocks/wfm/store.ts` (or repo's equivalent location):

- Forecast groups, staffing groups, agents, queues per `00-CONTEXT.md`
- KPI values that update every 5–10s with small drift (use `setInterval`, clear on unmount)
- A small bank of triggered alerts (start with 2 active)
- A "force state" override that, when set to anything other than `data`, replaces all live-data reads with that state
- Export selectors so other views (next prototypes) can read the same data

### Real-time refresh strategy (for the prototype)

- KPI tiles: poll mock store every 15s (mocking the production cadence)
- Agent panel: poll every 30s
- Queue panel: poll every 30s
- Active alerts: re-evaluate every 60s
- Live update visualization: subtle pulse on KPI tile when its value changes; row highlight on agent rows that just changed status (decays over 3s)
- "Last updated Xs ago" microcopy under each region, ticks every second
- Manual refresh button in page header forces all regions to refetch immediately

### States

Verify each by switching the Force-state dev tool:

1. **Loading** — every region shows skeleton; layout doesn't shift
2. **Data** — populated with mock data at scale; one staffing group selected by default for Supervisor role, all groups for WFM Lead
3. **Empty** — filters narrow to zero agents; KPI tiles show "No data in current scope"; agent panel shows Clear-Filters CTA
4. **Error** — inline error in each region (`<Alert />` variant) with retry; KPI tiles fall back to last cached value with "Stale" pill
5. **Partial-data** — KPI tiles loaded; agent panel still loading; queue panel showing "Stale" — explicit per-region indicator
6. **Degraded source** — `<DegradedSourceBanner />` on top; KPI tiles show last-known with "Stale" pill; alerts panel shows "Alerts paused — source unavailable"; manual-refresh button still functional

### Accessibility

Verify and document at the top of the page file:

- Focus order: filter → KPI tiles (left to right) → queue panel header → queue rows → alerts panel → agent panel
- Keyboard shortcuts: `r` refresh, `f` jump to filter, `a` open alerts flyout — register via the repo's keyboard hook if one exists, else a minimal `useEffect` listener
- ARIA live regions on KPI tiles announce on threshold crossing
- Color contrast: green/amber/red KPI states pass AA against tile bg
- Click targets ≥ 44px
- Reduced-motion variant: disables tile pulse, row-change highlight, banner animation

---

## Step 4 — Self-review with `ux-heuristics-auditor`

Run the **`ux-heuristics-auditor`** skill against the finished prototype. Capture findings at `notes/wfm-2660-heuristics-audit.md`. Address any P1/P2 issues before considering the ticket done.

---

## Step 5 — Definition of done

- [ ] `notes/wfm-prototype-discovery.md` exists and lists every reused primitive + every gap
- [ ] `notes/wfm-2660-design-decisions.md` exists and was followed
- [ ] Route `/wfm/reporting/real-time-workforce` renders
- [ ] All six states verified via Force-state dev tool
- [ ] Filter persists in URL; reload restores; copy-paste URL into another tab restores
- [ ] Role switcher visibly changes default scope and gated affordances (Manage Alerts, Open Agent Workspace)
- [ ] Active alerts panel + alert config flyout both functional with mock data
- [ ] KPI tile click opens per-metric trend in right-side flyout
- [ ] Drill-out CTAs open new-tab placeholder URLs with correct params
- [ ] Agent row click navigates to `/wfm/reporting/agent-status-summary` with filter context preserved (route is a stub for now — next prototype implements it)
- [ ] `notes/wfm-2660-heuristics-audit.md` exists; P1/P2 findings resolved
- [ ] Branch `prototype/wfm-realtime-workforce-dashboard` opened with the changes
- [ ] No real backend calls; all reads go through `mocks/wfm/store`

---

## What this prototype is NOT

- Not real-time wired to Connect (mocked with `setInterval`)
- Not the alerts backend (alerts are configured in the flyout but only stored in the mock store)
- Not the trend chart engine (the per-metric trend in the flyout is a single Recharts/Visx line chart with mock data — full chart spec lives in PRDENG-2662 Agent Scorecard)
- Not the AUX-mapping decision: status pills will appear in the Agents panel; if any agent has an unmapped AUX code, render *Pending*

---

## Hand-off to PRDENG-2661 (Agent Status Summary)

The next prototype reuses everything in this one. Specifically it expects:

- `<HierarchyFilter />` exists and is URL-synced
- `mocks/wfm/store` is the single source of truth for agents and queues
- The route `/wfm/reporting/agent-status-summary` is the navigation target from the agent row in this dashboard
- `useCurrentUser()` and `<RoleSwitcher />` work
- `<DegradedSourceBanner />` and the Force-state dev tool are shared

If anything in the discovery file ended up implemented differently, update `00-CONTEXT.md` so the next prompt is accurate.
