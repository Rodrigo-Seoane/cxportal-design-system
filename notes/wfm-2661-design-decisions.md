# WFM Design Decisions — PRDENG-2661: Agent Status Summary

> Source of truth for implementation. Do not build anything that contradicts this without updating it first.

---

## 1. Primary Task

**Supervisor scan**: In under 30 seconds, a supervisor must identify which agents in their staffing group are out of adherence or on an unexpected status, then take action (message, open workspace). The primary affordance is the table sorted by adherence indicator descending (out-of-adherence rows float to top).

**WFM Lead scan**: Broader view across all groups. Needs scope filtering to avoid a 5,500-row wall. The scope gate (below) prevents this before it happens.

**Action path**: Problem spotted (out-of-adherence row) → click agent name → Agent Scorecard (context preserved) → drill to native workspace if intervention needed.

---

## 2. Row Anatomy & Columns

**Essential (always visible)**:
| Column | Width | Notes |
|--------|-------|-------|
| Agent name | 200px | Link to scorecard; avatar initial circle |
| Status | 140px | `<StatusPill />` + optional inactivity badge |
| Status duration | 100px | Tinted amber past 30m on break |
| Current activity | 140px | `<ActivityPill />` with icon |
| Adherence | 120px | `<AdherenceBadge />` — Out / In / Grace |
| Actions | 44px | Kebab menu |

**Secondary (visible at ≥ 1280px, collapse on narrow)**:
| Column | Width |
|--------|-------|
| Scheduled activity | 140px |
| FG · SG | 180px |
| Time off | 60px (icon) |

**Sortable**: Agent name, Status duration, Adherence (default desc).

**No in-column filter**: Filtering is handled by the Status chip row above the table (cleaner separation of concerns than per-column dropdowns on a dense table).

---

## 3. No-Scope State (Scope Gate)

**Not an error page** — a helpful redirect. Copy and treatment:
- Headline: "Select a scope to see your agents"
- Sub-copy: "This view shows agents within a single staffing group or forecast group. Select one to get started."
- Click-to-apply chips: "My team" (applies role default), "OK — Triage", "OK — Behavioral Health", "All overnight"
- Rationale: surfaces the most common entry points without forcing the user to navigate back to the filter bar

---

## 4. Live-Update Visualization

- When an agent's status changes (emitted by `subscribeToStatusEvents`):
  1. Row background transitions to a light blue tint (`#eef3fb`) and fades back to default over 3 seconds — CSS transition on `background`, no JS animation
  2. ARIA live region (polite) announces: "Agent {name} moved to {status}" — polite (not assertive) so it doesn't interrupt screen reader mid-sentence on a busy floor
- Timer showing "Live · last event Xs ago" in the table footer, ticking every second
- On **degraded** source: row highlights paused, footer shows "Paused — source unavailable"

---

## 5. Status Pill Color Mapping

Same semantic tokens as prototype 1; StatusPill extended with ARIA and Pending help icon:

| Status | Background | Text | Dot |
|--------|-----------|------|-----|
| Available | `#ddf4d2` | `#1a6b1a` | `#4b9924` |
| On Call | `#d6e2f5` | `#1a3561` | `#4285f4` |
| Aux | `#fbeed8` | `#7a4a00` | `#c97000` |
| Offline | `#eff1f3` | `#4b535e` | `#7a828c` |
| Time Off | `#fbc6d4` | `#8b1a2a` | `#ef2056` |
| Unknown | `#eff1f3` | `#7a828c` | `#aab0b8` |
| Pending | `#eff1f3` | `#aab0b8` | `#d9dce0` + `?` help icon |

No new design tokens added — all colors map to existing status token ramp.

---

## 6. Inactivity-Detected Indicator (Design-Only)

- Small `⚡` or lock icon next to the StatusPill, gray/muted
- Tooltip: "Auto-set offline by inactivity detection — out of scope for current SOW (discovery/design only per §e)"
- Entire indicator is non-interactive (pointer-events: none would remove click, but we keep a hover tooltip for reviewers)
- A page-level banner appears when the "Inactivity Detected" status chip is toggled: "Inactivity-detected sources are design-only. Implementation is scoped to a future SOW."
- Clearly distinguished from real statuses by the gray treatment and the SOW callout

---

## 7. Drill-In vs. Drill-Out From a Row

| Action | Target |
|--------|--------|
| Click row (anywhere except kebab) | Navigate to `/wfm/reporting/agent-scorecard/{agentId}` with current filter context in URL |
| Kebab → Open Agent Scorecard | Same as row click |
| Kebab → Open in Agent Workspace | `https://connect.example.com/workspace?agentId={id}` in new tab; role-gated (wfm-lead + admin only) |
| Kebab → Send message | Disabled, tooltip "Out of scope for current SOW" |

---

## 8. Kebab vs. Trailing Icon-Buttons

**Decision: Kebab menu** (three dots, 44×44px target).

**Rationale**:
- At 36px compact row height, multiple icon buttons per row create tap-target collisions
- The action set (3 items, one disabled) doesn't justify always-visible icons that add visual noise at 200-row scale
- Consistent with CxPortal's existing action pattern (seen in Knowledge Management sandbox)
- Accessibility: kebab button has `aria-label="Agent actions"` + `aria-haspopup="menu"` + `aria-expanded`; keyboard: `M` key opens kebab on focused row
