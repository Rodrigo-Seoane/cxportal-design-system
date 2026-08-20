/**
 * Guided Assignment Builder — Task Queue Visibility (CxPortal WFM)
 * ─────────────────────────────────────────────────────────────────────────
 * Figma reference (source of truth for tokens/components/styles — NOT for
 * layout, which this screen replaces):
 * https://www.figma.com/design/54ARm4erwwo8sI5rp2MQAq/WFM?node-id=519-85755&m=dev
 *
 * Flow: replaces the old three-stacked-tables screen with a single-focus
 * builder. A persistent header holds three numbered slots — ① Queue →
 * ② Task → ③ Worker — plus the primary Assign button. Only ONE table is
 * shown at a time (Queues / Tasks / Workers), matching whichever slot is
 * currently being filled; the 240px left filter rail's facets swap with it.
 *
 * State machine lives in `assignment-builder-reducer.ts` (pure, framework-
 * free) driven by the `useAssignmentBuilder` hook:
 *   - Picking a queue advances to Task. Picking a task auto-advances to
 *     Worker after 150ms. Picking a worker just enables Assign (no auto-fire).
 *   - Assign pushes an entry to the in-memory daily log, resets Task/Worker
 *     (Queue is preserved), and shows an inline success strip.
 *   - Editing a filled slot with downstream picks shows an inline warning
 *     before clearing them (see AssignmentBuilderHeader).
 *
 * Keyboard: Cmd/Ctrl+Enter fires Assign when enabled (wired in
 * AssignmentBuilderHeader). Table rows use native radio/row semantics for
 * arrow-key + Enter/Space selection.
 */
'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PageTitle } from '@/components/ui/page-title'
import { AssignmentBuilderHeader } from '@/components/open-inventory/task-queue-visibility/AssignmentBuilderHeader'
import { FilterRail } from '@/components/open-inventory/task-queue-visibility/FilterRail'
import { QueueTable } from '@/components/open-inventory/task-queue-visibility/QueueTable'
import { TaskTable } from '@/components/open-inventory/task-queue-visibility/TaskTable'
import { WorkerTable } from '@/components/open-inventory/task-queue-visibility/WorkerTable'
import { DailyAssignmentsPopover } from '@/components/open-inventory/task-queue-visibility/DailyAssignmentsPopover'
import { useAssignmentBuilder } from './use-assignment-builder'
import type { Priority, TaskStatus, WorkerStatus } from './_data'

const FADE_SLIDE = {
  initial: { opacity: 0, x: 8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -8 },
}

export default function TaskQueueVisibilityAssignPage() {
  const builder = useAssignmentBuilder()
  const { state } = builder

  const [priorityFilter, setPriorityFilter] = useState<Priority[]>([])
  const [taskStatusFilter, setTaskStatusFilter] = useState<TaskStatus[]>([])
  const [workerStatusFilter, setWorkerStatusFilter] = useState<WorkerStatus[]>([])

  const clearActiveStepFilters = () => {
    if (state.activeStep === 'queue') setPriorityFilter([])
    else if (state.activeStep === 'task') setTaskStatusFilter([])
    else setWorkerStatusFilter([])
  }
  const hasActiveFilters =
    state.activeStep === 'queue' ? priorityFilter.length > 0
    : state.activeStep === 'task' ? taskStatusFilter.length > 0
    : workerStatusFilter.length > 0

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-surface-display)]">
      <PageTitle
        title="Task Queue Visibility"
        subtitle="Guided Assignment Builder — assign open tasks to eligible workers"
        actions={<DailyAssignmentsPopover assignments={state.assignments} />}
      />

      <AssignmentBuilderHeader
        state={state}
        onEditStep={builder.editStep}
        onAssign={builder.assign}
        onConfirmPending={builder.confirmPending}
        onCancelPending={builder.cancelPending}
        onDismissConfirmation={builder.dismissConfirmation}
      />

      <div className="flex flex-1 px-4 py-4">
        <FilterRail
          step={state.activeStep}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          taskStatusFilter={taskStatusFilter}
          onTaskStatusFilterChange={setTaskStatusFilter}
          workerStatusFilter={workerStatusFilter}
          onWorkerStatusFilterChange={setWorkerStatusFilter}
          onClearAll={clearActiveStepFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <div className="min-h-[700px] flex-1 rounded-md border border-[var(--border-color-neutral-light)] bg-[var(--surface-section-bg)]">
          <AnimatePresence mode="wait">
            {state.activeStep === 'queue' && (
              <motion.div key="queue" {...FADE_SLIDE} transition={{ duration: 0.15 }} className="h-full">
                <QueueTable
                  selectedQueueId={state.queue?.id}
                  priorityFilter={priorityFilter}
                  onPriorityFilterChange={setPriorityFilter}
                  onSelect={builder.selectQueue}
                />
              </motion.div>
            )}

            {state.activeStep === 'task' && state.queue && (
              <motion.div key="task" {...FADE_SLIDE} transition={{ duration: 0.15 }} className="h-full">
                <TaskTable
                  queue={state.queue}
                  selectedTaskId={state.task?.id}
                  statusFilter={taskStatusFilter}
                  onStatusFilterChange={setTaskStatusFilter}
                  onSelect={builder.selectTask}
                  onPickDifferentQueue={() => builder.editStep('queue')}
                />
              </motion.div>
            )}

            {state.activeStep === 'worker' && state.task && state.queue && (
              <motion.div key="worker" {...FADE_SLIDE} transition={{ duration: 0.15 }} className="h-full">
                <WorkerTable
                  task={state.task}
                  queueName={state.queue.name}
                  selectedWorkerId={state.worker?.id}
                  statusFilter={workerStatusFilter}
                  onStatusFilterChange={setWorkerStatusFilter}
                  onSelect={builder.selectWorker}
                  onPickDifferentTask={() => builder.editStep('task')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
