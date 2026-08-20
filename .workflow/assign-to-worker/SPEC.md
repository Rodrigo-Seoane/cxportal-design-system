# Specification: Assign to Worker — v2 (Option 1: numbered stacked steps + sticky footer)

## Overview
This SPEC translates the PRD at `.workflow/assign-to-worker/PRD.md` into a file-by-file implementation contract for the `/react-frontend-architect` skill. It creates a new prototype route at `app/open-inventory/task-queue-visibility-v2/` that presents Queue → Task → Worker as three vertically stacked, always-visible sections under one shared filter rail, with downstream steps dimmed (`aria-disabled` + `tabindex="-1"`) until upstream picks exist, and a `position: sticky; bottom: 0` action bar that owns the running summary, the primary Assign CTA, the backtrack pending banner, and the post-Assign success strip. v1 (`app/open-inventory/task-queue-visibility/assign/`) remains untouched except for two low-risk, in-place extensions to shared components (`FilterRail.tsx` gets a `mode` prop; `QueueTable.tsx` gets an empty state for the no-matching-filters case). No new tokens, no new DS primitives, no new mock data files.

---

## Files to Modify

### `components/layout/Sidebar.tsx`
- Insert one new object literal inside the `Open Inventory` `NAV_GROUPS` block, immediately after the existing v1 line (currently line 153):
  ```ts
  { label: 'Task Queue Visibility (v2)', href: '/open-inventory/task-queue-visibility-v2', status: 'wip' },
  ```
- Do NOT modify the existing v1 entry at line 153.
- Do NOT modify any other `NAV_GROUPS` group. No changes to `NAV`, `STATUS`, `DIRECT_LINKS`, or the render tree.

### `components/open-inventory/task-queue-visibility/FilterRail.tsx`
- Extend `FilterRailProps` (currently at lines 115–125) with a new optional prop:
  ```ts
  mode?: 'single' | 'all'   // default 'single' — preserves v1 behavior
  ```
- In the destructured props at lines 132–135, add `mode = 'single'`.
- Change the three `step === '…'` conditionals (lines 156, 165, 174) to also render when `mode === 'all'`:
  ```ts
  {(step === 'queue' || mode === 'all') && <FilterGroup … />}
  {(step === 'task'  || mode === 'all') && <FilterGroup … />}
  {(step === 'worker'|| mode === 'all') && <FilterGroup … />}
  ```
- When `mode === 'all'`, the three groups render stacked (they already are — the file uses the natural document order). No layout wrapper changes needed; the outer `flex flex-col gap-16` already spaces them.
- Do NOT change the visual chrome (240px width, `SlidersIcon`, "Filters" heading, `Clear Filters` button), the `FilterGroup` inner component, or the constant definitions (`PRIORITY_OPTIONS`, `TASK_STATUS_OPTIONS`, `WORKER_STATUS_OPTIONS`).
- **v1 impact**: `AssignmentBuilderHeader.tsx`'s consumer of `FilterRail` continues to pass `step` and no `mode` prop — `mode` defaults to `'single'`, behavior unchanged.

### `components/open-inventory/task-queue-visibility/QueueTable.tsx`
- Add an inline empty-state render branch above the main table return, guarded by:
  ```ts
  const hasActiveFilters = priorityFilter.length > 0 || search.length > 0
  if (sorted.length === 0 && hasActiveFilters) { return <EmptyStateJSX /> }
  ```
- The empty-state JSX follows the same shape as `TaskTable.tsx` lines 65–76 (`MessageBox type="info" size="block" dismissible={false}` inside a `flex h-full flex-col` wrapper preceded by `TableSectionHeader`):
  ```tsx
  <div className="flex h-full flex-col">
    <TableSectionHeader
      title="Queues"
      count={0}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search queues…"
      chips={chips}
    />
    <div className="px-4 pb-4">
      <MessageBox type="info" size="block" title="No queues match these filters." dismissible={false}>
        <Button variant="secondary" size="sm" onClick={() => {
          onPriorityFilterChange([])
          setSearch('')
        }}>
          Clear filters
        </Button>
      </MessageBox>
    </div>
  </div>
  ```
- Import `MessageBox` from `@/components/ui/message-box` (already imported at line 6) and `Button` from `@/components/ui/button` (already imported at line 5) — no new imports needed.
- Do NOT alter the main-branch table render, the sort logic, the search logic, or the `PRIORITY_LABEL` constant.
- **v1 impact**: If v1 users apply a filter that produces zero queues, they now see this empty state instead of an empty table body. This is a strict improvement, no regression.

---

## Files to Create

Ordered logically: types → reducer → hook → child components → page → styles are inline.

### `app/open-inventory/task-queue-visibility-v2/assignment-builder-v2-reducer.ts`
- **Purpose**: Pure, framework-free state machine for the v2 Assignment Builder. Fork of `app/open-inventory/task-queue-visibility/assign/assignment-builder-reducer.ts` with the `ADVANCE_TO_WORKER` action removed. `activeStep` remains in the state but is repurposed — in v2 it does NOT drive table visibility (all three tables are always rendered); it is a focus-target hint that the page consumes via a `useEffect`.
- **Size estimate**: ~90 LOC (v1 is 110; drop ~20 by removing `ADVANCE_TO_WORKER`, its comments, and unused `PendingChange.step === 'worker'` variants).
- **Imports**:
  ```ts
  import type { AssignmentLogEntry, Queue, Task, Worker } from '@/app/open-inventory/task-queue-visibility/assign/_data'
  ```
- **Types to export**:
  - `BuilderStepV2 = 'queue' | 'task' | 'worker'` — identical to v1's `BuilderStep`.
  - `PendingChangeV2` — discriminated union, same shape as v1:
    ```ts
    | { step: 'queue'; queue: Queue }
    | { step: 'task'; task: Task }
    ```
  - `ConfirmationV2` — `{ taskLabel: string; workerId: string }` (same shape as v1).
  - `BuilderStateV2`:
    ```ts
    { queue: Queue | null; task: Task | null; worker: Worker | null;
      activeStep: BuilderStepV2; pendingChange: PendingChangeV2 | null;
      confirmation: ConfirmationV2 | null; assignments: AssignmentLogEntry[] }
    ```
  - `BuilderActionV2` — discriminated union:
    ```ts
    | { type: 'SELECT_QUEUE'; queue: Queue }
    | { type: 'SELECT_TASK'; task: Task }
    | { type: 'SELECT_WORKER'; worker: Worker }
    | { type: 'CONFIRM_PENDING' }
    | { type: 'CANCEL_PENDING' }
    | { type: 'EDIT_STEP'; step: BuilderStepV2 }
    | { type: 'ASSIGN'; entry: AssignmentLogEntry }
    | { type: 'DISMISS_CONFIRMATION' }
    ```
    **Note the delta from v1**: `ADVANCE_TO_WORKER` is deliberately absent — v2 has no auto-advance from Task to Worker.
