'use client'

import { useCallback, useEffect, useReducer, useRef } from 'react'
import { builderReducer, initialBuilderState, type BuilderStep } from './assignment-builder-reducer'
import type { Queue, Task, Worker } from './_data'

// Long enough for the operator to register their own click before the view
// swaps to the Worker step (spec: "auto-advance after a 150ms delay").
const AUTO_ADVANCE_MS = 150

export function useAssignmentBuilder() {
  const [state, dispatch] = useReducer(builderReducer, initialBuilderState)
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
  }, [])

  const selectQueue = useCallback((queue: Queue) => dispatch({ type: 'SELECT_QUEUE', queue }), [])

  const selectTask = useCallback((task: Task) => {
    dispatch({ type: 'SELECT_TASK', task })
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
    advanceTimer.current = setTimeout(() => dispatch({ type: 'ADVANCE_TO_WORKER' }), AUTO_ADVANCE_MS)
  }, [])

  const selectWorker = useCallback((worker: Worker) => dispatch({ type: 'SELECT_WORKER', worker }), [])
  const confirmPending = useCallback(() => dispatch({ type: 'CONFIRM_PENDING' }), [])
  const cancelPending = useCallback(() => dispatch({ type: 'CANCEL_PENDING' }), [])
  const editStep = useCallback((step: BuilderStep) => dispatch({ type: 'EDIT_STEP', step }), [])
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

  return {
    state, selectQueue, selectTask, selectWorker,
    confirmPending, cancelPending, editStep, assign, dismissConfirmation,
  }
}
