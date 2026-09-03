'use client'

import { useEffect } from 'react'
import { ChecksIcon, WarningIcon, XIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { BuilderSlot, type SlotVariant } from '@/components/open-inventory/task-queue-visibility/BuilderSlot'
import type { BuilderStateV2, BuilderStepV2 } from './assignment-builder-v2-reducer'

// Banner colors mirror components/ui/message-box.tsx's warning/success tokens,
// same as v1's AssignmentBuilderHeader — MessageBox itself does not accept
// inline action buttons, which this bar needs.
const BANNER = {
  warning: { bg: 'var(--surface-accent-warning-light)', border: 'var(--border-color-accent-warning-light)', icon: 'var(--warning-600)' },
  success: { bg: 'var(--surface-accent-success-light)', border: 'var(--border-color-accent-success-light)', icon: 'var(--surface-accent-success-dark)' },
} as const

function slotVariant(step: BuilderStepV2, state: BuilderStateV2): SlotVariant {
  const filled = step === 'queue' ? state.queue : step === 'task' ? state.task : state.worker
  const lockedByUpstream = (step === 'task' && !state.queue) || (step === 'worker' && !state.task)
  if (lockedByUpstream) return 'disabled'
  if (state.activeStep === step) return 'active'
  return filled ? 'filled' : 'empty'
}

export interface StickyActionBarProps {
  state: BuilderStateV2
  onEditStep: (step: BuilderStepV2) => void
  onAssign: () => void
  onConfirmPending: () => void
  onCancelPending: () => void
  onDismissConfirmation: () => void
}

export function StickyActionBar({
  state, onEditStep, onAssign, onConfirmPending, onCancelPending, onDismissConfirmation,
}: StickyActionBarProps) {
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

  // Esc dismisses the pending-change banner (new to v2; v1 does not bind Esc).
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

  const showSuccess = !!state.confirmation && !state.pendingChange

  return (
    <div
      className="sticky bottom-0 z-30 flex flex-col gap-2 border-t border-[var(--border-color-neutral-light)] bg-[var(--surface-section-bg)] px-4 py-3"
    >
      {state.pendingChange && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-md border px-3 py-2"
          style={{ background: BANNER.warning.bg, borderColor: BANNER.warning.border }}
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

      {showSuccess && state.confirmation && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-md border px-3 py-2"
          style={{ background: BANNER.success.bg, borderColor: BANNER.success.border }}
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
    </div>
  )
}