- **Constants to export**:
  - `initialBuilderV2State: BuilderStateV2` — all nullable fields `null`, `activeStep: 'queue'`, `pendingChange: null`, `confirmation: null`, `assignments: []`.
- **Functions to export**:
  - `builderV2Reducer(state: BuilderStateV2, action: BuilderActionV2): BuilderStateV2` — implements the switch below.
- **Action semantics** (one-line each — verbatim from PRD §2 Pattern A with the auto-advance removed):
  - `SELECT_QUEUE` — same as v1: same-id → advance activeStep to `'task'` (or `'worker'` if downstream still filled); different id with downstream picks → set `pendingChange`; different id with no downstream → `{ queue, activeStep: 'task' }`.
  - `SELECT_TASK` — same as v1: same-id → advance activeStep to `'worker'` (or stay `'task'`); different id with worker filled → set `pendingChange`; different id with no worker → `{ task, activeStep: 'task' }` (v1 leaves activeStep on `'task'` and then dispatches `ADVANCE_TO_WORKER` after 150ms; v2 keeps activeStep on `'task'` — the hook does NOT dispatch a follow-up).
    - **v2-specific tweak**: after selecting a fresh task, the reducer instead sets `activeStep: 'worker'` immediately (no timeout, no follow-up dispatch). This mirrors what v1 achieves via `ADVANCE_TO_WORKER` — the effect is the same, minus the animation-buffer delay. **Rationale**: activeStep drives focus target; moving focus to Worker immediately after a fresh Task pick is the desired UX per PRD §5.6.
  - `SELECT_WORKER` — same as v1: `{ worker, activeStep: 'worker' }`. No changes.
  - `CONFIRM_PENDING` — same as v1: applies the pending change, clears downstream picks, sets activeStep to the newly-empty step.
  - `CANCEL_PENDING` — same as v1: `{ pendingChange: null }`.
  - `EDIT_STEP` — same as v1: `{ activeStep: action.step, pendingChange: null }`.
  - `ASSIGN` — same as v1: guards on all three filled, clears task+worker, preserves queue, appends entry, sets `activeStep: 'task'`, and populates `confirmation`.
  - `DISMISS_CONFIRMATION` — same as v1: `{ confirmation: null }`.
- **What is DELIBERATELY DIFFERENT vs v1**:
  1. No `ADVANCE_TO_WORKER` action.
  2. `SELECT_TASK` on a fresh (non-reselect, non-pending) pick sets `activeStep: 'worker'` immediately.
- **What is IDENTICAL to v1** (do not touch):
  - The backtrack-guard logic in `SELECT_QUEUE` / `SELECT_TASK` (downstream picks → set `pendingChange`).
  - The state shape aside from the `BuilderStepV2` type name and the reducer function name.
  - The `ASSIGN` post-effect (clears task+worker, preserves queue, appends to assignments, sets activeStep to `'task'`).

### `app/open-inventory/task-queue-visibility-v2/use-assignment-builder-v2.ts`
- **Purpose**: React hook wrapping the v2 reducer with typed stable callbacks. Fork of `app/open-inventory/task-queue-visibility/assign/use-assignment-builder.ts` with the 150ms `setTimeout` + `ADVANCE_TO_WORKER` dispatch removed.
- **Size estimate**: ~35 LOC (v1 is 51; drop ~15 by removing the auto-advance `useEffect`).
- **Imports**:
  ```ts
  import { useCallback, useReducer } from 'react'
  import type { AssignmentLogEntry, Queue, Task, Worker } from '@/app/open-inventory/task-queue-visibility/assign/_data'
  import {
    builderV2Reducer, initialBuilderV2State,
    type BuilderStateV2, type BuilderStepV2,
  } from './assignment-builder-v2-reducer'
  ```
- **Return shape** — `UseAssignmentBuilderV2Return`:
  ```ts
  {
    state: BuilderStateV2
    selectQueue:          (q: Queue) => void
    selectTask:           (t: Task) => void
    selectWorker:         (w: Worker) => void
    editStep:             (step: BuilderStepV2) => void
    assign:               () => void
    confirmPending:       () => void
    cancelPending:        () => void
    dismissConfirmation:  () => void
  }
  ```
- **`assign()` implementation** — mirrors v1:
  ```ts
  const assign = useCallback(() => {
    if (!state.queue || !state.task || !state.worker) return
    const entry: AssignmentLogEntry = {
      id: `${state.task.id}-${state.worker.id}-${state.assignments.length}`,
      taskLabel: state.task.taskName,
      queueName: state.queue.name,
      workerId: state.worker.id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    dispatch({ type: 'ASSIGN', entry })
  }, [state.queue, state.task, state.worker, state.assignments.length])
  ```
- **What is DELIBERATELY DIFFERENT vs v1's `use-assignment-builder.ts`**:
  1. No `setTimeout` firing `ADVANCE_TO_WORKER` on Task pick — v2's reducer handles the advance synchronously in `SELECT_TASK`.
  2. No `useEffect` watching `state.task` for the auto-advance.
- **Named export**: `useAssignmentBuilderV2`.

### `app/open-inventory/task-queue-visibility-v2/StackedStepSection.tsx`
- **Purpose**: One numbered, always-visible step section in the v2 layout. Wraps a `<section>` with `aria-labelledby` pointing at its heading, applies `aria-disabled` + `data-disabled` when the upstream isn't filled, and forwards a ref so the parent can call `focus()` on the section's first interactive row when the step becomes newly active.
- **Size estimate**: ~130 LOC (semantic wrapper + heading + BuilderSlot-style bullet inline + children slot).
- **Imports**:
  ```ts
  import { forwardRef, useRef, useImperativeHandle } from 'react'
  import { CheckIcon } from '@phosphor-icons/react'
  import { cn } from '@/lib/utils'
  ```
- **Types to define + export**:
  ```ts
  export type StackedSectionVariant = 'disabled' | 'active' | 'filled'

  export interface StackedStepSectionRef {
    /** Move focus to the section's first interactive row (used for step-enable focus jumps). */
    focusFirstRow: () => void
  }

  export interface StackedStepSectionProps {
    /** Step number (1, 2, or 3) rendered in the numbered bullet. */
    index: 1 | 2 | 3
    /** Heading text ("Select a Queue", "Select a Task", "Select a Worker"). */
    heading: string
    /** Shown under the heading only when variant === 'disabled'. e.g. "Pick a queue first." */
    disabledHint?: string
    variant: StackedSectionVariant
    /** Optional value chip shown next to the heading when variant === 'filled'. */
    filledValue?: string
    children: React.ReactNode
  }
  ```
