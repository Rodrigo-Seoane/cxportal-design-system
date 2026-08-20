# PRD: Assign to Worker — v2 (Option 1: numbered stacked steps + sticky footer)

## Executive Summary
Deliver a prototype route at `app/open-inventory/task-queue-visibility-v2/` that presents the Queue → Task → Worker assignment flow as three vertically stacked, always-visible tables under one filter rail, with downstream steps dimmed until their upstream is picked and a sticky footer holding the running summary + primary Assign CTA. This is a **third** interaction model — the OLD Figma screen (three equal tables, orphaned CTA) is being replaced, and v1's "Guided Assignment Builder" (single-focus swap with header slots) will remain in-app as a sibling for comparison. The critical research finding is that virtually every primitive v2 needs already ships in v1's component set — the redesign is a layout and state-visibility swap, not a rebuild.

## Research Metadata
- **Date**: 2026-08-20
- **Feature Request**: Redesign the Task Queue Visibility "Assign to Worker" flow using the Option 1 pattern (numbered stacked steps + sticky action bar). Deliver a working prototype route in the app.
- **Working directory**: `.workflow/assign-to-worker/`
- **Next Step**: Product Manager Specification Phase (`/b2b-saas-product-spec-writer`)

---

## 1. Affected Codebase Files

### Critical Files (Direct Modification / Creation Required)
| File Path | Purpose | Modification Type |
|-----------|---------|-------------------|
| `app/open-inventory/task-queue-visibility-v2/page.tsx` | Route entry — stacked layout, PageTitle, FilterRail, three StackedStepSection slots, StickyActionBar, Modal, MessageBox | **create** |
| `app/open-inventory/task-queue-visibility-v2/StackedStepSection.tsx` | Wrapper around one step: numbered header + reused `TableSectionHeader` + a `QueueTable`/`TaskTable`/`WorkerTable` child. Owns the `disabled` visual + `aria-disabled` semantics and receives focus when a step becomes newly enabled | **create** |
| `app/open-inventory/task-queue-visibility-v2/StickyActionBar.tsx` | Bottom-anchored sticky bar containing three `BuilderSlot` chips (running summary) + primary Assign `Button`; binds `Cmd/Ctrl+Enter` when Assign is enabled | **create** |
| `app/open-inventory/task-queue-visibility-v2/assignment-builder-v2-reducer.ts` | Fork of `assignment-builder-reducer.ts` with the `ADVANCE_TO_WORKER` auto-advance action removed and `activeStep` semantics repurposed for focus-target only (not table visibility) | **create** |
| `app/open-inventory/task-queue-visibility-v2/use-assignment-builder-v2.ts` | React hook wrapping the v2 reducer, exposes selectQueue / selectTask / selectWorker / editStep / assign / confirmPending / cancelPending / dismissConfirmation | **create** |
| `components/layout/Sidebar.tsx` | Add v2 entry after line 153 inside the `Open Inventory` `NAV_GROUPS` block. Label: `Task Queue Visibility (v2)`. Href: `/open-inventory/task-queue-visibility-v2`. Status: `wip`. v1 line 153 **stays untouched** | **modify** |

