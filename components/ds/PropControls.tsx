'use client'

import type { PropSchema, PropValues } from '@/lib/component-registry'

interface PropControlsProps {
  schema: PropSchema
  values: PropValues
  onChange: (key: string, value: string | boolean) => void
}

export function PropControls({ schema, values, onChange }: PropControlsProps) {
  const entries = Object.entries(schema)

  return (
    <div
      className="flex flex-wrap gap-x-6 gap-y-4 px-5 py-4 rounded-lg border"
      style={{
        backgroundColor: 'var(--color-surface-section)',
        borderColor: 'var(--color-border)',
      }}
    >
      {entries.map(([key, ctrl]) => {
        const value = values[key]

        // ── Chip Select — visual pill buttons ──────────────────────────
        if (ctrl.type === 'chip-select') {
          return (
            <label key={key} className="flex flex-col gap-1.5">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {ctrl.label}
              </span>
              <div className="flex flex-wrap gap-1">
                {ctrl.options.map((opt) => {
                  const active = value === opt
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => onChange(key, opt)}
                      className="px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
                      style={{
                        backgroundColor: active
                          ? 'var(--color-primary)'
                          : 'var(--color-surface-display)',
                        color: active ? '#ffffff' : 'var(--color-text-primary)',
                        border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      }}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            </label>
          )
        }

        // ── Select — dropdown ──────────────────────────────────────────
        if (ctrl.type === 'select') {
          return (
            <label key={key} className="flex flex-col gap-1.5 min-w-[120px]">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {ctrl.label}
              </span>
              <select
                value={value as string}
                onChange={(e) => onChange(key, e.target.value)}
                className="text-sm rounded-md border px-2.5 py-1.5 outline-none cursor-pointer"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-surface-form-field)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {ctrl.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          )
        }

        // ── Boolean — toggle switch ────────────────────────────────────
        if (ctrl.type === 'boolean') {
          return (
            <label key={key} className="flex flex-col gap-1.5">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {ctrl.label}
              </span>
              <button
                role="switch"
                aria-checked={value as boolean}
                onClick={() => onChange(key, !(value as boolean))}
                className="w-10 h-5 rounded-full transition-colors flex items-center px-0.5 cursor-pointer"
                style={{
                  backgroundColor: value
                    ? 'var(--color-primary)'
                    : 'var(--color-border)',
                }}
              >
                <span
                  className="w-4 h-4 rounded-full bg-white transition-transform shadow-sm"
                  style={{
                    transform: value ? 'translateX(20px)' : 'translateX(0)',
                  }}
                />
              </button>
            </label>
          )
        }

        // ── Text — input ───────────────────────────────────────────────
        if (ctrl.type === 'text') {
          return (
            <label key={key} className="flex flex-col gap-1.5 min-w-[160px]">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {ctrl.label}
              </span>
              <input
                type="text"
                value={value as string}
                onChange={(e) => onChange(key, e.target.value)}
                className="text-sm rounded-md border px-2.5 py-1.5 outline-none"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-surface-form-field)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </label>
          )
        }

        return null
      })}
    </div>
  )
}