- **Component contract**:
  - Renders `<section aria-labelledby={headingId}>` with a stable `id` derived from `useId()`.
  - When `variant === 'disabled'`: applies `aria-disabled="true"`, `data-disabled="true"`, and Tailwind `opacity-40 pointer-events-none` to the child region. Also renders a small text hint below the heading in `text-body-secondary`.
  - **`pointer-events-none`** on the child container is sufficient to prevent mouse interaction. For keyboard, the parent page owns the `tabindex="-1"` cascade — the existing `QueueTable` / `TaskTable` / `WorkerTable` components do NOT accept a `disabled` prop today, so this SPEC defers the child-level `tabindex="-1"` to a wrapping approach: `StackedStepSection` renders its children inside a `<div inert={variant === 'disabled' ? '' : undefined}>` OR, if `inert` is unavailable in the target Next.js/React runtime, applies a small effect that sets `tabindex="-1"` on all focusable descendants. **Preferred**: use the `inert` attribute — supported natively in React 19 as a boolean prop, and it removes descendants from the tab order and hides them from click events without altering their visible rendering (which is exactly the "dimmed but perceivable" requirement).
    - `inert` also implies `aria-hidden` at the browser level for content — this is a **known tradeoff**: the PRD explicitly says do NOT use `aria-hidden`. However, `inert` in React 19 is the sanctioned mechanism for "keep visible but non-interactive"; the assistive-tech behavior of `inert` differs from `aria-hidden` in that inert content stays in the accessibility tree but is marked as non-actionable (comparable to `aria-disabled`).
    - **Escape hatch if `inert` proves problematic**: replace with an effect that adds `aria-disabled="true"` and `tabindex="-1"` to each interactive descendant (search input, checkbox labels, radio inputs, sort buttons) via a query selector inside the child container. `StackedStepSection` owns this effect internally — the child tables do not need to change. Implement `inert` FIRST; fall back only if a screen-reader test surfaces a real problem.
  - Renders a numbered bullet on the left of the heading — inline in this file, styled to mirror `BuilderSlot`'s bullet exactly:
    - `disabled` → bordered outline circle, `opacity-60`, contains the number.
    - `active` → filled `bg-[var(--content-action-primary-600)] text-white`, contains the number.
    - `filled` → filled `bg-[var(--content-action-primary-600)] text-white`, contains `<CheckIcon size={14} weight="bold" />`.
  - When `variant === 'filled'` and `filledValue` is provided, renders it as a right-aligned muted chip: `<span className="text-sm text-[var(--text-body-secondary)]">{filledValue}</span>`.
  - Exposes `focusFirstRow()` via `useImperativeHandle`. Implementation: `containerRef.current?.querySelector('[role="radio"], input[type="radio"]')?.focus()`. Fallback to `containerRef.current?.querySelector('input, button, [tabindex]:not([tabindex="-1"])')` if no radio is found (empty-state case — focuses the "Clear filters" or "Pick a different queue" button).
- **Named export**: `StackedStepSection`.

### `app/open-inventory/task-queue-visibility-v2/StickyActionBar.tsx`
- **Purpose**: Bottom-anchored sticky action bar containing the running-summary row (three `BuilderSlot` chips + Assign button), the mutually-exclusive backtrack pending banner, and the post-Assign success banner. Owns the `Cmd/Ctrl+Enter` shortcut binding and the `Esc` binding inside the pending banner.
- **Size estimate**: ~180 LOC (three rendered banners + `useEffect` shortcut bindings + BuilderSlot chip row).
- **Imports**:
  ```ts
  import { useEffect } from 'react'
  import { WarningIcon, ChecksIcon, XIcon } from '@phosphor-icons/react'
  import { Button } from '@/components/ui/button'
  import { BuilderSlot, type SlotVariant } from '@/components/open-inventory/task-queue-visibility/BuilderSlot'
  import type { BuilderStateV2, BuilderStepV2 } from './assignment-builder-v2-reducer'
  ```
- **Type to define + export**:
  ```ts
  export interface StickyActionBarProps {
    state: BuilderStateV2
    onEditStep:            (step: BuilderStepV2) => void
    onAssign:              () => void
    onConfirmPending:      () => void
    onCancelPending:       () => void
    onDismissConfirmation: () => void
  }
  ```
- **Component contract** (three visible bands, in this render order):
  1. **Pending banner (when `state.pendingChange`)** — matches `AssignmentBuilderHeader.tsx` lines 83–100 verbatim; `role="alert"`, warning colors (`#fdf8ef` / `#f7ddb1` / `#c97000`), microcopy per PRD §5.3.
  2. **Success banner (when `state.confirmation && !state.pendingChange`)** — matches `AssignmentBuilderHeader.tsx` lines 102–122 verbatim; `role="status"`, success colors (`#f3fbee` / `#b5e89c` / `#4b9924`), microcopy `"{taskLabel} assigned to {workerId}."`, buttons `"Assign another"` + dismiss `×`.
  3. **Summary row (always visible, sits below the banners)**:
     - Three `BuilderSlot`s (index 1, 2, 3):
       - Slot 1 (Queue): `placeholder="Pick a queue"`, `value={state.queue?.name}`, variant computed via helper (see below). `onEdit={state.queue ? () => onEditStep('queue') : undefined}`. No `disabledReason` (Queue is never gated).
       - Slot 2 (Task): `placeholder="Pick a task"`, `value={state.task?.taskName}`, variant computed. `onEdit={state.task ? () => onEditStep('task') : undefined}`. `disabledReason="Pick a queue first"`.
       - Slot 3 (Worker): `placeholder="Pick a worker"`, `value={state.worker?.id}`, variant computed. `onEdit={state.worker ? () => onEditStep('worker') : undefined}`. `disabledReason="Pick a task first"`.
     - Primary `Button variant="primary" size="sm" disabled={!canAssign} onClick={onAssign}` with label `"Assign"`.
- **Variant computation helper** — internal to `StickyActionBar.tsx`, mirrors `AssignmentBuilderHeader.tsx` lines 18–24 verbatim:
  ```ts
  function slotVariant(step: BuilderStepV2, state: BuilderStateV2): SlotVariant {
    const filled = step === 'queue' ? state.queue : step === 'task' ? state.task : state.worker
    const lockedByUpstream = (step === 'task' && !state.queue) || (step === 'worker' && !state.task)
    if (lockedByUpstream) return 'disabled'
    if (state.activeStep === step) return 'active'
    return filled ? 'filled' : 'empty'
  }
  ```
- **`canAssign` derivation**:
  ```ts
  const canAssign = !!(state.queue && state.task && state.worker) && !state.pendingChange
  ```
