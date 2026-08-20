'use client'

import { useState, useId } from 'react'
import { SlidersIcon, CaretDownIcon, CheckIcon } from '@phosphor-icons/react'
import { Chip } from '@/components/ui/chip'
import { StatusDot } from './StatusDot'
import type { BuilderStep } from '@/app/open-inventory/task-queue-visibility/assign/assignment-builder-reducer'
import { PRIORITY_COLOR, WORKER_STATUS_COLOR, type Priority, type TaskStatus, type WorkerStatus } from '@/app/open-inventory/task-queue-visibility/assign/_data'

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'red', label: 'High' }, { value: 'yellow', label: 'Medium' }, { value: 'green', label: 'Low' },
]
const TASK_STATUS_OPTIONS: TaskStatus[] = ['Unassigned', 'Active', 'Pended']
const WORKER_STATUS_OPTIONS: WorkerStatus[] = ['Available', 'On Call', 'Break', 'Logged Off']

// ── Generic collapsible checkbox facet — mirrors components/access-management/UserFilters.tsx ──
// A hand-built checkbox row (not components/ui/checkbox.tsx's <Checkbox>) is
// used here: that component only accepts a plain string label, and this rail
// needs a colored status/priority dot beside the text. Visual tokens (12px
// box, #4285f4 checked fill, #689df6 border) are copied 1:1 from Checkbox's
// own "small" size so it stays visually identical to the real component.

interface FilterOption<T extends string> {
  value: T
  label: string
  dotColor?: string
}

function FilterGroup<T extends string>({
  label, options, selected, onChange,
}: {
  label: string
  options: FilterOption<T>[]
  selected: T[]
  onChange: (v: T[]) => void
}) {
  const [open, setOpen] = useState(true)
  const groupId = useId()
  const toggle = (v: T) => onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v])

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%', height: 36,
          padding: 8, border: `1px solid ${selected.length ? '#0ea2a7' : '#eff1f3'}`,
          borderRadius: 8, background: '#ffffff', cursor: 'pointer',
        }}
      >
        {selected.length > 0 && (
          <span style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 18, height: 18, borderRadius: 64, background: '#0b8286',
            border: '1px solid #0ea2a7', color: '#eff1f3', fontSize: 10, fontWeight: 600,
          }}>
            {selected.length}
          </span>
        )}
        <span style={{ flex: 1, textAlign: 'left', fontSize: 12, fontWeight: 600, letterSpacing: '0.24px', color: '#021920' }}>
          {label}
        </span>
        <CaretDownIcon size={16} color="#021920" weight="regular" style={{ transform: open ? 'rotate(180deg)' : undefined }} />
      </button>

      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 8px 0' }}>
          {options.map(opt => {
            const checked = selected.includes(opt.value)
            const inputId = `${groupId}-${opt.value}`
            return (
              <label key={opt.value} htmlFor={inputId} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  id={inputId}
                  checked={checked}
                  onChange={() => toggle(opt.value)}
                  style={{ position: 'absolute', opacity: 0, width: 1, height: 1, overflow: 'hidden' }}
                />
                <span
                  aria-hidden="true"
                  style={{
                    width: 12, height: 12, flexShrink: 0, borderRadius: 2,
                    background: checked ? '#4285f4' : '#ffffff',
                    border: `1px solid ${checked ? '#689df6' : '#eff1f3'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {checked && <CheckIcon size={8} color="white" weight="bold" />}
                </span>
                {opt.dotColor && <StatusDot color={opt.dotColor} />}
                <span style={{ fontSize: 14, color: '#021920' }}>{opt.label}</span>
              </label>
            )
          })}
        </div>
      )}

      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {selected.map(v => {
            const opt = options.find(o => o.value === v)
            return (
              <Chip key={v} label={opt?.label ?? v} type="info" shade={200} iconLeft={false} onDismiss={() => toggle(v)} style={{ background: '#d9dce0' }} />
            )
          })}
        </div>
      )}
    </div>
  )
}

export interface FilterRailProps {
  step: BuilderStep
  priorityFilter: Priority[]
  onPriorityFilterChange: (v: Priority[]) => void
  taskStatusFilter: TaskStatus[]
  onTaskStatusFilterChange: (v: TaskStatus[]) => void
  workerStatusFilter: WorkerStatus[]
  onWorkerStatusFilterChange: (v: WorkerStatus[]) => void
  onClearAll: () => void
  hasActiveFilters: boolean
}

/**
 * 240px left rail whose facets swap with the active step — matches the
 * Access Management "Table Filter" left-rail pattern (UserFilters.tsx /
 * RoleFilters.tsx) referenced by the Figma source of truth.
 */
export function FilterRail({
  step, priorityFilter, onPriorityFilterChange, taskStatusFilter, onTaskStatusFilterChange,
  workerStatusFilter, onWorkerStatusFilterChange, onClearAll, hasActiveFilters,
}: FilterRailProps) {
  return (
    <div style={{ width: 240, flexShrink: 0, padding: '16px 16px 16px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, border: '1px solid #0ea2a7', borderRadius: 4 }}>
            <SlidersIcon size={16} color="#0ea2a7" weight="regular" />
          </span>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 400, lineHeight: '24px', color: '#021920' }}>Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: 10, fontWeight: 600, letterSpacing: '0.2px', color: '#0b8286' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {step === 'queue' && (
        <FilterGroup
          label="Priority"
          options={PRIORITY_OPTIONS.map(o => ({ value: o.value, label: o.label, dotColor: PRIORITY_COLOR[o.value] }))}
          selected={priorityFilter}
          onChange={onPriorityFilterChange}
        />
      )}

      {step === 'task' && (
        <FilterGroup
          label="Status"
          options={TASK_STATUS_OPTIONS.map(v => ({ value: v, label: v }))}
          selected={taskStatusFilter}
          onChange={onTaskStatusFilterChange}
        />
      )}

      {step === 'worker' && (
        <FilterGroup
          label="Status"
          options={WORKER_STATUS_OPTIONS.map(v => ({ value: v, label: v, dotColor: WORKER_STATUS_COLOR[v] }))}
          selected={workerStatusFilter}
          onChange={onWorkerStatusFilterChange}
        />
      )}
    </div>
  )
}
