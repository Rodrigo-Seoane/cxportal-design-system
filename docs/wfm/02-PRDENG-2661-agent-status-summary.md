# Claude Code Prompt — PRDENG-2661: Agent Status Summary (Prototype)

> Paste this entire file as your prompt to Claude Code. This is **prototype 2 of 4** in the WFM Supervisor Reporting UI family. It builds on the shared primitives created in PRDENG-2660 and prepares the navigation target for PRDENG-2662.

---

## Step 0 — Load shared context

Before writing any code, **read `00-CONTEXT.md`** in full. It defines the system this view lives in: vocabulary, filter taxonomy, RBAC, drill paths, the six required states, and the components that already exist from prototype 1.

Then **read `notes/wfm-prototype-discovery.md`** and the previous prompt's design-decisions doc (`notes/wfm-2660-design-decisions.md`) to ground yourself in the patterns already locked in. **Do not re-derive choices already made** — extend them.

This view is **prototype 2 of 4**. It depends on shared components built in PRDENG-2660 (`<HierarchyFilter />`, `<DegradedSourceBanner />`, `<DrillOutLink />`, `<RoleSwitcher />`, mock store, force-state dev tool). It introduces three new shared components (`<StatusPill />`, `<ActivityPill />`, `<AdherenceBadge />`) that PRDENG-2662 and PRDENG-2663 will reuse.

---

## Step 1 — Quick repo re-orientation

You don't need a full discovery pass this time, but spot-check that prototype 1's shared components are where you expect:

- `<HierarchyFilter />` — confirm import path and that URL sync still works
- `<DegradedSourceBanner />` and the force-state dev tool — confirm they're shared and you can drive them from a new page
- `mocks/wfm/store` — confirm the agent and queue selectors exist and the mock data store is the single source of truth across views
- `useCurrentUser()` and `<RoleSwitcher />` — confirm they're wired and a role change re-scopes default filters

If any of those drifted (renamed, moved, behavior changed), pause and update `00-CONTEXT.md` so the remaining prototypes stay accurate. **Do not duplicate components** — if `<KpiTile />` exists, reuse it; do not create a parallel.

---

## Step 2 — UX strategy pass

Invoke the **`ux-strategist-designer`** skill. Frame the brief as:

> *I'm designing the Agent Status Summary view for Centene supervisors and WFM Leads. This is the "who is on what status, in what activity, right now" surface — a dense agent table over thousands of agents (~5,500 OK pilot, but never all in one table). Status comes from Connect's agent event stream + Centene AUX code mapping (decision pending — must show a "Pending" treatment for unmapped codes). Activity comes from the FCS shift-activity model: Productive / Non-Productive / Time Off. Help me lock the table density, the row-anatomy, the live-update visualization, and how a supervisor goes from "I see a problem" to "I'm taking action" in one or two clicks.*

Have the skill produce a design-decisions doc at `notes/wfm-2661-design-decisions.md` covering:

1. The primary task (scan a staffing group for outliers; spot agents drifting out of adherence; intervene before the shift falls behind)
2. Row anatomy: which columns are essential, which collapse on narrower viewports, which are sortable, which are filterable in-column
3. The "no scope selected" state — this view must **force a hierarchy filter selection first** to avoid rendering a 5,500-row table. What does that prompt look like and how does it stop feeling like an error page?
4. Live-update visualization: what should the supervisor see when an agent's status changes in front of them? (subtle row highlight that decays over 3s + ARIA live region announcement — this is the standard from prototype 1's KPI pulse, applied to rows)
5. Status pill design: AUX code categories (*Available / On Call / Aux / Offline / Time Off / Unknown / Pending*), color-meaning mapping, treatment of *Pending* (unmapped AUX codes — gray pill with help affordance, since the AUX-mapping decision from Centene is dated for 2026-04-30 and may still be pending in places)
6. Inactivity-detected status visualization — this is **design-only**, not built. How do we mark it in the UI so reviewers and engineers see clearly that this is a discovery surface and not implementation?
7. Drill-in vs. drill-out from a row: clicking the agent name goes to PRDENG-2662 Agent Scorecard (in-app, preserves filter context); a kebab menu offers "Open in Agent Workspace" (native, new tab, role-gated)
8. The kebab vs. trailing icon-buttons trade-off given high row density and accessibility

