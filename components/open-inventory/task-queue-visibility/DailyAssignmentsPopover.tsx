'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ClipboardTextIcon } from '@phosphor-icons/react'
import type { AssignmentLogEntry } from '@/app/open-inventory/task-queue-visibility/assign/_data'

export interface DailyAssignmentsPopoverProps {
  assignments: AssignmentLogEntry[]
}

/**
 * The Page Title's "Inline Context Data" slot — a "N assigned today" trigger
 * that opens a lightweight popover listing today's in-memory assignment log.
 */
export function DailyAssignmentsPopover({ assignments }: DailyAssignmentsPopoverProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!open || !triggerRef.current) return
    setRect(triggerRef.current.getBoundingClientRect())
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const panel = open && rect && mounted ? createPortal(
    <div
      className="fixed z-[9999] w-72 overflow-hidden rounded-md border border-[var(--border-color-neutral-light)] bg-[var(--surface-section-bg)] shadow-lg"
      style={{ top: rect.bottom + 4, right: window.innerWidth - rect.right }}
    >
      <div className="border-b border-[var(--border-color-neutral-light)] px-3 py-2">
        <p className="text-sm font-semibold text-[var(--text-body-primary)]">Today&rsquo;s assignments</p>
      </div>
      <div className="max-h-72 overflow-y-auto">
        {assignments.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-[var(--text-body-secondary)]">No assignments yet today.</p>
        ) : (
          assignments.map(a => (
            <div key={a.id} className="flex flex-col gap-0.5 border-b border-[var(--border-color-neutral-light)] px-3 py-2 last:border-b-0">
              <span className="text-xs font-medium text-[var(--text-body-primary)]">{a.taskLabel} → {a.workerId}</span>
              <span className="text-[11px] text-[var(--text-body-secondary)]">{a.queueName} · {a.timestamp}</span>
            </div>
          ))
        )}
      </div>
    </div>,
    document.body,
  ) : null

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-semibold text-[var(--text-body-secondary)] transition-colors hover:bg-[var(--content-action-primary-100)] hover:text-[var(--text-action)]"
      >
        <ClipboardTextIcon size={14} aria-hidden="true" />
        {assignments.length} assigned today
      </button>
      {panel}
    </>
  )
}
