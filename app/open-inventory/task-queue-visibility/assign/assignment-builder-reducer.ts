// ── Pure state machine for the Guided Assignment Builder ────────────────────
// Kept framework-free (no React) so the queue → task → worker → assign flow,
// backtrack warnings, and confirmation banner are trivially unit-testable.
import type { AssignmentLogEntry, Queue, Task, Worker } from './_data'

export type BuilderStep = 'queue' | 'task' | 'worker'

export type PendingChange =
  | { step: 'queue'; queue: Queue }
  | { step: 'task'; task: Task }

export interface Confirmation {
  taskLabel: string
  workerId: string
}

export interface BuilderState {
  queue: Queue | null
  task: Task | null
  worker: Worker | null
  activeStep: BuilderStep
  pendingChange: PendingChange | null
  confirmation: Confirmation | null
  assignments: AssignmentLogEntry[]
}

export const initialBuilderState: BuilderState = {
  queue: null,
  task: null,
  worker: null,
  activeStep: 'queue',
  pendingChange: null,
  confirmation: null,
  assignments: [],
}

export type BuilderAction =
  | { type: 'SELECT_QUEUE'; queue: Queue }
  | { type: 'SELECT_TASK'; task: Task }
  | { type: 'SELECT_WORKER'; worker: Worker }
  | { type: 'ADVANCE_TO_WORKER' }
  | { type: 'CONFIRM_PENDING' }
  | { type: 'CANCEL_PENDING' }
  | { type: 'EDIT_STEP'; step: BuilderStep }
  | { type: 'ASSIGN'; entry: AssignmentLogEntry }
  | { type: 'DISMISS_CONFIRMATION' }

export function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
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
      return { ...state, task, activeStep: 'task' }
    }

    case 'SELECT_WORKER':
      return { ...state, worker: action.worker, activeStep: 'worker' }

    // Fired ~150ms after a fresh (non-reselect, non-pending) task pick.
    case 'ADVANCE_TO_WORKER':
      if (state.pendingChange || !state.task) return state
      return { ...state, activeStep: 'worker' }

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