### Supporting Files (Read-Only Reuse)
| File Path | Purpose | Potential Changes |
|-----------|---------|-------------------|
| `app/open-inventory/task-queue-visibility/assign/_data.ts` | Domain types (`Queue`, `Task`, `Worker`, `AssignmentLogEntry`), enums (`Priority`, `TaskStatus`, `WorkerStatus`), seeded mock datasets (`QUEUES`, `TASKS`, `WORKERS`), helpers (`tasksForQueue`, `isEligible`), color maps (`PRIORITY_COLOR`, `TASK_STATUS_CHIP`, `WORKER_STATUS_COLOR`) | v2 imports from this file directly. **No changes.** |
| `components/open-inventory/task-queue-visibility/QueueTable.tsx` | Rendered `QueueTable` — accepts `selectedQueueId`, `priorityFilter`, `onPriorityFilterChange`, `onSelect` | **Reuse as-is.** Prop shape already fits v2. |
| `components/open-inventory/task-queue-visibility/TaskTable.tsx` | Rendered `TaskTable` — needs `queue`, `selectedTaskId`, `statusFilter`, `onStatusFilterChange`, `onSelect`, `onPickDifferentQueue` | **Reuse as-is.** v2 passes `onPickDifferentQueue = () => builder.editStep('queue')`. |
| `components/open-inventory/task-queue-visibility/WorkerTable.tsx` | Rendered `WorkerTable` — needs `task`, `queueName`, `selectedWorkerId`, `statusFilter`, `onStatusFilterChange`, `onSelect`, `onPickDifferentTask`. Owns the "Show all workers" `Switch`, the eligible-workers empty state, and the eligible-first sort. | **Reuse as-is.** All three locked decisions (#1 radio, #2 eligible-only default, empty-state ownership) already live inside this file. |
| `components/open-inventory/task-queue-visibility/TableSectionHeader.tsx` | "{Title} ({count})" + collapsible search icon-button + chip strip + optional `chipRowExtra` slot | **Reuse as-is.** Serves as the reusable section-header inside each `StackedStepSection`. |
| `components/open-inventory/task-queue-visibility/BuilderSlot.tsx` | Numbered slot bullet + label + inline edit affordance. Variants: `empty` / `active` / `filled` / `disabled`. Filled variant renders a `PencilSimple` edit button. Disabled variant wraps in `Tooltip` with `disabledReason`. | **Reuse as-is inside `StickyActionBar` only.** v2 does NOT reuse it in the header (v2 has no header slots). |
| `components/open-inventory/task-queue-visibility/StatusDot.tsx` | Colored 8px status dot | **Reuse as-is** (already used inside `WorkerTable`, `FilterRail`). |
| `components/open-inventory/task-queue-visibility/DailyAssignmentsPopover.tsx` | Portal-rendered popover triggered by "N assigned today" chip, listing today's in-memory assignments. Consumed by `PageTitle`'s `actions` slot. | **Reuse as-is.** Wires directly to `state.assignments` from the v2 reducer. |
| `components/open-inventory/task-queue-visibility/FilterRail.tsx` | 240px left rail. Currently swaps its facet group (`Priority` / `TaskStatus` / `WorkerStatus`) by `step` prop. | **Cannot reuse as-is.** v2's locked decision #4 says the rail applies to all three tables simultaneously — must show all three facet groups stacked. Spec must decide extend-vs-fork (see §5 Recommended Approach). |
| `components/open-inventory/task-queue-visibility/AssignmentBuilderHeader.tsx` | v1's persistent header (slots + Assign button + Cmd/Ctrl+Enter binding + inline pending-change + inline success confirmation) | **Do not reuse.** v2 splits its concerns: the summary + Assign + shortcut move into `StickyActionBar`; the pending-change and success banners become their own top-level pieces in `page.tsx`. The Cmd/Ctrl+Enter `useEffect` pattern at lines 41–50 is copied verbatim into `StickyActionBar`. |
| `components/ui/page-title.tsx` | Page title + subtitle + right-aligned `actions` slot | **Reuse as-is.** |
| `components/ui/modal.tsx` | Confirmation modal (used only if the spec picks Modal-over-inline for backtrack — see §5) | **Reuse conditionally.** |
| `components/ui/message-box.tsx` | Inline banner. v1 uses hand-built banner divs because `MessageBox` does not accept inline action buttons. If v2 puts the backtrack warning inline, it will follow the same hand-built pattern (see §2 Pattern C). | Reuse where feasible; hand-built where not. |
| `components/ui/switch.tsx` | Toggle used by `WorkerTable`'s "Eligible only" / "Show all workers" control | **Reuse as-is.** |
| `components/ui/button.tsx` | Primary CTA in `StickyActionBar`, secondary actions everywhere | **Reuse as-is.** |
| `components/ui/tooltip.tsx` | Wraps disabled slots with a `disabledReason` message | **Reuse as-is.** |

### Test Files
No test files. The project has no colocated tests and no `.test.tsx` files in the `app/` or `components/` trees at the time of this research (confirmed by grepping the tree). The `vitest.config.ts` is set up for Storybook-driven testing only. **A prototype does not add a test file; if this graduates from prototype to production, both v1's reducer and v2's reducer should get unit tests — both are pure functions ideal for it.**

---

## 2. Existing Implementation Patterns

### Pattern A: The Builder Reducer (pure, framework-free state machine)
**Location**: `app/open-inventory/task-queue-visibility/assign/assignment-builder-reducer.ts`
**Relevance**: v2 forks this. The Queue → Task → Worker state model, the backtrack detection (`SELECT_QUEUE` / `SELECT_TASK` when a downstream pick exists sets `pendingChange` instead of applying), and the Assign action (that clears Task+Worker, preserves Queue, appends to `assignments`) are unchanged. The one v2-specific change is deleting the `ADVANCE_TO_WORKER` action and the 150ms auto-advance in the hook.

```ts
// The backtrack-guard pattern to preserve verbatim in v2:
case 'SELECT_QUEUE': {
  const { queue } = action
  if (state.queue?.id === queue.id) {
    return { ...state, activeStep: state.task ? (state.worker ? 'worker' : 'task') : 'task' }
  }
  // Downstream picks exist — confirm before clearing them.
  if (state.task || state.worker) return { ...state, pendingChange: { step: 'queue', queue } }
  return { ...state, queue, activeStep: 'task' }
}
```

**Adaptation notes**:
- Keep `activeStep` in the state but redefine its semantics: in v1 it drove *which* table renders; in v2 all three render always, so `activeStep` becomes **the focus target when a step becomes newly enabled** — e.g. after `CONFIRM_PENDING` (queue-change) fires, `activeStep === 'task'` tells v2 to move focus into the Task section's search input or first row.
- Delete case `ADVANCE_TO_WORKER` (no auto-advance in v2).
- Assign's post-effect on `activeStep` stays `'task'` — after a successful assignment, focus should land in the newly-active Task section (Queue preserved).

### Pattern B: Reducer-driven React hook with derived callbacks
**Location**: `app/open-inventory/task-queue-visibility/assign/use-assignment-builder.ts` (51 lines)
**Relevance**: v2's hook is a near-copy with the auto-advance `setTimeout` removed. The hook exposes stable callbacks (`selectQueue`, `selectTask`, `selectWorker`, `editStep`, `assign`, `confirmPending`, `cancelPending`, `dismissConfirmation`), each dispatching one action. This lets the page pass these directly to child components without churn.

### Pattern C: Hand-built inline banner using MessageBox tokens
**Location**: `components/open-inventory/task-queue-visibility/AssignmentBuilderHeader.tsx` lines 13–16, 83–122
**Relevance**: v1 uses hand-built banner `<div>`s (with `role="alert"` for pending changes, `role="status"` for the success confirmation) because `MessageBox` doesn't natively accept inline action buttons. v2 keeps this pattern if it picks inline backtrack + inline success (recommended — see §5). The color tokens `#fdf8ef` / `#f7ddb1` / `#c97000` for warning and `#f3fbee` / `#b5e89c` / `#4b9924` for success are already mirrored from `MessageBox`.

```tsx
// Reusable microcopy pattern for the backtrack banner:
{state.pendingChange && (
  <div role="alert" style={{ background: BANNER.warning.bg, borderColor: BANNER.warning.border }}>
    <WarningIcon aria-hidden="true" />
    <p>
      {state.pendingChange.step === 'queue'
        ? `Changing the queue will clear ${state.task?.taskName ?? 'the selected task'}${state.worker ? ` and ${state.worker.id}` : ''}.`
        : `Changing the task will clear ${state.worker?.id ?? 'the selected worker'}.`}
    </p>
    <Button onClick={onCancelPending}>Cancel</Button>
    <Button onClick={onConfirmPending}>
      {state.pendingChange.step === 'queue' ? 'Change queue' : 'Change task'}
    </Button>
  </div>
)}
```

### Pattern D: Cmd/Ctrl+Enter global shortcut binding
**Location**: `components/open-inventory/task-queue-visibility/AssignmentBuilderHeader.tsx` lines 41–50
**Relevance**: v2 copies this `useEffect` verbatim into `StickyActionBar` — it's the exact keyboard shortcut the brief requires. Guards on `canAssign` (which becomes `!!(state.queue && state.task && state.worker) && !state.pendingChange`) prevent the shortcut firing while the pending-change banner is open.

```tsx
useEffect(() => {
  function onKeyDown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && canAssign) {
      e.preventDefault()
      onAssign()
    }
  }
  window.addEventListener('keydown', onKeyDown)
  return () => window.removeEventListener('keydown', onKeyDown)
}, [canAssign, onAssign])
```

### Pattern E: BuilderSlot variants (perfect fit for the sticky footer summary)
**Location**: `components/open-inventory/task-queue-visibility/BuilderSlot.tsx`
**Relevance**: The four variants (`empty | active | filled | disabled`) map 1:1 to v2's sticky-footer summary states:
- No pick yet → variant `empty` with the placeholder ("Pick a queue", "Pick a task", "Pick a worker").
- Upstream not yet filled → variant `disabled` with `disabledReason` ("Pick a queue first", "Pick a task first").
- Filled → variant `filled` with the selected value + inline pencil edit affordance that dispatches `editStep(...)`.
- Currently active section → variant `active` (highlighted bar under the label).

**Reuse verdict**: 100% as-is. The bullet + `CheckIcon` on filled + `PencilSimpleIcon` on edit already match the design intent of the sticky footer.

### Pattern F: Per-step empty state ownership
**Location**: `QueueTable.tsx` (no empty state — QUEUES is always populated in the fixture), `TaskTable.tsx` lines 65–76, `WorkerTable.tsx` lines 52–66
**Relevance**: Each table already owns its own empty state and rescue action. v2 does not need to reimplement — the stacked layout just means these empty states appear inside a section whose header stays visible above them. For consistency across the three tables, `QueueTable` will need a similar empty state added when filters produce zero rows (currently it just renders an empty tbody — this is a **prototype gap** the spec should surface). The brief explicitly lists three empty states, so QueueTable needs one:

- **Missing empty state**: no matching queues after filter — currently absent.

### Pattern G: `TableSectionHeader` chip-row extra slot
**Location**: `components/open-inventory/task-queue-visibility/TableSectionHeader.tsx` + usage at `WorkerTable.tsx` lines 77–79
**Relevance**: `TableSectionHeader` accepts a `chipRowExtra` prop rendered at the end of the "Filtering:" row — `WorkerTable` uses this for the "Eligible only" switch. This slot is the correct place for any per-section local control v2 might add.

### Pattern H: Sidebar registration convention
**Location**: `components/layout/Sidebar.tsx` lines 146–154
**Relevance**: v1's entry sits inside the `Open Inventory` group at line 153. v2's entry is a copy of that line shape:

```ts
// After line 153 (v1 stays):
{ label: 'Task Queue Visibility (v2)', href: '/open-inventory/task-queue-visibility-v2', status: 'wip' },
```

The `status: 'wip'` badge renders as an amber pill next to the label — appropriate for a prototype route.

---

## 3. Technology Documentation Excerpts

### WAI-ARIA — Disabled sections that stay visible but non-interactive
**Source**: WAI-ARIA Authoring Practices — https://www.w3.org/WAI/ARIA/apg/practices/hiding-semantics/ and https://www.w3.org/TR/wai-aria-1.2/#aria-disabled

**Key concepts for v2's dimmed sections**:
- **Do not use `disabled` HTML attribute at region level** — it only applies to form controls (`button`, `input`, `select`, `textarea`, `fieldset`). Use `aria-disabled="true"` on the region.
- `aria-disabled="true"` communicates state to assistive tech WITHOUT removing the element from the accessibility tree. This is exactly the v2 requirement: dimmed sections must still be perceivable and skimmable by keyboard/screen-reader users, just not actionable.
- Interactive descendants inside a dimmed region should either (a) also carry `aria-disabled="true"` (allowing focus but not action), or (b) be removed from the tab order via `tabindex="-1"`. **Recommended for v2**: use `tabindex="-1"` on all interactive children of a dimmed section, so keyboard users cannot Tab into a section whose upstream isn't filled. This matches the brief's "Tab skips dimmed regions" requirement.
- **Never use `visibility:hidden`, `display:none`, or `aria-hidden="true"` for the dimmed sections** — those would remove them from perception entirely, defeating the "always visible" pattern.

### WAI-ARIA — Focus management on step enable
**Source**: https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/ and https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex

**Best practice**: When a section becomes newly enabled, moving focus programmatically is a judgment call:
- **Move focus to the section's first meaningful control** (its search input or its first row) when the user's action was a discrete "pick this and go" — this is the CxPortal DailyAssignmentsPopover pattern (opens the popover, focus moves in) and is expected in guided flows.
- **Announce via `aria-live="polite"` and DO NOT move focus** when the section becomes enabled as a side effect the user might not want to immediately act on (e.g. after correcting an upstream but wanting to review other queues).

**Recommendation for v2**: **Move focus** to the first interactive row of the newly enabled section on `SELECT_QUEUE` / `SELECT_TASK` — supervisors run this flow 20+ times per shift and the whole point of the pattern is guided sequential picking. On `CONFIRM_PENDING` (backtrack), move focus similarly — the user just committed to change, so land them in the section that needs new input.

### WAI-ARIA — Radio group semantics for task selection (locked decision #1)
**Source**: https://www.w3.org/WAI/ARIA/apg/patterns/radio/

**Key concept**: The task list must present as one radio group. v1's `TaskTable.tsx` line 5 imports `Radio` from `@/components/ui/checkbox` — this is already implemented. Rows use native radio semantics: arrow-key navigation among the radios, Enter/Space to select. The task table is single-select radio; the worker table is *also* single-select radio (only one worker per assignment); the queue table is a single-select but the pattern is slightly different because the entire row is the click target — either way, `role="radiogroup"` + `role="radio"` with `aria-checked` is the correct semantic.

### WAI-ARIA — Live region for post-Assign announcement
**Source**: https://www.w3.org/WAI/ARIA/apg/practices/live-regions/

**Key concept**: The success strip in v1 uses `role="status"` (equivalent to `aria-live="polite"`). This announces the "X assigned to Y" message to screen readers when it appears. v2 keeps this pattern. The daily counter chip ("N assigned today") should ALSO be inside an `aria-live="polite"` region — its increment is a status change worth announcing to non-visual users.

### Sticky footer / bottom action bar — CSS
**Source**: https://developer.mozilla.org/en-US/docs/Web/CSS/position#sticky

**Key concept**: `position: sticky; bottom: 0;` on a footer element inside a scrolling parent keeps the footer visible as content scrolls above it. Requirements:
- The scrolling parent must have `overflow: auto` (or `scroll`) or the sticky is anchored to the viewport.
- The footer height must be considered by the layout above — either as flex/grid space or via `padding-bottom` on the scroll container so the last row isn't hidden behind the footer.
- **Prototype-scope decision**: for v2, use `position: sticky; bottom: 0;` on the footer inside a page body that has `min-h-screen flex-col` (mirroring v1's `page.tsx:66`). Add `padding-bottom` equal to the footer height on the main content area so the last stacked section's last row isn't obscured.

---

## 4. External Implementation Patterns

### From CxPortal itself — Access Management filter rail
**Repository**: In-repo (same codebase)
**Location**: Referenced by v1's `FilterRail.tsx` comment header (line 129: *"matches the Access Management 'Table Filter' left-rail pattern (UserFilters.tsx / RoleFilters.tsx)"*)
**Relevance**: The FilterRail pattern is already borrowed from an established CxPortal precedent. v2's extended rail (showing all three facet groups stacked) should keep the same visual conventions: 240px width, `SlidersIcon` in a bordered box, "Filters" title at 18px/24px, `Clear Filters` button appearing only when any facet has a selection.

### From CxPortal itself — Stepper component
**Repository**: In-repo, at `components/ui/stepper.tsx`
**Relevance**: There is a dedicated `Stepper` DS component. **v2 does not use it** — v1 also chose not to, because `Stepper` implies a multi-page wizard (progress across separate screens), while this flow is single-page with all three sections co-located. The numbered bullets inside `BuilderSlot` cover the "numbered step" affordance without pulling in the wrong pattern. **Note this decision explicitly in the spec so it doesn't get re-litigated in Step 3.**

### From WAI-ARIA APG — Guided form pattern reference
**Source**: WAI-ARIA Authoring Practices does NOT publish a canonical pattern for "guided sequential form on one page with dimmed downstream steps". The closest patterns:
- **Wizard** — assumes multiple pages. Not applicable.
- **Feed** — for continuous content. Not applicable.
- **Form with disabled fields** — generic; describes the mechanics but not the sequenced enablement UX.

**Adaptation notes for v2**: Because no canonical pattern exists, treat each `StackedStepSection` as a `<section aria-labelledby="step-N-heading">` containing a heading, the `TableSectionHeader`, and the table. When dimmed, add `aria-disabled="true"` to the section element and `tabindex="-1"` to the search input, filter chips, and table rows within.

---

## 5. Technical Considerations

### 5.1 Architecture Alignment
v2 aligns with the CxPortal prototype architecture already in place:
- App Router `page.tsx` at the route root with `'use client'` at the top and a header comment block documenting keyboard/ARIA/focus concerns.
- Colocated helpers (`use-*.ts`, `*-reducer.ts`) in the route folder.
- Shared components under `components/open-inventory/task-queue-visibility/`.
- Domain types + mock data in a single `_data.ts` file, deterministic (seeded) so SSR and hydration match.
- No global state, no persistence, no data-fetching library. Pure `useReducer` + `useState`.

v2 does not introduce new architecture. The only mildly new concept is "one page-level state machine driving three simultaneously-visible sections with disabled semantics" — but the state machine itself is a straight fork of v1's.

### 5.2 Design Questions the Spec Must Resolve

**Q1. Backtrack warning: inline banner or modal?**
The user brief locks "must show a warning before clearing" but does not lock the presentation. Locked decision #6 explicitly says success is inline, no modal — which leaves room for either shape for backtrack.
- **Option 1: Inline banner (recommended)**. v1 uses this pattern with `role="alert"`, Cancel + Change action buttons. Screen-reader announcement is immediate. No focus trap needed. Consistent with the sticky-footer-adjacent placement in the ASCII sketch. Matches v1's established pattern.
- **Option 2: Modal**. Higher friction (which is arguably a feature for a destructive action). Requires focus trap. Breaks flow more visibly.
- **Recommendation**: **Inline banner**, placed inside `StickyActionBar` above the summary+CTA row, with `role="alert"`. Rationale: the "warning before clearing" language is satisfied by any interruption that requires an explicit action to proceed; consistency with the success strip (also inline in the same footer area per locked decision #6) matters more than incremental friction; and supervisors running this 20+ times per shift resent modals for accepted daily operations. The pending-change and success confirmation can share the sticky-footer real estate — mutually exclusive by design.

**Q2. FilterRail — extend or fork?**
The current `FilterRail.tsx` swaps its facet group by `step` prop. v2 needs all three facet groups stacked simultaneously.
- **Option 1: Extend with a `mode` prop**. `mode: 'single' | 'all'`, and when `all` render all three `FilterGroup`s stacked. Preserves one file, one story; both consumers stay in sync when new facets are added.
- **Option 2: Fork to `FilterRailV2.tsx`**. Isolates v2's shape; no risk of breaking v1's swap behavior. Two files to maintain going forward.
- **Recommendation**: **Extend with a `mode` prop**. The three `FilterGroup` renders in `FilterRail.tsx` are already conditionally rendered by `step`; changing the condition to `step === 'queue' || mode === 'all'` (and the same for the other two) is a minimal diff. Both v1 and v2 will need any future facet added (e.g. a queue-tag filter), so keeping one component prevents drift.

**Q3. Focus target on step enable — first row vs. section header?**
- **Recommendation**: First interactive **table row** (not the section header, not the search input). The user's mental model post-pick is "now pick from these" — landing focus in the search input adds a Tab press before they can arrow to their choice. Landing focus on the row lets arrow-key navigation start immediately. Screen reader announces the row's contents in context.
- The section heading gets `aria-labelledby` so the row's announcement is prefixed by the step title ("Select a Task — Task-01144, cardiology, high priority…").

**Q4. Missing empty state on `QueueTable`.**
Currently, `QueueTable.tsx` has no empty state — if a filter produces zero rows, it just renders an empty tbody. v2's brief lists "no matching queues" as one of the three required empty states. **This is a v1 gap that v2 will need to address** — either by extending `QueueTable` with an empty state (which alters v1 too, since both consume the same component) or by wrapping `QueueTable` in a conditional inside `StackedStepSection` for v2 only. **Recommendation**: extend `QueueTable` to render an inline empty MessageBox when filtered rows are zero. v1 becomes marginally better as a side effect; v2 gets the empty state for free. This is a small change, low risk. Copy should match the `TaskTable`/`WorkerTable` voice.

**Q5. Overflow behavior.**
Three tables stacked with 15 queues / 8–12 tasks / 15–20 workers each will produce a taller-than-viewport page even on a 14" laptop. The sticky footer stays reachable because that is what sticky is for; the question is whether the dimmed sections above stay skimmable.
- **Recommendation**: Do not cap the height of individual stacked sections. Let them all render their full row counts on the page. Scrolling down through the entire flow is expected behavior. The BuilderSlot chips in the sticky footer are the "am I lost" affordance — they always show what's picked so far, so the user can jump back via the pencil-edit even after scrolling past.
- **Alternative rejected**: capping each section at a fixed height (e.g. 400px) with internal overflow would fragment the page's scroll behavior and cause double-scroll issues on trackpads. Keep it simple.

### 5.3 Sticky Footer Summary Format — Exact Microcopy

The footer contains three `BuilderSlot` chips + one primary Assign button (+ optionally a pending-change or success banner above them).

**Empty state (no queue picked yet)**:
- Slot 1: variant `active`, placeholder text `"Pick a queue"`.
- Slot 2: variant `disabled`, placeholder `"Pick a task"`, tooltip `"Pick a queue first"`.
- Slot 3: variant `disabled`, placeholder `"Pick a worker"`, tooltip `"Pick a task first"`.
- Assign button: disabled.

**Queue picked**:
- Slot 1: variant `filled`, value = queue name (e.g. `"Corr_Duals_FL"`), pencil-edit affordance visible.
- Slot 2: variant `active`, placeholder `"Pick a task"`.
- Slot 3: variant `disabled`, placeholder `"Pick a worker"`, tooltip `"Pick a task first"`.
- Assign button: disabled.

**Queue + Task picked**:
- Slot 1: variant `filled`, value = queue name, pencil-edit.
- Slot 2: variant `filled`, value = task ID (e.g. `"Task-01144"`), pencil-edit.
- Slot 3: variant `active`, placeholder `"Pick a worker"`.
- Assign button: disabled.

**All three picked (Assign ready)**:
- Slot 1: variant `filled`, value = queue name, pencil-edit.
- Slot 2: variant `filled`, value = task ID, pencil-edit.
- Slot 3: variant `filled`, value = worker ID (e.g. `"00767"`), pencil-edit.
- Assign button: enabled + primary variant. Cmd/Ctrl+Enter armed.

**Post-Assign transient success (replaces the summary row for ~4s or until dismissed)**:
- Success banner: `"Task-01144 assigned to 00767."` (mirrors v1's phrasing verbatim — `"{taskLabel} assigned to {workerId}."`, sourced from `AssignmentBuilderHeader.tsx` line 110).
- Buttons: `"Assign another"` (secondary, dismisses banner and returns focus to slot 2 which is now `active` — Queue preserved). A dismiss `×` icon (aria-label `"Dismiss"`) for the same action.
- **State visible during transient**: the daily counter chip in the PageTitle increments simultaneously (see §5.4).
- **When dismissed OR after Assign-another**: the summary row reappears with Slot 1 filled (Queue preserved), Slot 2 active, Slot 3 disabled.

**Backtrack pending banner (mutually exclusive with the success banner)**:
- Content: 
  - Queue change with only task picked: `"Changing the queue will clear Task-01144."`
  - Queue change with task + worker picked: `"Changing the queue will clear Task-01144 and 00767."`
  - Task change with worker picked: `"Changing the task will clear 00767."`
- Buttons: `"Cancel"` (secondary, `CANCEL_PENDING`) and `"Change queue"` / `"Change task"` (primary, `CONFIRM_PENDING`).
- `role="alert"`. Screen readers announce immediately.
- Assign button is disabled while pending banner is visible.

### 5.4 Slot / Section Dimmed-State Anatomy

Each `StackedStepSection` renders a heading + a `TableSectionHeader` + a table. Its state matrix:

| Section state | Section wrapper | Heading | Inner (`TableSectionHeader` + table) |
|---|---|---|---|
| **Dimmed** (upstream not filled) | `<section aria-disabled="true" data-disabled="true">`. Applies `opacity: 0.4`. Cursor: default (no not-allowed anywhere). Not `aria-hidden`. | Numbered bullet in `disabled` variant (bordered outline, no fill). Heading text at `--text-body-secondary` color. Sublabel: `"Pick a queue first"` / `"Pick a task first"`. | Non-interactive: search input, chip filters, table rows all `tabindex="-1"` + `aria-disabled="true"`. Table rows still visible but at 0.4 opacity, no hover state, no radio selectability. |
| **Enabled but empty** (upstream filled, this step's filter produced zero rows OR the source data has zero rows) | `<section>` at full opacity. | Numbered bullet in `active` variant (filled blue). Heading text at `--text-body-primary` color. | Owned by the table component itself (`TaskTable`, `WorkerTable`, or the new `QueueTable` empty state). Shows a `MessageBox type="info"` with rescue actions ("Pick a different queue" / "Show all workers"). |
| **Active** (upstream filled, this step is the current focus) | `<section>` at full opacity. Optional subtle indicator (blue left-border rail or the `--content-action-primary-100` background from `BuilderSlot`'s active variant) — the spec should choose one; **recommendation**: no visual chrome on the section itself; the active state is communicated by the sticky-footer BuilderSlot's `active` variant already, and adding it twice risks over-signalling. | Numbered bullet in `active` variant. | Full interactivity. Rows arrow-navigable. |
| **Filled** (this step has a pick and the user has moved past it) | `<section>` at full opacity. | Numbered bullet in `filled` variant (blue with `CheckIcon`). Heading text at `--text-body-primary`, `font-semibold` on the picked-value label. | Table remains fully interactive. User can still change the pick without going through the sticky-footer edit affordance — the row selection itself dispatches `editStep` + selection. |

### 5.5 Empty-State Copy

CxPortal voice: clear, direct, no fluff, no jokes. Second-person "you" is avoided in v1's copy — matches. Copy for the three required empty states:

**1. No matching queues (filter combination produced zero)** — new; not yet in `QueueTable`.
- Title: `"No queues match these filters."`
- Body (optional): none.
- Action button: `"Clear filters"` (secondary; dispatches whatever clears the priority filter and the search).
- Component: `MessageBox type="info" size="block" dismissible={false}`.
- Location: rendered inside `QueueTable` in place of the `<Table>` when `sorted.length === 0` and `(priorityFilter.length > 0 || search.length > 0)`.

**2. No open tasks in the selected queue** — exists at `TaskTable.tsx:65-76`, verbatim:
- Title: `"No open tasks in {queue.name} right now"`.
- Action: `"Pick a different queue"` (secondary, calls `onPickDifferentQueue()`).
- Component: `MessageBox type="info" size="block" dismissible={false}`.
- v2 change: none.

**3. No eligible workers (with toggle off)** — exists at `WorkerTable.tsx:52-66`, verbatim:
- Title: `"No eligible workers available right now"`.
- Actions: `"Show all workers"` (secondary, sets `showAll(true)`) and `"Pick a different task"` (secondary, calls `onPickDifferentTask()`).
- Component: `MessageBox type="info" size="block" dismissible={false}`.
- v2 change: none.

### 5.6 Keyboard Flow (spec-ready)

Precise Tab sequence when the page is loaded:
1. Page title `actions` slot: `"N assigned today"` button (opens `DailyAssignmentsPopover`).
2. Filter rail: `Clear Filters` (if visible) → each expandable facet group's disclosure button → each facet's checkbox in order.
3. `StackedStepSection` for Queue (`aria-labelledby="step-1-heading"`): search input → active filter chips' dismiss buttons → table header sort buttons → **first table row**.
4. Within the Queue table: arrow keys move between rows (`role="radio"` semantics from `Radio` component); Enter/Space selects; Tab exits the radiogroup to the next section.
5. `StackedStepSection` for Task: same pattern. **Skipped entirely** when queue is not picked (all children `tabindex="-1"`).
6. `StackedStepSection` for Worker: same pattern + the `"Eligible only"` `Switch` in the header's `chipRowExtra` slot. **Skipped entirely** when task is not picked.
7. `StickyActionBar`: the `BuilderSlot`s' pencil-edit buttons (only for filled slots) → the Assign button. Cancel/Change buttons of the pending banner insert here when visible.

**Keyboard shortcuts**:
- `Cmd/Ctrl + Enter`: fires Assign when the CTA is enabled (identical to v1, useEffect at global window level).
- Arrow keys within any table's radiogroup navigate rows (already implemented via `Radio` component).
- `Enter` / `Space` on a focused row selects it (already implemented).
- `Esc` inside the pending-change banner triggers `CANCEL_PENDING` (new for v2; v1 does not have this and the spec should add it).

**Focus management events**:
- On `SELECT_QUEUE` (fresh pick, no downstream cleared): focus moves to the first row of the Task section after render (`useEffect` on `state.queue?.id`).
- On `SELECT_TASK` (fresh pick, no downstream cleared): focus moves to the first row of the Worker section.
- On `CONFIRM_PENDING`: focus moves to the first row of the newly-active section (Task if the pending was a queue change; Worker if it was a task change).
- On `ASSIGN`: focus moves to the first row of the Task section (Queue preserved, Task/Worker cleared).
- On `CANCEL_PENDING`: focus stays on the row that triggered the pending change, or on the Cancel button — whichever is easier to implement; the important thing is that focus does NOT jump.
- On `DISMISS_CONFIRMATION`: focus moves to the first row of the Task section.

### 5.7 User Story Variants

**Q: Does Option 1 (stacked) support both queue-first and worker-first entry points?**

The pattern as described is **strictly queue-first**: step ② dimmed until ① is picked; step ③ dimmed until ② is picked. This mirrors the operational reality — supervisors pick a queue (a slice of work) first, then a task within it, then a worker.

**Worker-first is not viable** in Option 1 because eligibility (locked decision #2) is task-dependent: `isEligible(worker, queueName)` requires a queue to compute eligibility, and workers are shown "eligible only by default". Picking a worker before a task is meaningless — the pool of assignable tasks then becomes "tasks in queues this worker is eligible for", which is a different flow (worker-centric, not task-centric).

**Recommendation**: **Support queue-first only.** If a worker-centric flow is needed, it becomes a separate route — potentially a "Worker Load View" that lists workers first and, per worker, lets you assign the next task. That is out of scope for v2.

**Explicit non-goal**: v2 does not support jumping backward without a warning; it does not support multi-select on tasks (locked decision #1); it does not support bulk assignment across queues.

### 5.8 Success Metrics

For the prototype (not shipped to production), success is meeting the six-state visual/interaction spec cleanly. For a hypothetical production shipment, comparison against v1 could use:
- **Time to first Assign** — from page load to first successful assignment. Option 1 predicts lower if users can see all three tables and mentally parallelize.
- **Backtrack rate** — how often users edit an upstream selection after making a downstream one. If Option 1 is clearer than v1's swap pattern, backtracks should decrease.
- **Filter-usage rate** — because v2's rail applies to all three tables simultaneously, filter interactions may become richer. Measured against v1's per-step filter usage.
- **Successful assignments per session** — the daily counter is already a proxy for this in the UI.
- **Keyboard-only completion rate** — a11y metric; the Option 1 pattern should not degrade this vs v1.
- **Post-Assign dismissal action** — how often users click "Assign another" vs the `×` dismiss. Signals whether the assumed high-frequency loop is real.

### 5.9 Dependencies
No new npm packages. Everything already in `package.json` at repo root:
- React 19.2.4, Next 16.2.2, TypeScript strict.
- Tailwind v4 (via `@theme inline` in `app/globals.css`).
- `@phosphor-icons/react` for icons (`WarningIcon`, `ChecksIcon`, `XIcon`, `ClipboardTextIcon`, `PencilSimpleIcon`, `CheckIcon`, `SlidersIcon`, `CaretDownIcon`, `MagnifyingGlassIcon`).
- `framer-motion` v12 — used in v1 for the swap animation between the single-visible tables. **v2 does not need it** — no swap animation; the sections are always present. framer-motion is not imported in v2 unless the spec chooses to animate the dimmed-to-active transition (recommendation: no; keep the transition to a CSS `opacity` transition on the `data-disabled` attribute).

### 5.10 Security Considerations
- Prototype only, no API wiring, no PII in the mock data (the fixture uses provider names like "Dr. Sarah Chen, MD" — synthetic).
- No `localStorage` / `sessionStorage` writes. Daily counter is in-memory and resets on reload (per locked decision + assumption #7 in PLAN.md).
- No user input beyond filter chips, search strings, and row selection — all bounded to the mock dataset.
- The pending-change and success banners include user-selected data (queue name, task label, worker ID) in their text; these are all coming from typed mock data, not free text, so no XSS surface for the prototype. **Production consideration only**: if v2 graduates, any string interpolation into a banner would need to be treated as data (React's JSX default) — which it already is. Nothing new to worry about.

---

## 6. Recommended Approach Summary

Build v2 as a **thin new route that reuses the v1 component set and forks v1's reducer**. Concretely:

1. **Route + shell**: `app/open-inventory/task-queue-visibility-v2/page.tsx` with the header comment block linking to Figma + `.workflow/assign-to-worker/`. Layout: `PageTitle` (with `DailyAssignmentsPopover` in its `actions` slot) at top, a flex row with `FilterRail` (mode `'all'`) on the left, three `StackedStepSection`s stacked in the main column, and `StickyActionBar` anchored bottom.
2. **State**: fork the reducer + hook. Delete `ADVANCE_TO_WORKER` and the 150ms timeout. Repurpose `activeStep` as the focus-target hint, not a table-visibility switch.
3. **Reuse**: `QueueTable`, `TaskTable`, `WorkerTable`, `TableSectionHeader`, `StatusDot`, `DailyAssignmentsPopover`, `BuilderSlot`, `PageTitle`, `Button`, `Switch`, `Tooltip`, `Modal` (conditionally), `MessageBox`, `Chip`, all icons. All eight `_data.ts` exports.
4. **New pieces**: `StackedStepSection`, `StickyActionBar`, `assignment-builder-v2-reducer.ts`, `use-assignment-builder-v2.ts`, one edit to `FilterRail.tsx` to add a `mode: 'single' | 'all'` prop, one edit to `QueueTable.tsx` to add the missing "no matching queues" empty state, one edit to `Sidebar.tsx` to register the route.
5. **Design decisions the spec must commit**: 
   - Backtrack: **inline banner** (recommended, matches v1).
   - FilterRail: **extend with `mode` prop** (recommended, minimal diff).
   - Focus-on-enable: **first table row of newly-enabled section** (recommended).
   - Empty state on QueueTable: **add it inside QueueTable** (recommended, tiny co-benefit for v1).
   - Overflow: **no per-section height cap** (recommended).
   - Stepper DS component: **not used** (recommended — it's the wrong pattern).
6. **A11y bar**: WCAG AA. `aria-disabled` + `tabindex="-1"` for dimmed sections; `role="radiogroup"` inside tables; `role="alert"` on pending banner; `role="status"` on success banner; `aria-live="polite"` on the daily counter; programmatic focus movement on step-enable events.
7. **Keyboard**: `Cmd/Ctrl+Enter` for Assign, `Esc` for pending-cancel, arrow keys within radiogroups, Tab skips dimmed sections. All lifted from v1's already-working `useEffect` pattern.
8. **Deferred to graduation**: unit tests on the v2 reducer, any real API wiring, any persistence for the daily counter across reloads.

The scale of change is small — probably ~500 net new lines across five new files + ~30 lines of diffs in three existing files. All primitives already exist. The primary intellectual work is the focus-management wiring, the sticky footer + `role="alert"` banner integration, and the FilterRail extension.

---

*This PRD is ready for Product Manager specification phase.*