- **`Cmd/Ctrl+Enter` shortcut binding** — verbatim from `AssignmentBuilderHeader.tsx` lines 41–50:
  ```ts
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
- **`Esc` shortcut binding** — new to v2 (not in v1):
  ```ts
  useEffect(() => {
    if (!state.pendingChange) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancelPending()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [state.pendingChange, onCancelPending])
  ```
- **Layout / stickiness**:
  - Root element: `<div className="sticky bottom-0 z-30 flex flex-col gap-2 border-t border-[var(--border-color-neutral-light)] bg-[var(--surface-section-bg)] px-4 py-3">`.
  - Inside: banner-if-any, then a `flex items-center gap-2` row for the three slots + Assign button.
- **Named export**: `StickyActionBar`.

### `app/open-inventory/task-queue-visibility-v2/page.tsx`
- **Purpose**: Route entry. Composes the page shell (`PageTitle` + `DailyAssignmentsPopover`), the always-visible left `FilterRail` in `mode="all"`, the three `StackedStepSection`s wrapping the reused Queue/Task/Worker tables, and the `StickyActionBar`. Owns the focus-management `useEffect` that jumps focus into a newly-active section.
- **Size estimate**: ~200 LOC.
- **File-level header comment** — required by prototype hygiene. First 30 lines are a block comment covering:
  - Purpose statement (one line).
  - Figma reference URL: `https://www.figma.com/design/54ARm4erwwo8sI5rp2MQAq/WFM?node-id=519-85755&m=dev`.
  - Workflow directory link: `.workflow/assign-to-worker/` (PRD.md, SPEC.md, PLAN.md).
  - Interaction model summary (one paragraph): "All three tables always visible, dimmed until upstream picks exist, sticky footer holds summary + Assign."
  - Focus / keyboard / a11y contract (bullet list): tab order, arrow keys, Enter/Space, Cmd/Ctrl+Enter, Esc, `aria-disabled` + `inert` on dimmed sections, `role="alert"` / `role="status"` on banners, `aria-live="polite"` on daily counter.
  - Explicit note: "This is v2 — v1 lives at `app/open-inventory/task-queue-visibility/assign/` as a sibling alternative pattern. Do not confuse the two."
- **Imports**:
  ```ts
  'use client'
  import { useEffect, useRef, useState } from 'react'
  import { PageTitle } from '@/components/ui/page-title'
  import { FilterRail } from '@/components/open-inventory/task-queue-visibility/FilterRail'
  import { QueueTable } from '@/components/open-inventory/task-queue-visibility/QueueTable'
  import { TaskTable } from '@/components/open-inventory/task-queue-visibility/TaskTable'
  import { WorkerTable } from '@/components/open-inventory/task-queue-visibility/WorkerTable'
  import { DailyAssignmentsPopover } from '@/components/open-inventory/task-queue-visibility/DailyAssignmentsPopover'
  import type { Priority, TaskStatus, WorkerStatus } from '@/app/open-inventory/task-queue-visibility/assign/_data'
  import { StackedStepSection, type StackedStepSectionRef } from './StackedStepSection'
  import { StickyActionBar } from './StickyActionBar'
  import { useAssignmentBuilderV2 } from './use-assignment-builder-v2'
  ```
- **State model**:
  - `builder = useAssignmentBuilderV2()` — the reducer + callbacks.
  - Three filter states (mirror v1 page.tsx lines 51–53):
    ```ts
    const [priorityFilter, setPriorityFilter] = useState<Priority[]>([])
    const [taskStatusFilter, setTaskStatusFilter] = useState<TaskStatus[]>([])
    const [workerStatusFilter, setWorkerStatusFilter] = useState<WorkerStatus[]>([])
    ```
  - Three section refs:
    ```ts
    const queueSectionRef  = useRef<StackedStepSectionRef>(null)
    const taskSectionRef   = useRef<StackedStepSectionRef>(null)
    const workerSectionRef = useRef<StackedStepSectionRef>(null)
    ```
- **Section variant computation** — inline `getSectionVariant(step)`:
  ```ts
  function getSectionVariant(step: 'queue' | 'task' | 'worker'): 'disabled' | 'active' | 'filled' {
    const filled = step === 'queue' ? state.queue : step === 'task' ? state.task : state.worker
    const lockedByUpstream = (step === 'task' && !state.queue) || (step === 'worker' && !state.task)
    if (lockedByUpstream) return 'disabled'
    if (filled) return 'filled'
    return 'active'  // enabled but not yet picked → active state (the current step)
  }
  ```
  - Note: this differs from `slotVariant` in `StickyActionBar`. The section has three visual states (`disabled | active | filled`); the sticky-footer bullet has four (`empty | active | filled | disabled`) because it needs a distinct look for "reachable but not currently focused". In the stacked page, "not currently focused" is not meaningful — the section is either dimmed, editable (which we call `active`), or has a pick (which we call `filled`).
- **Focus-management `useEffect`** — one effect, watches `state.activeStep`:
  ```ts
  useEffect(() => {
    if (state.pendingChange) return   // never move focus while pending banner is open
    if (state.activeStep === 'queue')  queueSectionRef.current?.focusFirstRow()
    if (state.activeStep === 'task')   taskSectionRef.current?.focusFirstRow()
    if (state.activeStep === 'worker') workerSectionRef.current?.focusFirstRow()
  }, [state.activeStep, state.pendingChange])
  ```
  - This effect fires on every `activeStep` change. `SELECT_QUEUE`, `SELECT_TASK`, `CONFIRM_PENDING`, `ASSIGN`, `DISMISS_CONFIRMATION` all set `activeStep` to the newly-target step in the reducer, so this one `useEffect` handles all five focus-move events.
  - `CANCEL_PENDING` does NOT change `activeStep`, so no focus jump — focus stays where the user was, per PRD §5.6.
- **`onSelect` wire-through** — for each of the three tables, pass a wrapper that calls `builder.select*(entity)`. If the reducer determines the selection created a `pendingChange`, no focus move happens (the pending banner appears in the sticky footer, `role="alert"` handles the announcement).
- **Filter chip clear semantics for FilterRail** — v1's page (line 55) uses a `clearActiveStepFilters()` that clears only the current step's filter. In v2, since all three are visible, the FilterRail's `Clear Filters` button should clear all three at once:
  ```ts
  const clearAllFilters = () => {
    setPriorityFilter([])
    setTaskStatusFilter([])
    setWorkerStatusFilter([])
  }
  const hasActiveFilters =
    priorityFilter.length > 0 || taskStatusFilter.length > 0 || workerStatusFilter.length > 0
  ```
  Passed to `FilterRail` as `onClearAll={clearAllFilters}` and `hasActiveFilters={hasActiveFilters}`.
- **Rendered layout**:
  ```tsx
  <div className="flex min-h-screen flex-col bg-[var(--color-surface-display)]">
    <PageTitle
      title="Task Queue Visibility"
      subtitle="Stacked Assignment Flow — assign open tasks to eligible workers"
      actions={<DailyAssignmentsPopover assignments={state.assignments} />}
    />

    <div className="flex flex-1 px-4 py-4">
      <FilterRail
        mode="all"
        step="queue"  /* unused in mode='all' but the prop is still required by v1's API */
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        taskStatusFilter={taskStatusFilter}
        onTaskStatusFilterChange={setTaskStatusFilter}
        workerStatusFilter={workerStatusFilter}
        onWorkerStatusFilterChange={setWorkerStatusFilter}
        onClearAll={clearAllFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <div className="flex flex-1 flex-col gap-6 pb-24">
        <StackedStepSection ref={queueSectionRef} index={1} heading="Select a Queue"
          variant={getSectionVariant('queue')}
          filledValue={state.queue?.name}>
          <QueueTable
            selectedQueueId={state.queue?.id}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            onSelect={builder.selectQueue}
          />
        </StackedStepSection>

        <StackedStepSection ref={taskSectionRef} index={2} heading="Select a Task"
          variant={getSectionVariant('task')}
          disabledHint="Pick a queue first."
          filledValue={state.task?.taskName}>
          {state.queue ? (
            <TaskTable
              queue={state.queue}
              selectedTaskId={state.task?.id}
              statusFilter={taskStatusFilter}
              onStatusFilterChange={setTaskStatusFilter}
              onSelect={builder.selectTask}
              onPickDifferentQueue={() => builder.editStep('queue')}
            />
          ) : (
            <TaskTablePlaceholder />
          )}
        </StackedStepSection>

        <StackedStepSection ref={workerSectionRef} index={3} heading="Select a Worker"
          variant={getSectionVariant('worker')}
          disabledHint="Pick a task first."
          filledValue={state.worker?.id}>
          {state.task && state.queue ? (
            <WorkerTable
              task={state.task}
              queueName={state.queue.name}
              selectedWorkerId={state.worker?.id}
              statusFilter={workerStatusFilter}
              onStatusFilterChange={setWorkerStatusFilter}
              onSelect={builder.selectWorker}
              onPickDifferentTask={() => builder.editStep('task')}
            />
          ) : (
            <WorkerTablePlaceholder />
          )}
        </StackedStepSection>
      </div>
    </div>

    <StickyActionBar
      state={state}
      onEditStep={builder.editStep}
      onAssign={builder.assign}
      onConfirmPending={builder.confirmPending}
      onCancelPending={builder.cancelPending}
      onDismissConfirmation={builder.dismissConfirmation}
    />
  </div>
  ```
- **`TaskTablePlaceholder` / `WorkerTablePlaceholder`** — inline components in `page.tsx`, rendered when the upstream isn't picked yet. They exist because `TaskTable` requires a non-null `queue` prop and `WorkerTable` requires a non-null `task` — passing `null` would fail TypeScript strict. Each placeholder renders a lightweight visual: a `TableSectionHeader`-style bar with a greyed count (`0`) and a table skeleton (3 empty rows at 40% opacity). Kept minimal — this is what the user sees in the dimmed variant. Approximate 30 LOC combined.
  - Alternative rejected: make `queue` / `task` optional on `TaskTable` / `WorkerTable` and let them render their own dimmed view. Rejected because it would require modifying v1 components' contracts and changing their logic — bigger blast radius than a two-file placeholder inside v2's route.
- **`export const dynamic = 'force-dynamic'`** at the bottom (mirrors v1 page.tsx line 141).
- **Default export**: `TaskQueueVisibilityV2AssignPage`.

---

## Component Tree Diagram

```
TaskQueueVisibilityV2AssignPage  (page.tsx)
├── PageTitle
│   └── actions slot
│       └── DailyAssignmentsPopover  (reused as-is)
├── main flex row
│   ├── FilterRail (mode="all")           ← v1 component, extended in-place
│   │   ├── Priority FilterGroup
│   │   ├── Task Status FilterGroup
│   │   └── Worker Status FilterGroup
│   └── stacked column (flex-1 flex-col gap-6 pb-24)
│       ├── StackedStepSection index=1 heading="Select a Queue"   ← NEW
│       │   └── QueueTable                                        ← v1 component, empty state extended in-place
│       │       └── TableSectionHeader (title="Queues")
│       ├── StackedStepSection index=2 heading="Select a Task"
│       │   └── TaskTable (or TaskTablePlaceholder when queue is null)
│       │       └── TableSectionHeader (title="Tasks in {queue}")
│       └── StackedStepSection index=3 heading="Select a Worker"
│           └── WorkerTable (or WorkerTablePlaceholder when task is null)
│               └── TableSectionHeader (title="Eligible workers for {task}", chipRowExtra: Switch)
└── StickyActionBar  (sticky bottom-0)                            ← NEW
    ├── Pending banner   (role="alert",  when state.pendingChange)
    ├── Success banner   (role="status", when state.confirmation && !state.pendingChange)
    └── Summary row
        ├── BuilderSlot ×3   (reused: variants empty | active | filled | disabled)
        └── Assign Button    (Cmd/Ctrl+Enter fires this when canAssign)
```

---

## Per-State UI Mapping

For each of the six state cases described in the PRD, the mapping to concrete render:

| State | Section 1 (Queue) | Section 2 (Task) | Section 3 (Worker) | Sticky footer |
|---|---|---|---|---|
| **1. Landing** | variant `active`, `QueueTable` interactive | variant `disabled`, `inert`, `TaskTablePlaceholder` | variant `disabled`, `inert`, `WorkerTablePlaceholder` | Slot1 active "Pick a queue", Slot2 disabled + tooltip "Pick a queue first", Slot3 disabled + tooltip "Pick a task first", Assign disabled |
| **2. Queue picked** | variant `filled`, value chip = queue name, `QueueTable` still interactive (user can change pick — will trigger pending banner if Slot 2 filled) | variant `active`, `TaskTable` interactive with `state.queue` | variant `disabled`, `inert`, `WorkerTablePlaceholder` | Slot1 filled (pencil edit), Slot2 active "Pick a task", Slot3 disabled + tooltip, Assign disabled |
| **3. Task picked** | variant `filled`, chip | variant `filled`, chip = task name, `TaskTable` interactive | variant `active`, `WorkerTable` interactive with `state.task` + `state.queue.name` | Slot1 filled, Slot2 filled (pencil edit), Slot3 active "Pick a worker", Assign disabled |
| **4. All filled (Assign ready)** | variant `filled` | variant `filled` | variant `filled`, value chip = worker id, `WorkerTable` interactive | Slot1 filled, Slot2 filled, Slot3 filled (pencil edit), Assign enabled (primary), Cmd/Ctrl+Enter armed |
| **5. Post-Assign** | variant `filled` (Queue preserved) | variant `active`, `TaskTable` interactive with same queue | variant `disabled`, `inert`, `WorkerTablePlaceholder` | Success banner visible for the duration until user dismisses OR clicks "Assign another". Below the banner: Slot1 filled, Slot2 active, Slot3 disabled, Assign disabled. Daily counter chip in PageTitle increments |
| **6. Backtrack warning** | variant reflects prior pick (`filled` for queue if the pending is a task change; still `filled` for queue if pending is a queue change — but the change is not yet applied). Tables remain interactive; `StackedStepSection` variant is unaffected by pending. | same principle | same principle | Pending banner visible (`role="alert"`), text per PRD §5.3 (context-dependent). Cancel + Change buttons. Assign disabled while pending. Summary row still shows current picks (not the pending ones). Esc key dispatches `CANCEL_PENDING` |

Empty states (orthogonal to the six above — can occur inside any state where the section is `active`):

| Empty state | Section | Rendered by | Copy | Rescue button |
|---|---|---|---|---|
| No matching queues (filter) | Section 1 | `QueueTable.tsx` (**new** empty state branch) | `"No queues match these filters."` | `"Clear filters"` — clears `priorityFilter` and `search` |
| No open tasks in queue | Section 2 | `TaskTable.tsx` (existing, lines 65–76) | `"No open tasks in {queue.name} right now"` | `"Pick a different queue"` — calls `onPickDifferentQueue()` which dispatches `editStep('queue')` |
| No eligible workers | Section 3 | `WorkerTable.tsx` (existing, lines 52–66) | `"No eligible workers available right now"` | `"Show all workers"` (sets `showAll(true)`) and `"Pick a different task"` (dispatches `editStep('task')`) |

---

## Focus Management Timing

Single `useEffect` in `page.tsx`:

```ts
useEffect(() => {
  if (state.pendingChange) return
  if (state.activeStep === 'queue')  queueSectionRef.current?.focusFirstRow()
  if (state.activeStep === 'task')   taskSectionRef.current?.focusFirstRow()
  if (state.activeStep === 'worker') workerSectionRef.current?.focusFirstRow()
}, [state.activeStep, state.pendingChange])
```

Trigger mapping — each of these reducer actions changes `state.activeStep`, causing the effect to re-run:
| Action | `activeStep` after | Focus target |
|---|---|---|
| `SELECT_QUEUE` (fresh, no downstream picks) | `'task'` | first row of Task section |
| `SELECT_QUEUE` (same id, no change) | unchanged / advance to `'task'` or `'worker'` per current picks | first row of that section |
| `SELECT_TASK` (fresh, no worker) | `'worker'` (v2 change — see reducer semantics) | first row of Worker section |
| `SELECT_TASK` (same id) | `'worker'` or `'task'` depending on worker | first row of that section |
| `SELECT_WORKER` | `'worker'` (unchanged) | Worker section (no jump) |
| `CONFIRM_PENDING` (queue change) | `'task'` | first row of Task section |
| `CONFIRM_PENDING` (task change) | `'worker'` | first row of Worker section |
| `CANCEL_PENDING` | unchanged | no jump (effect early-returns while `pendingChange` was set; now it's null but `activeStep` didn't change, so the effect does not re-run) |
| `EDIT_STEP` | set to `action.step` | first row of that section |
| `ASSIGN` | `'task'` | first row of Task section |
| `DISMISS_CONFIRMATION` | unchanged | no jump — but if the confirmation was blocking user attention, this is fine. Alternative: watch `state.confirmation` too — decision: don't, the PRD says focus jumps to Task after dismiss, and `activeStep` is already `'task'` from the preceding `ASSIGN`. So the natural state of things is fine. |

`focusFirstRow()` implementation (inside `StackedStepSection` via `useImperativeHandle`):
1. Query the section's container for the first `[role="radio"]` OR `input[type="radio"]`.
2. If none found (empty-state case), query for the first `button, input, [tabindex]:not([tabindex="-1"])`.
3. Call `.focus({ preventScroll: false })` — allow scroll so the user's viewport follows.

**Edge case**: focusing an element inside an `inert` container is a no-op (the browser refuses). Since `focusFirstRow()` only runs when the section becomes `active` (which flips `inert` off in the same render tick), React's batched effect timing ensures the `inert` attribute is already removed before the ref call runs. If a browser regression surfaces, wrap the focus call in `requestAnimationFrame` inside `StackedStepSection`.

---

## Sticky Footer Microcopy (verbatim source)

Copied verbatim from PRD §5.3 to give Step 3 one source. If PRD and SPEC ever disagree, PRD wins.

### Slot placeholders (variant `empty` or `active`):
- Slot 1: `"Pick a queue"`
- Slot 2: `"Pick a task"`
- Slot 3: `"Pick a worker"`

### Slot tooltips (variant `disabled`):
- Slot 2: `"Pick a queue first"`
- Slot 3: `"Pick a task first"`

### Slot values (variant `filled`):
- Slot 1: `state.queue.name` (e.g. `"Corr_Duals_FL"`)
- Slot 2: `state.task.taskName` (e.g. `"Task-01144"`)
- Slot 3: `state.worker.id` (e.g. `"00767"`)

### Assign button:
- Label: `"Assign"`
- Disabled condition: `!canAssign` where `canAssign = !!(state.queue && state.task && state.worker) && !state.pendingChange`.

### Pending banner (mutually exclusive with success):
- Icon: `WarningIcon`
- `role="alert"`
- Text:
  - Queue change with only task picked: `` `Changing the queue will clear ${state.task.taskName}.` ``
  - Queue change with task + worker picked: `` `Changing the queue will clear ${state.task.taskName} and ${state.worker.id}.` ``
  - Task change with worker picked: `` `Changing the task will clear ${state.worker.id}.` ``
  - Fallback (defensive, should never fire): `` `Changing the ${pendingChange.step} will clear downstream selections.` ``
- Buttons: `"Cancel"` (secondary, `CANCEL_PENDING`) + `"Change queue"` OR `"Change task"` (primary, `CONFIRM_PENDING`).
- `Esc` key also dispatches `CANCEL_PENDING`.

### Success banner (mutually exclusive with pending):
- Icon: `ChecksIcon`
- `role="status"`
- Text: `` `${state.confirmation.taskLabel} assigned to ${state.confirmation.workerId}.` ``
- Buttons: `"Assign another"` (secondary, `DISMISS_CONFIRMATION`) + `×` dismiss icon (aria-label `"Dismiss"`, also `DISMISS_CONFIRMATION`).

### Daily counter (in `PageTitle` `actions` slot via `DailyAssignmentsPopover`):
- Trigger label: `` `${state.assignments.length} assigned today` ``
- Popover title: `"Today's assignments"`
- Empty popover copy: `"No assignments yet today."`
- Row format: `` `${a.taskLabel} → ${a.workerId}` `` + subtext `` `${a.queueName} · ${a.timestamp}` ``
- Wrap the trigger button in a `<div aria-live="polite">` so the incrementing count is announced.

---

## FilterRail `mode` Prop — Before/After

**Before** (v1, current `FilterRail.tsx`):
```ts
{step === 'queue'  && <FilterGroup label="Priority" … />}
{step === 'task'   && <FilterGroup label="Status"   … />}
{step === 'worker' && <FilterGroup label="Status"   … />}
```

**After**:
```ts
{(step === 'queue'  || mode === 'all') && <FilterGroup label="Priority" … />}
{(step === 'task'   || mode === 'all') && <FilterGroup label="Status"   … />}
{(step === 'worker' || mode === 'all') && <FilterGroup label="Status"   … />}
```

Interface change:
```ts
export interface FilterRailProps {
  step: BuilderStep
  mode?: 'single' | 'all'   // NEW — default 'single'
  priorityFilter: Priority[]
  onPriorityFilterChange: (v: Priority[]) => void
  taskStatusFilter: TaskStatus[]
  onTaskStatusFilterChange: (v: TaskStatus[]) => void
  workerStatusFilter: WorkerStatus[]
  onWorkerStatusFilterChange: (v: WorkerStatus[]) => void
  onClearAll: () => void
  hasActiveFilters: boolean
}
```

v1's call site (`app/open-inventory/task-queue-visibility/assign/page.tsx`) does not pass `mode`, so it defaults to `'single'` and v1's behavior is unchanged. No v1 change required.

---

## QueueTable Empty State — Before/After

**Before** (v1, current `QueueTable.tsx` main return path):
```tsx
return (
  <div className="flex h-full flex-col">
    <TableSectionHeader title="Queues" count={sorted.length} … />
    <Table>…rendered rows…</Table>
  </div>
)
```
When `sorted.length === 0` and any filter is applied, this currently renders an empty `<TableBody>`.

**After** — add above the main return:
```tsx
const hasActiveFilters = priorityFilter.length > 0 || search.length > 0

if (sorted.length === 0 && hasActiveFilters) {
  return (
    <div className="flex h-full flex-col">
      <TableSectionHeader title="Queues" count={0}
        searchValue={search} onSearchChange={setSearch}
        searchPlaceholder="Search queues…" chips={chips} />
      <div className="px-4 pb-4">
        <MessageBox type="info" size="block" title="No queues match these filters." dismissible={false}>
          <Button variant="secondary" size="sm" onClick={() => { onPriorityFilterChange([]); setSearch('') }}>
            Clear filters
          </Button>
        </MessageBox>
      </div>
    </div>
  )
}
```

If `sorted.length === 0` and NO filters are active (should never happen given fixture data), fall through to the main table render (empty tbody) — that's an implementation state we don't need to design for.

---

## Sidebar Registration — Exact Insertion

`components/layout/Sidebar.tsx` — current `Open Inventory` group at line 146:

```ts
{
  group: 'Open Inventory',
  Icon: /* current icon */,
  basePath: '/open-inventory',
  items: [
    { label: 'Dashboard',                href: '/open-inventory',     status: 'wip' },
    { label: 'Regulatory Due Dates (TAT)', href: '/open-inventory/tat', status: 'wip' },
    { label: 'Internal SLA',             href: '/open-inventory/sla', status: 'wip' },
    { label: 'Task Queue Visibility',    href: '/open-inventory/task-queue-visibility/assign', status: 'wip' },
    // ← INSERT HERE (after existing v1 line, before closing bracket)
  ],
},
```

Insert:
```ts
{ label: 'Task Queue Visibility (v2)', href: '/open-inventory/task-queue-visibility-v2', status: 'wip' },
```

---

## Implementation Notes

- **`inert` attribute + React 19**: React 19 supports `inert` as a boolean prop that maps to the HTML `inert` attribute. Use `inert={variant === 'disabled' ? '' : undefined}` (empty string sets the attribute; `undefined` removes it — this is the React 19 idiom for boolean HTML attributes). If Step 3 finds `inert` misbehaves under Next.js 16 SSR (empty attribute not serializing), fall back to the effect-based `tabindex="-1"` approach described in `StackedStepSection`'s spec.
- **`role="alert"` vs `role="status"`**: keep them distinct — `alert` interrupts the screen reader queue; `status` politely joins it. Pending is `alert` (destructive-adjacent action); Success is `status` (confirmation). This mirrors v1 and is correct.
- **Daily counter `aria-live`**: v1's `DailyAssignmentsPopover` does not wrap its trigger button in an `aria-live` region — SPEC directs Step 3 to add `<div aria-live="polite">` around the `DailyAssignmentsPopover` trigger in `page.tsx`. Do NOT modify `DailyAssignmentsPopover` itself.
- **`padding-bottom: pb-24`** on the scrollable main column ensures the last stacked section's last row isn't obscured by the sticky footer (~96px tall including one banner + summary row + border). Adjust if empirically too much / too little during Step 3's dev-server check.
- **File-size caps** per project Rule 7: `page.tsx` ~200 LOC (well under 500 page cap), `StickyActionBar` ~180 LOC (under 250 complex cap), `StackedStepSection` ~130 LOC (under 250), reducer ~90 LOC (under 100 utility cap), hook ~35 LOC (under 100 hook cap). All within limits.
- **No `console.log`, no commented-out code, no `any` types.** All function parameters and return values fully typed. Import types with `import type`.
- **Order of files in each new .tsx**: 1) imports (grouped: React → third-party → internal components → internal utils → types); 2) types/interfaces; 3) constants; 4) internal helper functions; 5) component; 6) named export at the end.
- **Named exports only** — no `default export` except on `page.tsx` (Next.js App Router requires default export from page files).
- **No Co-Authored-By** in commit messages (project Rule 24 — overrides session guidance).

