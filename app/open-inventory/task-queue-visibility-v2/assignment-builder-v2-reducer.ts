// ── Pure state machine for the v2 Stacked Assignment Builder ────────────────
// Fork of app/open-inventory/task-queue-visibility/assign/assignment-builder-
// reducer.ts. Two deliberate differences from v1:
//   1. No ADVANCE_TO_WORKER action — v2 has no auto-advance timer in its hook.
//   2. SELECT_TASK on a fresh (non-reselect, non-pending) pick sets
//      activeStep: 'worker' synchronously — v1 achieves this via a 150ms
//      setTimeout dispatching ADVANCE_TO_WORKER; v2 collapses it into the
//      reducer so focus jumps into the newly-active section immediately.
// activeStep is otherwise IDENTICAL to v1 but repurposed: in v1 it drove
// which single table renders; in v2 all three tables render always, and
// activeStep is a focus-target hint the page consumes via a useEffect.
import type { AssignmentLogEntry, Queue, Task, Worker } from '@/app/open-inventory/task-queue-visibility/assign/_data'

export type BuilderStepV2 = 'queue' | 'task' | 'worker'

export type PendingChangeV2 =
  | { step: 'queue'; queue: Queue }
  | { step: 'task'; task: Task }

export interface ConfirmationV2 {
  taskLabel: string
  workerId: string
}

export interface BuilderStateV2 {
  queue: Queue | null
  task: Task | null
  worker: Worker | null
  activeStep: BuilderStepV2
  pendingChange: PendingChangeV2 | null
  confirmation: ConfirmationV2 | null
  assignments: AssignmentLogEntry[]
}

export const initialBuilderV2State: BuilderStateV2 = {
  queue: null,
  task: null,
  worker: null,
  activeStep: 'queue',
  pendingChange: null,
  confirmation: null,
  assignments: [],
}

export type BuilderActionV2 =
  | { type: 'SELECT_QUEUE'; queue: Queue }
  | { type: 'SELECT_TASK'; task: Task }
  | { type: 'SELECT_WORKER'; worker: Worker }
  | { type: 'CONFIRM_PENDING' }
  | { type: 'CANCEL_PENDING' }
  | { type: 'EDIT_STEP'; step: BuilderStepV2 }
  | { type: 'ASSIGN'; entry: AssignmentLogEntry }
  | { type: 'DISMISS_CONFIRMATION' }

export function builderV2Reducer(state: BuilderStateV2, action: BuilderActionV2): BuilderStateV2 {
  switch (action.type) {
    case 'SELECT_QUEUE': {
      const { queue } = action
      if (state.queue?.id === queue.id) {
        return { ...state, activeStep: state.task ? (state.worker ? 'worker' : 'task') : 'task' }
      }
      // Downstream picks exist — confirm before clearing them.
      if (state.task || state.worker) return { ...state, pendingChange: { step: 'queue', queue } }
      return { ...state, queue, activeStep: 'task' }
    }

    case 'SELECT_TASK': {
      const { task } = action
      if (state.task?.id === task.id) {
        return { ...state, activeStep: state.worker ? 'worker' : 'task' }
      }
      if (state.worker) return { ...state, pendingChange: { step: 'task', task } }
      // v2: advance activeStep synchronously (v1 uses a 150ms setTimeout + ADVANCE_TO_WORKER).
      return { ...state, task, activeStep: 'worker' }
    }

    case 'SELECT_WORKER':
      return { ...state, worker: action.worker, activeStep: 'worker' }

    case 'CONFIRM_PENDING': {
      const { pendingChange } = state
      if (!pendingChange) return state
      if (pendingChange.step === 'queue') {
        return { ...state, queue: pendingChange.queue, task: null, worker: null, pendingChange: null, activeStep: 'task' }
      }
      return { ...state, task: pendingChange.task, worker: null, pendingChange: null, activeStep: 'worker' }
    }

    case 'CANCEL_PENDING':
      return { ...state, pendingChange: null }

    case 'EDIT_STEP':
      return { ...state, activeStep: action.step, pendingChange: null }

    case 'ASSIGN': {
      if (!state.queue || !state.task || !state.worker) return state
      return {
        ...state,
        task: null,
        worker: null,
        activeStep: 'task',
        confirmation: { taskLabel: state.task.taskName, workerId: state.worker.id },
        assignments: [action.entry, ...state.assignments],
      }
    }

    case 'DISMISS_CONFIRMATION':
      return { ...state, confirmation: null }

    default:
      return state
  }
}
