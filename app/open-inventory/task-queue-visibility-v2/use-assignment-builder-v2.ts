'use client'

import { useCallback, useReducer } from 'react'
import type { Queue, Task, Worker } from '@/app/open-inventory/task-queue-visibility/assign/_data'
import {
  builderV2Reducer,
  initialBuilderV2State,
  type BuilderStateV2,
  type BuilderStepV2,
} from './assignment-builder-v2-reducer'

// Fork of app/open-inventory/task-queue-visibility/assign/use-assignment-
// builder.ts. Deliberate difference from v1: NO setTimeout auto-advance —
// v2's reducer handles the SELECT_TASK → activeStep='worker' advance
// synchronously, so this hook is a straight useReducer + useCallback wrapper.

export interface UseAssignmentBuilderV2Return {
  state: BuilderStateV2
  selectQueue: (q: Queue) => void
  selectTask: (t: Task) => void
  selectWorker: (w: Worker) => void
  editStep: (step: BuilderStepV2) => void
  assign: () => void
  confirmPending: () => void
  cancelPending: () => void
  dismissConfirmation: () => void
}

export function useAssignmentBuilderV2(): UseAssignmentBuilderV2Return {
  const [state, dispatch] = useReducer(builderV2Reducer, initialBuilderV2State)

  const selectQueue = useCallback((queue: Queue) => dispatch({ type: 'SELECT_QUEUE', queue }), [])
  const selectTask = useCallback((task: Task) => dispatch({ type: 'SELECT_TASK', task }), [])
  const selectWorker = useCallback((worker: Worker) => dispatch({ type: 'SELECT_WORKER', worker }), [])
  const editStep = useCallback((step: BuilderStepV2) => dispatch({ type: 'EDIT_STEP', step }), [])
  const confirmPending = useCallback(() => dispatch({ type: 'CONFIRM_PENDING' }), [])
  const cancelPending = useCallback(() => dispatch({ type: 'CANCEL_PENDING' }), [])
  const dismissConfirmation = useCallback(() => dispatch({ type: 'DISMISS_CONFIRMATION' }), [])

  const assign = useCallback(() => {
    if (!state.queue || !state.task || !state.worker) return
    dispatch({
      type: 'ASSIGN',
      entry: {
        id: `${state.task.id}-${state.assignments.length}`,
        taskLabel: state.task.taskName,
        queueName: state.queue.name,
        workerId: state.worker.id,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      },
    })
  }, [state.queue, state.task, state.worker, state.assignments.length])

  return { state, selectQueue, selectTask, selectWorker, editStep, assign, confirmPending, cancelPending, dismissConfirmation }
}