---

## Testing Requirements

Per project convention (`notes/wfm-prototype-discovery.md` §5 confirms: "no test files seen") and the prototype's status, **this SPEC does not require test file creation**. The project has zero colocated tests and Vitest is configured for Storybook-driven testing only. Adding tests here would be scope creep.

**If v2 graduates from prototype to production**, the following test surface is recommended:
- Unit tests for `builderV2Reducer` — pure function, high leverage. Cover every action + the backtrack branches + the `SELECT_TASK` fresh-pick advance behavior.
- Unit tests for `useAssignmentBuilderV2`'s `assign()` — verify `AssignmentLogEntry` shape.
- Component tests for `StackedStepSection` — verify `aria-disabled`, `inert` behavior, and `focusFirstRow()` refs.
- Playwright e2e test for the full flow through all six states.

Step 3 is not required to implement these. If Step 3 has time and the dev server is verified green, adding a `assignment-builder-v2-reducer.test.ts` would be a nice-to-have; otherwise skip.

---

## Explicit Non-Goals

The SPEC deliberately does NOT include:
- **Real API wiring.** All data comes from `_data.ts`. No fetch, no server actions.
- **Persistence.** Daily counter, filter state, and selections all reset on reload.
- **Test files.** See Testing Requirements above.
- **Worker-first entry.** User confirmed queue-first only. Do not spec a worker-centric flow.
- **View toggle (vertical/horizontal).** Removed per locked decision #7.
- **The "2 tasks → Worker" section-header string.** Removed per locked decision #7.
- **Modal backtrack warning.** Q1 = inline banner. Do not implement a modal path.
- **A new StepSlot / SectionHeader DS primitive.** `BuilderSlot` + `TableSectionHeader` already cover the requirement; new primitives violate Rule of Three (Rule 4).
- **Stepper DS component** (`components/ui/stepper.tsx`). Wrong pattern for a single-page guided flow.
- **`framer-motion` animations.** No swap animation needed; use CSS `opacity` transition on the `data-disabled` attribute for the dimmed-to-active fade.
- **Storybook stories.** Prototype scope.
- **CHANGELOG entry.** Prototype scope.
- **Documentation MDX** under `app/components/…` — prototype has no docs page.
- **`FilterRailV2.tsx`**. Q2 = extend existing FilterRail in-place with a `mode` prop.
- **Modification of `_data.ts`**. It already covers everything v2 needs.
- **Modification of `assignment-builder-reducer.ts` (v1)**. v2 forks; v1 stays.
- **Modification of `use-assignment-builder.ts` (v1)**. v2 forks; v1 stays.
- **Modification of `AssignmentBuilderHeader.tsx`**. v2 does not use this component.
- **Modification of the `DailyAssignmentsPopover` component itself**. `aria-live` region goes in `page.tsx`, not the popover.
- **Modification of any table component beyond `QueueTable`'s empty state**. `TaskTable` and `WorkerTable` are used as-is.