Keep this doc under 800 words. It's the source of truth for the implementation step. Do not build anything that contradicts it without updating it first.

---

## Step 3 — Implement

Invoke the **`react-frontend-architect`** skill. The implementation brief follows.

### Route

```
/wfm/reporting/agent-status-summary
```

This is the route the agent-row click in `/wfm/reporting/real-time-workforce` already navigates to (it was a stub last prototype — implement it now).

### Page layout

Reuse the existing app shell. Single column:

1. **Page header** — title "Agent Status Summary", breadcrumb (Reporting → Agent Status Summary), page actions slot (Force-state dev tool, Role switcher, Saved views dropdown, Refresh)
2. **`<HierarchyFilter />`** — same instance as prototype 1; mode matches the placement decided in `notes/wfm-2660-design-decisions.md`. Pre-fill from URL on entry from the dashboard.
3. **`<DegradedSourceBanner />`** — only renders when state requires it
4. **Status filter chip row** — multi-select chips below the hierarchy filter: *Available / On Call / Aux / Offline / Time Off / Out of Adherence*. Toggling these filters the table without touching the URL hierarchy params (these go in their own URL param `?status=available,aux`).
5. **Saved views dropdown** — small dropdown next to the filters: "My team — out of adherence now", "All overnight", "Pending AUX codes". Saved views are stored in the mock store. Selecting one applies a preset `<HierarchyFilter />` value + status chips.
6. **Search input** — typeahead over Agent name within the currently filtered scope
7. **Sort + density controls** — small toolbar above the table: sort field (Agent name / Status duration / Out-of-adherence time desc), density (Comfortable / Compact)
8. **Agents table** (the main surface)

### Scope-required gate (very important)

If the user has not selected at least one Forecast Group or Staffing Group via the `<HierarchyFilter />`, **do not render the table**. Instead render a friendly "Select a scope to view agents" prompt — full-bleed empty state with the three or four most-likely scopes presented as click-to-apply chips ("My team", "OK — Triage", "OK — Overnight Nurses"). This is not an error state; it's a pattern to prevent the 5,500-row anti-pattern. The `ux-strategist-designer` doc from Step 2 provides the exact copy.

### Agents table

Use the repo's existing data table primitive. Apply virtualization (TanStack Virtual or whatever the repo uses) with sticky header and resizable columns. Default sort: Adherence indicator descending (out-of-adherence first).

**Columns:**

| Column                | Notes                                                                                  |
|-----------------------|----------------------------------------------------------------------------------------|
| Agent                 | Name + small avatar; clicking the name navigates to Agent Scorecard (next prototype)   |
| Status                | `<StatusPill />` — see component spec below                                            |
| Status duration       | Formatted "5m 32s" under 1h, "1h 23m" otherwise; threshold-tinted past 30m on Break     |
| Current activity      | `<ActivityPill />` — Productive / Non-Productive / Time Off                            |
| Scheduled activity    | What FCS expects them on; mismatch with Current = adherence signal                     |
| Adherence             | `<AdherenceBadge />` — Out of Adherence / In Adherence / Using Thresholds              |
| Time off              | Icon if agent is on approved time off today (hover for type/dates)                     |
| Forecast / Staffing   | Compact "FG · SG" string, monospace                                                    |
| Actions               | Trailing icon column: kebab menu (see actions below)                                   |

Row affordances:

- **Click on the row** (anywhere except the kebab) → navigate to `/wfm/reporting/agent-scorecard/{agentId}` with current filter context preserved as URL params
- **Kebab menu**:
  - *Open Agent Scorecard* — same as row click
  - *Open in Agent Workspace* — opens `https://connect.example.com/workspace?agentId={id}` in new tab; only renders for users with that RBAC permission via `useCurrentUser()`
  - *Send message* — placeholder, render disabled with tooltip "Out of scope for current SOW" (this leaves the affordance visible for future work without misleading reviewers)

