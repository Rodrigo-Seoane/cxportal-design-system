# WFM Design Decisions — PRDENG-2662: Agent Scorecard

> Source of truth for implementation. Do not build anything that contradicts this without updating it first.

---

## 1. Primary Task

A supervisor opens this page to answer: *"Is this agent's adherence trending poorly — and if so, is it a real problem or a legitimate exception?"* The page must let them scan the trend chart, identify any dips, then immediately check the surrounding context (shift trades, exchanges, approved time off) to distinguish a pattern from an anomaly.

The primary judgment the supervisor makes is: **"Should I intervene, or was this legitimately covered?"**. The page is designed so that judgment takes under 60 seconds, even for a non-technical clinical supervisor.

---

## 2. Page IA

Top to bottom within the app shell:
```
Page header (breadcrumb → back CTA → dev tools)
HierarchyFilter (top-bar mode, inherited)
[DegradedSourceBanner — conditional]
Identity strip (agent name, ID, staffing group, live StatusPill, AdherenceBadge)
Time-range selector (presets + custom date inputs)
KPI card row (4 cards, no sparkline — historical period, not real-time)
AdherenceTrendChart (grace band, event markers, tabular toggle)
Two-column context: Shift Trades | Shift Exchanges
Time-off strip (day-box heat strip)
Drill-out CTAs (FCS reports)
```

**Why this order**: The trend chart is the primary artifact — everything above it frames who you're looking at and over what period. Everything below it explains what might have caused the dips you just saw.

---

## 3. Chart Anatomy

**Line series**: Adherence % per day (one point per day in the selected range). Y-axis 60–100% — clamped at 60 because values below this are clinical-floor anomalies, not normal variance.

**Event markers** — shape + color (never color alone):
- Non-adherent event: red circle — signals a day the agent was measurably out
- Shift trade: blue upward triangle — matches the blue of the adherence line; triangles connote "change"
- Shift exchange: purple square — visually distinct from both; squares connote "swap"

**Layering**: markers render on top of the line; the grace band renders behind both, so the supervisor sees: band → line → markers, in visual priority order.

**Tooltip**: shows date, adherence %, adherent/scheduled/non-adherent minutes (exact values), and any events on that day.

---

## 4. Grace-Period Band

**What it is**: The shaded green zone from (100 − gracePeriodMinutes) to 100 on the Y-axis. Days where the line falls within this zone are technically counted as adherent per FCS configuration — the agent gets the benefit of the doubt for minor timing variance.

**Why visualize it**: Without the band, a supervisor looking at a day showing 96% adherence might flag it as a problem. The band immediately shows "96% is fine — it's inside the grace zone." This prevents false-positive interventions.

**Prototype simplification**: The band width is rendered as `gracePeriodMinutes` percentage points for visual clarity (e.g., grace = 5 → band from 95 to 100). The tooltip explains the actual per-activity tolerance concept so reviewers understand the design intent.

**Read-only chip**: A "Grace: ±5 min per activity" chip with a tooltip is shown near the chart header. Configuration lives in FCS (Admin-only), not in this view.

---

## 5. Comparison-Window Strategy

Each KPI card shows a delta against the previous equivalent period: "vs prev last 30 days" for the Last 30 Days range. When the previous period has no data (new agent), the delta is omitted rather than showing "vs —" which would confuse supervisors.

**Copy pattern**: `vs prev {range label}` — explicit and tied to the user's current selection so the reference window is never ambiguous.

---

## 6. Side-Context Panels

Two panels side by side below the chart:

**Shift Trades** (left, blue triangle header accent): compact table — date, original shift, traded shift, hours variance, counterparty, status. A `laborOverride` warning flag (⚠) appears when labor rules were overridden. The visual treatment uses the same blue as the chart trade marker to create a mental link: "that blue triangle on the 14th = this row."

**Shift Exchanges** (right, purple square header accent): same compact pattern with different accent color. Exchanges differ from trades in that they are temporary — the header tooltip clarifies the distinction.

**Design intent**: a supervisor should be able to look at a dip on the 14th and immediately scan down to see "ah, there was an approved shift trade on the 14th — legitimate absence."

---

## 7. Empty / No-History Pattern

For agents with fewer than 7 days of data (`state === 'empty'`):
- Chart area shows: "No adherence data yet — Trend will appear after 7 days of activity" with a dashed border treatment
- KPI cards render in `empty` state with no values
- Side panels show their empty states: "No shift trades in this period", "No shift exchanges in this period"
- Time-off strip still renders if time-off entries exist

**Why not an error**: This is an expected state for new agents or agents with recently-cleared history. A broken-looking page would create unwarranted concern. The supportive copy ("will appear after") sets expectations without implying something failed.

---

## 8. Insufficient-Permissions Pattern

Triggered when a Supervisor's `defaultStaffingGroupId` doesn't match the agent's `staffingGroupId`. The entire page body below the header is replaced with a friendly forbidden state:

- **Icon**: warning shield (orange treatment — informational, not punitive red)
- **Headline**: "You don't have access to this agent's scorecard"
- **Body**: explains staffing-group scope and names the user's group explicitly (so they understand the rule, not just the block)
- **Primary CTA**: "Back to Agent Status Summary" — natural exit
- **Secondary CTA**: "Request access" — mock, opens a placeholder; gives the user a productive path rather than a dead end

**Not punitive**: The copy doesn't say "unauthorized" or "forbidden." It frames the constraint as a scope rule, not a violation.