---

## Order of Implementation (Commit Sequence for Step 3)

Per project Rule 24 (small, focused commits, one thing each, TypeScript-clean per commit). Suggested sequence:

1. **`feat(v2): add reducer for stacked assignment builder`** — creates `assignment-builder-v2-reducer.ts`. Pure logic, no UI, TypeScript-compiles standalone.
2. **`feat(v2): add useAssignmentBuilderV2 hook`** — creates `use-assignment-builder-v2.ts`. Depends on commit 1.
3. **`feat(v2): add StackedStepSection component`** — creates `StackedStepSection.tsx`. Standalone, no reducer dependency.
4. **`feat(v2): add StickyActionBar component`** — creates `StickyActionBar.tsx`. Depends on commit 1 (types).
5. **`feat(FilterRail): add mode='all' prop`** — modifies `components/open-inventory/task-queue-visibility/FilterRail.tsx`. Backwards-compatible; v1 keeps working.
6. **`feat(QueueTable): add no-matching-filters empty state`** — modifies `components/open-inventory/task-queue-visibility/QueueTable.tsx`. Backwards-compatible; v1 benefits.
7. **`feat(v2): add stacked assignment page`** — creates `app/open-inventory/task-queue-visibility-v2/page.tsx`. Depends on commits 1–6.
8. **`feat(nav): register v2 route in sidebar`** — modifies `components/layout/Sidebar.tsx`. Depends on commit 7 existing (route reachable).

