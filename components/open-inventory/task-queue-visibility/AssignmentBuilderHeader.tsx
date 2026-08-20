'use client'

import { useEffect } from 'react'
import { WarningIcon, ChecksIcon, XIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { BuilderSlot, type SlotVariant } from './BuilderSlot'
import type { BuilderState, BuilderStep } from '@/app/open-inventory/task-queue-visibility/assign/assignment-builder-reducer'

// Banner colors mirror components/ui/message-box.tsx's warning/success tokens.
// MessageBox itself only supports a single message + dismiss (no inline
// action buttons), which this banner needs — so these are hand-built divs
// on the same DS color tokens rather than a fork of that component.
const BANNER = {
  warning: { bg: '#fdf8ef', border: '#f7ddb1', icon: '#c97000' },
  success: { bg: '#f3fbee', border: '#b5e89c', icon: '#4b9924' },
} as const

function slotVariant(step: BuilderStep, state: BuilderState): SlotVariant {
  const filled = step === 'queue' ? state.queue : step === 'task' ? state.task : state.worker
  const lockedByUpstream = (step === 'task' && !state.queue) || (step === 'worker' && !state.task)
  if (lockedByUpstream) return 'disabled'
  if (state.activeStep === step) return 'active'
  return filled ? 'filled' : 'empty'
}

export interface AssignmentBuilderHeaderProps {
  state: BuilderState
  onEditStep: (step: BuilderStep) => void
  onAssign: () => void
  onConfirmPending: () => void
  onCancelPending: () => void
  onDismissConfirmation: () => void
}

export function AssignmentBuilderHeader({
  state, onEditStep, onAssign, onConfirmPending, onCancelPending, onDismissConfirmation,
}: AssignmentBuilderHeaderProps) {
  const canAssign = !!(state.queue && state.task && state.worker) && !state.pendingChange

  // Cmd/Ctrl+Enter fires Assign from anywhere on the page while it's enabled.
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

  return (
    <div className="flex flex-col gap-3 border-b border-[var(--border-color-neutral-light)] bg-[var(--surface-section-bg)] px-4 py-3">
      <div className="flex items-center gap-2">
        <BuilderSlot
          index={1}
          placeholder="Pick a queue"
          value={state.queue?.name}
          variant={slotVariant('queue', state)}
          onEdit={state.queue ? () => onEditStep('queue') : undefined}
        />
        <BuilderSlot
          index={2}
          placeholder="Pick a task"
          value={state.task?.taskName}
          variant={slotVariant('task', state)}
          disabledReason="Pick a queue first"
          onEdit={state.task ? () => onEditStep('task') : undefined}
        />
        <BuilderSlot
          index={3}
          placeholder="Pick a worker"
          value={state.worker?.id}
          variant={slotVariant('worker', state)}
          disabledReason="Pick a task first"
          onEdit={state.worker ? () => onEditStep('worker') : undefined}
        />
        <Button variant="primary" size="sm" disabled={!canAssign} onClick={onAssign} className="ml-2 shrink-0">
          Assign
        </Button>
      </div>

      {state.pendingChange && (
        <div
          className="flex items-center gap-3 rounded-md border px-3 py-2"
          style={{ background: BANNER.warning.bg, borderColor: BANNER.warning.border }}
          role="alert"
        >
          <WarningIcon size={18} weight="regular" color={BANNER.warning.icon} aria-hidden="true" />
          <p className="flex-1 text-sm text-[var(--text-body-primary)]">
            {state.pendingChange.step === 'queue'
              ? `Changing the queue will clear ${state.task?.taskName ?? 'the selected task'}${state.worker ? ` and ${state.worker.id}` : ''}.`
              : `Changing the task will clear ${state.worker?.id ?? 'the selected worker'}.`}
          </p>
          <Button variant="secondary" size="xs" onClick={onCancelPending}>Cancel</Button>
          <Button variant="primary" size="xs" onClick={onConfirmPending}>
            {state.pendingChange.step === 'queue' ? 'Change queue' : 'Change task'}
          </Button>
        </div>
      )}

      {state.confirmation && !state.pendingChange && (
        <div
          className="flex items-center gap-3 rounded-md border px-3 py-2"
          style={{ background: BANNER.success.bg, borderColor: BANNER.success.border }}
          role="status"
        >
          <ChecksIcon size={18} weight="regular" color={BANNER.success.icon} aria-hidden="true" />
          <p className="flex-1 text-sm text-[var(--text-body-primary)]">
            {state.confirmation.taskLabel} assigned to {state.confirmation.workerId}.
          </p>
          <Button variant="secondary" size="xs" onClick={onDismissConfirmation}>Assign another</Button>
          <button
            type="button"
            onClick={onDismissConfirmation}
            aria-label="Dismiss"
            className="flex shrink-0 items-center text-[var(--text-body-secondary)] hover:text-[var(--text-body-primary)]"
          >
            <XIcon size={16} weight="regular" />
          </button>
        </div>
      )}
    </div>
  )
}