Live-update behavior:

- When the mock store emits a status change for a visible agent, briefly highlight that row (background tint that fades over 3s) and announce via ARIA live region "Agent {name} moved to {status}"
- Footer of the table shows "Live — last event 2s ago" microcopy that updates every second
- High-density toggle: Comfortable (52px row) and Compact (36px row); persist choice to localStorage
- Sticky header with column widths preserved during virtualization
- Forced filter prompt (Step 3 scope gate) replaces the table entirely when no scope is selected

### New shared components — build these in the same shared UI directory as prototype 1's

#### `<StatusPill />`

- Props: `category: 'available' | 'on-call' | 'aux' | 'offline' | 'time-off' | 'unknown' | 'pending'`, `auxCode?: string`, `displayLabel?: string`, `unmapped?: boolean`
- Visual: pill with category color background; label is `displayLabel ?? category title-cased`
- Tooltip: shows underlying AUX code (e.g., "AUX 12 — Lunch") for power users
- *Pending* treatment: gray pill, label "Pending"; tooltip text "Awaiting Centene AUX code mapping decision"; small help icon links to a popover explaining the dependency
- Color tokens: extend the repo's existing pill / badge variants — do not introduce new colors at the design-token level; if a category color isn't already in the system, add it as a single new token following the repo's convention
- ARIA: `role="status"`, `aria-label="Agent status: {label}"`

#### `<ActivityPill />`

- Props: `category: 'productive' | 'non-productive' | 'time-off'`, `name: string`
- Three category color variants per `00-CONTEXT.md`
- Always renders icon + text — color is never the only signal
- Empty / unknown variant for when activity data hasn't loaded yet

#### `<AdherenceBadge />`

- Props: `state: 'in-adherence' | 'out-of-adherence' | 'using-thresholds'`, `lastChangeAt?: Date`
- Visual: small badge or row-edge accent (decision lives in the design-decisions doc)
- *Using thresholds* = within the configured grace period (`up to 10 minutes per activity`) — distinct color from out-of-adherence, hover explains the grace concept

### Inactivity-detected indicator (design-only)

Add a small icon badge next to the Status pill on rows where the mock data marks the status as auto-set:

- Visual: a "computer locked" icon overlay or distinct chevron on the StatusPill
- Tooltip: *"Auto-set offline by inactivity detection — out of scope for current SOW (discovery / design only per §e)"*
- Behavior: the icon is **always disabled / informational only** — there is no backend toggle. This is intentional: the visualization exists so the design is reviewable, but the integration is explicitly excluded from this SOW.
- Add a banner at the top of the page when this filter is applied: *"Inactivity-detected sources are design-only. Implementation is scoped to a future SOW."*

### Saved views

- Stored in the mock store
- Three seeded views: "My team — out of adherence now", "All overnight nurses", "Agents with Pending AUX codes"
- Selecting a view applies the saved filter combo (hierarchy + status chips + sort)
- "Save current view" button writes a new entry; not persisted across reloads (mock-only, this is fine for prototype)

### Connect agent event stream visual contract

- The mock store exposes a `subscribeToStatusEvents(agentIds, handler)` selector
- The page subscribes to the currently visible (virtualized) agent IDs
- Each event toggles the row's highlight + ARIA announce
- Document in code comments which event-stream payload fields the row consumes (agent ID, new status, timestamp, AUX code) — these will be the contract sent over to PRDENG-2657 Data Contract

### States

Verify each by switching the Force-state dev tool (shared from prototype 1):

1. **Loading** — table skeleton; column widths preserved; ~10 skeleton rows
2. **Data — happy path** — 200 rows in a single staffing group (representative density); rich mix of statuses and activities; a couple of *Pending* AUX codes; one inactivity-detected row
3. **Empty** — filter selects a real group with zero matching agents — copy "No agents match this filter" + Clear-Filters CTA
4. **Error** — inline error banner + table shows last cached rows with "Stale" badge in header; retry CTA
5. **High-density at scale** — populate to 200+ rows; confirm virtualization holds, sticky header doesn't jitter, column resize works
6. **No-scope** — Hierarchy filter empty → full-bleed "Select a scope to view agents" prompt with click-to-apply chips
7. **Degraded source** — `<DegradedSourceBanner />` on top; rows show with "Stale" indicator; live-update subscriptions paused; status-duration timer paused with a note

