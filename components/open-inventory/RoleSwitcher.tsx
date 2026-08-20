'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOpenInventoryStore, type Role } from '@/mocks/open-inventory/store'

const ROLES: { value: Role; label: string; description: string }[] = [
  { value: 'executive', label: 'Executive', description: 'Enterprise/state risk, breach trends, capacity calls' },
  { value: 'operational', label: 'Operational', description: 'Drill by persona/LOB/state/PH-BH, stage bottlenecks' },
]

export function RoleSwitcher() {
  const { role, setRole } = useOpenInventoryStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = ROLES.find(r => r.value === role)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        title="Switch role — changes dashboard emphasis, not layout"
        className="inline-flex items-center gap-1 rounded-sm border border-[var(--border-color-neutral-light)] bg-[var(--warning-50)] px-2 py-1 text-xs font-semibold text-[var(--warning-600)]"
      >
        <UserRound className="size-3.5" aria-hidden="true" />
        {current?.label}
        <ChevronDown className="size-3" aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-[60] min-w-60 overflow-hidden rounded-md border border-[var(--border-color-neutral-light)] bg-[var(--surface-section-bg)] shadow-lg">
          {ROLES.map(r => (
            <button
              key={r.value}
              onClick={() => { setRole(r.value); setOpen(false) }}
              className={cn(
                'block w-full px-3 py-2 text-left',
                r.value === role ? 'bg-[var(--content-action-primary-100)]' : 'bg-transparent',
              )}
            >
              <div className={cn('text-sm text-[var(--text-body-primary)]', r.value === role ? 'font-semibold' : 'font-normal')}>
                {r.label}
              </div>
              <div className="mt-0.5 text-xs text-[var(--text-body-secondary)]">{r.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