After commit 8, run `npm run dev` and verify:
- Route `/open-inventory/task-queue-visibility-v2` loads with no console errors.
- Landing state renders (Slot 1 active, Slots 2/3 disabled).
- Full flow works: pick queue → pick task → pick worker → Assign → success banner → counter increments.
- Cmd/Ctrl+Enter fires Assign when enabled.
- Esc dismisses pending banner.
- Backtracking (pick a queue after task/worker picked) surfaces the pending banner.
- All three empty states surfaceable.
- Sidebar entry visible under Open Inventory group with `wip` badge.

---

## Assumptions

> ⚠️ **High-risk**: **React 19's `inert` prop handling under Next.js 16 SSR.** The spec depends on `<div inert={variant === 'disabled' ? '' : undefined}>` serializing to the HTML `inert` attribute correctly through Next.js 16's server-render pass. If this breaks (attribute not appearing, or hydration warning about attribute mismatch), Step 3 must fall back to a `useEffect` that sets `tabindex="-1"` on all descendant focusable elements manually. This is a small implementation detail but has downstream a11y consequences — verify on the first `npm run dev` run.

- **`aria-live="polite"` around the daily counter goes in `page.tsx`** (wraps the `DailyAssignmentsPopover` trigger), not inside `DailyAssignmentsPopover.tsx`. Rationale: keeping the popover component untouched preserves v1's behavior; the a11y improvement is v2-local.
- **The `mode="all"` FilterRail is 240px wide with all three groups stacked** — no scroll needed at typical viewport heights (14"+ laptop), since three collapsible groups each ~40px collapsed / ~200px expanded fit above the fold. If empirically too tall, Step 3 may add `overflow-y-auto max-h-[calc(100vh-...)]` to the rail's outer container.
- **`pb-24` on the main scrollable column** is an estimate for the sticky footer's height (footer + banner). Step 3 measures the actual rendered footer height in the browser and adjusts if the last row is clipped.
- **`focusFirstRow()` selector** `[role="radio"], input[type="radio"]` is expected to match the first row of any of the three tables. If Step 3 finds a mismatch (e.g. `QueueTable` uses a different row-selection idiom than the `Radio` component from `@/components/ui/checkbox`), broaden the selector to include the actual clickable row element.
- **`DailyAssignmentsPopover` timestamp format** is derived from `new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })` inside the hook's `assign()`. This is browser-locale-dependent — acceptable for a prototype; a production version would want to pin locale for consistency.
- **The two placeholder subcomponents** (`TaskTablePlaceholder`, `WorkerTablePlaceholder`) live inline inside `page.tsx` rather than as separate files, keeping the route folder to five files total. If Step 3 finds `page.tsx` growing above 250 LOC because of them, extract to `TableSkeleton.tsx` in the same folder.

*This SPEC is ready for the react-frontend-architect (Step 3) phase.*
