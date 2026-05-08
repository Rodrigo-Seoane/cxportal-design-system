# WFM Design Decisions — PRDENG-2660: Real-Time Workforce Dashboard

> Source of truth for implementation. Do not build anything that contradicts this without updating it first.

---

## 1. Who is on this page, and what decision do they make?

**User**: WFM Lead or shift Supervisor at a Centene clinical contact center (~5,500 agents across 6 Oklahoma forecast groups).

| Time | Question | Action |
|------|----------|--------|
| **5 seconds** | "Is the floor healthy right now?" | Scan KPI tile row for red/amber bands |
| **30 seconds** | "Which group or queue is struggling?" | Read queue table + alert list; identify scope |
| **5 minutes** | "Do I need to intervene?" | Drill into a specific metric trend or agent list; act (reassign, contact supervisor) |

**Clinical audience note**: mixed technical comfort. Labels use SOW vocabulary verbatim. Metric explanations surface in tooltips, not inline text that clutters the scan path.

---

## 2. Information Architecture (regions, priority, visual weight)

Top to bottom, single column, within the app shell's content area:

```
┌─────────────────────────────────────────────────────┐
│  Page Header (title + breadcrumb + page actions)    │  H = 64px, bg: section
├─────────────────────────────────────────────────────┤
│  HierarchyFilter (top-bar mode)                     │  H = 56px, bg: section, border-bottom
├─────────────────────────────────────────────────────┤
│  [DegradedSourceBanner — conditional]               │  H = auto, warning color
├─────────────────────────────────────────────────────┤
│  KPI Tile Row (6 tiles, responsive grid)            │  H = ~140px, bg: display (gray)
├──────────────────────────────┬──────────────────────┤
│  Queue Panel (~60%)          │  Alerts Panel (~40%) │  bg: section
│  table of 12 Connect queues  │  active alert list   │
├──────────────────────────────┴──────────────────────┤
│  Agents Panel (full width)                          │  bg: section
│  compact table, scoped to filter                   │
└─────────────────────────────────────────────────────┘
```

**Visual weight rules**:
- KPI tiles: largest visual footprint — highest priority
- Queue panel > Alerts panel (floor health before alert config)
- Agents panel: supplementary — secondary scan, only meaningful when filter narrows scope

---

## 3. Primary Scanning Path

1. **KPI tile row** — left to right. Adherence % first (headline metric). Red/amber bottom border triggers attention.
2. **Alerts panel** — if any alert is active, eye moves right to confirm scope.
3. **Queue panel** — volume + SLA % are the two columns that matter most; left-aligned, high contrast.
4. **Agents panel** — only engaged when a specific group is selected and the filter narrows scope below 200.

---

## 4. KPI Tile Model

**6 tiles (left to right)**:
1. Adherence % (primary headline — always leftmost)
2. Adherent Time
3. Scheduled Time
4. Non-Adherent Time
5. Agents Available
6. Agents Out of Adherence Now

**Threshold strategy**:
- Each metric has `{ green, amber, red }` thresholds stored in the mock store
- Threshold applied as a **colored bottom border (3px)** on the tile — does not flood the background
- Unknown state = gray border (threshold config not loaded)
- Stale state = amber "Stale" pill + cached-as-of timestamp microcopy

**Comparison window**: "vs last week same time" (default for live view). Shown as a small delta arrow + percentage below the primary value.

**Sparkline**: last 60 minutes of data, line chart, 40px tall, no axes, uses primary blue.

**"Last updated X s ago"** microcopy under each tile, ticking every second via `setInterval`.

---

## 5. Alert Visualization Model

- **Active alerts** surface in the Alerts panel (right ~40% of the two-column section)
- Each alert row shows: metric name, threshold crossed, current value, scope, time-since-triggered, "View" link
- "View" scrolls to and briefly highlights the affected KPI tile (no separate page)
- **Manage Alerts CTA** in the page header opens `<AlertConfigFlyout />` from the right side
- The flyout does not compete with the dashboard — the page stays readable behind a 40% opacity backdrop

**Alert config flyout** (RBAC-gated to WFM Lead / Admin):
- List → Create/Edit form (stepwise: metric → threshold → scope → recipients → frequency → enable)
- Recipients: mock channels (Centene email, Slack #wfm-alerts, Teams)

---

## 6. Degraded-Source UX

When the agent event stream is unavailable:
- `<DegradedSourceBanner />` appears at top of page (below filter bar, above KPI tiles)
- Banner shows: cached-as-of timestamp, what's affected, retry CTA
- KPI tiles switch to `stale` state — amber "Stale" pill + cached-as-of time
- Alerts panel shows "Alerts paused — source unavailable" indicator
- Agent panel shows last-known data with stale indicator
- Queue panel remains live (Connect native metrics unaffected; banner notes this distinction)
- Manual refresh button in header remains functional

**Supervisor productivity**: cached data is still shown (not hidden), so supervisors can still make staffing decisions on recent data while the stream recovers.

---

## 7. Drill-Down vs. Drill-Out

| Action | Behavior |
|--------|----------|
| Click a **KPI tile** | Opens `<MetricTrendFlyout />` from the right — shows last-60-min sparkline expanded as full line chart with grace-band overlay. Dashboard stays visible. |
| Click a **queue row** | `<DrillOutLink />` opens Queue & Agent Performance Dashboard in new tab with `queueId` + current time range |
| Click "View" on an **alert** | Scrolls to affected KPI tile, highlights for 2s |
| Click an **agent row** | Navigates to `/wfm/reporting/agent-status-summary` (next prototype stub) with filter context in URL |
| "Manage Alerts" header CTA | Opens `<AlertConfigFlyout />` from the right |

---

## 8. HierarchyFilter Placement

**Decision: top-bar mode** (horizontal strip below the page header).

**Rationale**:
- The CxPortal app already uses a fixed left sidebar for navigation — a second left-rail filter would create two competing vertical panels, fragmenting focus
- The content area is wide enough (≥ 900px typical) for a horizontal filter strip
- Aligns with the existing sandbox patterns in this repo (horizontal filter bars)
- Left-rail mode is supported via the `mode` prop for future views that need it
