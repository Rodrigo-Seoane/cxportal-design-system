'use client'

import { useEffect, useRef, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOpenInventoryStore, type ForceState } from '@/mocks/open-inventory/store'

const STATES: { value: ForceState; label: string; description: string }[] = [
  { value: 'data', label: 'Data', description: 'Happy path — mock dataset loaded' },
  { value: 'loading', label: 'Loading', description: 'All regions show skeletons' },
  { value: 'empty', label: 'Empty', description: 'Filter returns zero matches' },
  { value: 'error', label: 'Error', description: 'Inline error + stale values' },
  { value: 'partial', label: 'Partial data', description: 'KPI bands loaded; detail table loading' },
  { value: 'degraded', label: 'Degraded source', description: 'Upstream feed stale; banner shown' },
]

export function ForceStateTool() {
  const { forceState, setForceState } = useOpenInventoryStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        title="Dev tool — force page state"
        className="inline-flex items-center gap-1 rounded-sm border border-[var(--border-color-neutral-light)] bg-[var(--neutral-50)] px-2 py-1 text-xs font-semibold text-[var(--text-body-secondary)]"
      >
        <SlidersHorizontal className="size-3.5" aria-hidden="true" />
        State: {STATES.find(s => s.value === forceState)?.label}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-[60] min-w-60 overflow-hidden rounded-md border border-[var(--border-color-neutral-light)] bg-[var(--surface-section-bg)] shadow-lg">
          {STATES.map(s => (
            <button
              key={s.value}
              onClick={() => { setForceState(s.value); setOpen(false) }}
              className={cn(
                'block w-full border-b border-[var(--neutral-50)] px-3 py-2 text-left last:border-b-0',
                s.value === forceState ? 'bg-[var(--content-action-primary-100)]' : 'bg-transparent',
              )}
            >
              <div className={cn('text-sm text-[var(--text-body-primary)]', s.value === forceState ? 'font-semibold' : 'font-normal')}>
                {s.label}
              </div>
              <div className="mt-0.5 text-xs text-[var(--text-body-secondary)]">{s.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
