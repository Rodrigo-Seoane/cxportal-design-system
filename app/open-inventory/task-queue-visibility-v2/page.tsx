/**
 * Task Queue Visibility — v2 (Stacked Assignment Flow)
 * ─────────────────────────────────────────────────────────────────────────
 * Figma reference (source of truth for tokens/components/styles — NOT for
 * layout, which this v2 route replaces):
 *   https://www.figma.com/design/54ARm4erwwo8sI5rp2MQAq/WFM?node-id=519-85755&m=dev
 *
 * Workflow docs (PRD, SPEC, PLAN — the origin of this route):
 *   .workflow/assign-to-worker/
 *
 * Interaction model — Option 1 (numbered stacked steps + sticky footer):
 * All three tables (Queues → Tasks → Workers) render simultaneously in
 * vertically stacked sections. Sections ②/③ are dimmed (aria-disabled +
 * `inert`) until the upstream selection exists. A sticky footer holds the
 * running summary (three BuilderSlot chips) + primary Assign CTA + the
 * mutually-exclusive backtrack pending / post-Assign success banners.
 *
 * v1 (single-focus swap pattern) lives at app/open-inventory/task-queue-
 * visibility/assign/ as a sibling alternative. This route does NOT modify v1.
 *
 * Focus / keyboard / a11y contract:
 *   - Tab order: page-title actions → filter rail → ① rows → ② rows (skipped
 *     when dimmed via inert) → ③ rows (skipped when dimmed) → sticky footer.
 *   - Arrow keys navigate within each table (radio-group semantics from
 *     Radio inside TaskTable/WorkerTable; row-click on QueueTable).
 *   - Enter / Space selects the focused row.
 *   - Cmd/Ctrl+Enter fires Assign when the CTA is enabled (bound in
 *     StickyActionBar).
 *   - Esc dismisses the pending-change banner (bound in StickyActionBar).
 *   - On step-enable (SELECT_QUEUE / SELECT_TASK / CONFIRM_PENDING / ASSIGN
 *     / DISMISS_CONFIRMATION), focus jumps to the first interactive row of
 *     the newly-active section via a single useEffect on state.activeStep.
 *   - Dimmed sections use aria-disabled + `inert` (React 19), staying
 *     perceivable to screen readers and skimmable to sighted users.
 *   - Pending banner: role="alert". Success banner: role="status". Daily
 *     counter is wrapped in aria-live="polite" so its increment announces.
 *
 * DS gaps flagged (not built — deferred to graduation):
 *   - No DS Radio primitive at region level; composed via role="radio"
 *     inside table cells (handled by existing table components).
 *   - No DS StickyBar primitive; inline position: sticky; bottom: 0.
 *   - No reusable numbered-slot DS component; StackedStepSection is
 *     prototype-local. Promote to components/ when a second consumer appears.
 */
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

// ── Placeholder table skeletons for dimmed sections ─────────────────────────
// Kept minimal because sections ②/③ start with no upstream data. Once the
// upstream is picked, the real Task/WorkerTable takes over.

function PlaceholderRows() {
  return (
    <div className="flex flex-col gap-2 px-4 py-4">
      {[0, 1, 2].map(i => (
        <div key={i} className="h-8 rounded-sm bg-[var(--border-color-neutral-light)] opacity-40" />
      ))}
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function TaskQueueVisibilityV2AssignPage() {
  const builder = useAssignmentBuilderV2()
  const { state } = builder

  const [priorityFilter, setPriorityFilter] = useState<Priority[]>([])
  const [taskStatusFilter, setTaskStatusFilter] = useState<TaskStatus[]>([])
  const [workerStatusFilter, setWorkerStatusFilter] = useState<WorkerStatus[]>([])

  const queueSectionRef = useRef<StackedStepSectionRef>(null)
  const taskSectionRef = useRef<StackedStepSectionRef>(null)
  const workerSectionRef = useRef<StackedStepSectionRef>(null)

  // Focus jumps to the first row of the newly-active section on every
  // activeStep transition. Guard: skip while pending banner is up so we
  // don't yank focus away from Cancel/Change buttons.
  useEffect(() => {
    if (state.pendingChange) return
    if (state.activeStep === 'queue') queueSectionRef.current?.focusFirstRow()
    else if (state.activeStep === 'task') taskSectionRef.current?.focusFirstRow()
    else if (state.activeStep === 'worker') workerSectionRef.current?.focusFirstRow()
  }, [state.activeStep, state.pendingChange])

  const clearAllFilters = () => {
    setPriorityFilter([])
    setTaskStatusFilter([])
    setWorkerStatusFilter([])
  }
  const hasActiveFilters =
    priorityFilter.length > 0 || taskStatusFilter.length > 0 || workerStatusFilter.length > 0

  const getSectionVariant = (step: 'queue' | 'task' | 'worker'): 'disabled' | 'active' | 'filled' => {
    const filled = step === 'queue' ? state.queue : step === 'task' ? state.task : state.worker
    const lockedByUpstream = (step === 'task' && !state.queue) || (step === 'worker' && !state.task)
    if (lockedByUpstream) return 'disabled'
    if (filled) return 'filled'
    return 'active'
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-surface-display)]">
      <PageTitle
        title="Task Queue Visibility"
        subtitle="Stacked Assignment Flow — assign open tasks to eligible workers"
        actions={
          <div aria-live="polite">
            <DailyAssignmentsPopover assignments={state.assignments} />
          </div>
        }
      />

      <div className="flex flex-1 px-4 py-4">
        <FilterRail
          mode="all"
          step="queue"
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
          <StackedStepSection
            ref={queueSectionRef}
            index={1}
            heading="Select a Queue"
            variant={getSectionVariant('queue')}
            filledValue={state.queue?.name}
          >
            <QueueTable
              selectedQueueId={state.queue?.id}
              priorityFilter={priorityFilter}
              onPriorityFilterChange={setPriorityFilter}
              onSelect={builder.selectQueue}
            />
          </StackedStepSection>

          <StackedStepSection
            ref={taskSectionRef}
            index={2}
            heading="Select a Task"
            variant={getSectionVariant('task')}
            disabledHint="Pick a queue first."
            filledValue={state.task?.taskName}
          >
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
              <PlaceholderRows />
            )}
          </StackedStepSection>

          <StackedStepSection
            ref={workerSectionRef}
            index={3}
            heading="Select a Worker"
            variant={getSectionVariant('worker')}
            disabledHint="Pick a task first."
            filledValue={state.worker?.id}
          >
            {state.queue && state.task ? (
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
              <PlaceholderRows />
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
  )
}

export const dynamic = 'force-dynamic'