### Accessibility

Document at the top of the page file:

- Focus order: filter → status chips → search → sort/density → first row → kebab → "Open Agent Scorecard"
- Keyboard navigation through table rows: arrow keys move between rows; Enter opens primary action; `M` opens kebab
- ARIA live region for status changes (polite, not assertive — high-frequency events shouldn't barrage screen readers)
- Status / Activity pills: text + icon, never color alone
- Row tint contrast: alternating row tint must still pass AA against pill colors
- Density-Comfortable variant ensures min 44px click target on the kebab; Compact variant warns in dev mode if any target is below 44px

---

## Step 4 — Self-review with `ux-heuristics-auditor`

Run the **`ux-heuristics-auditor`** skill against the finished prototype. Capture findings at `notes/wfm-2661-heuristics-audit.md`. Address any P1/P2 issues before considering the ticket done.

Pay specific attention to: (a) the no-scope gate — does it feel like a helpful prompt or an error? (b) live-update density — does the row-highlight scale to a busy floor without becoming visual noise? (c) the *Pending* and inactivity-detected design-only treatments — is it clear to a reviewer that those are deliberate placeholders?

---

## Step 5 — Definition of done

- [ ] `notes/wfm-2661-design-decisions.md` exists and was followed
- [ ] Route `/wfm/reporting/agent-status-summary` renders
- [ ] All seven states verified via Force-state dev tool (loading / data / empty / error / high-density / no-scope / degraded)
- [ ] No-scope gate: navigating to the route with no filter shows the prompt, not the table
- [ ] Filter persists in URL across the entry from dashboard, reloads, and tab copy-paste
- [ ] Status chip filter persists in URL as separate param
- [ ] Live-update highlight + ARIA announce verified by toggling status in the mock store
- [ ] Saved views: three seeded, "Save current" creates a new entry in the mock store
- [ ] `<StatusPill />`, `<ActivityPill />`, `<AdherenceBadge />` are in shared UI lib (the next two prototypes will reuse them)
- [ ] *Pending* AUX treatment renders for unmapped codes; tooltip + help link present
- [ ] Inactivity-detected indicator renders with the design-only annotation; no backend wiring
- [ ] Row click → Agent Scorecard route (next prototype, currently a stub) preserves filter context
- [ ] Kebab → "Open in Agent Workspace" only renders when role permits
- [ ] `notes/wfm-2661-heuristics-audit.md` exists; P1/P2 findings resolved
- [ ] Branch `prototype/wfm-agent-status-summary` opened with the changes

---

## What this prototype is NOT

- Not the AUX-code mapping decision itself — the design exposes a *Pending* placeholder; the mapping comes from Centene
- Not the inactivity-detection backend integration (NextThink / MS-Teams) — the visualization exists; the integration is explicitly out of scope per SOW §e
- Not CareCentral integration — out of scope per SOW
- Not real Connect agent event stream wiring — the mock store fakes events with `setInterval`
- Not the Agent Scorecard surface — that's PRDENG-2662; this view drills *into* it

---

## Hand-off to PRDENG-2662 (Agent Scorecard)

The next prototype reuses everything in this one and prototype 1. Specifically:

- `<HierarchyFilter />`, `<DegradedSourceBanner />`, `<RoleSwitcher />`, force-state dev tool — already shared
- `<StatusPill />`, `<ActivityPill />`, `<AdherenceBadge />` — built here, must be reused (do not duplicate)
- Mock store now includes per-agent historical adherence data and shift-trade / shift-exchange / time-off mock entries — the scorecard will read from these
- The route `/wfm/reporting/agent-scorecard/[agentId]` is the navigation target from this view's row click; entry must preserve filter context

If anything diverged from the discovery file or context doc, update `00-CONTEXT.md` so the next prompt stays accurate.
