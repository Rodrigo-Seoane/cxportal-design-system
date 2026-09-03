'use client'

import { useState } from 'react'
import type { TimeOffEntry } from '@/mocks/wfm/store'

// Horizontal day-box heat strip showing approved time-off within the selected range.

interface Props {
  timeOff: TimeOffEntry[]
  from: string
  to: string
}

const TYPE_COLORS: Record<TimeOffEntry['type'], { bg: string; text: string }> = {
  Vacation: { bg: 'var(--info-100)', text: 'var(--content-action-primary-700)' },
  Sick:     { bg: 'var(--error-50)', text: 'var(--text-destructive)' },
  FMLA:     { bg: 'var(--warning-100)', text: 'var(--text-warning)' },
  Personal: { bg: 'var(--content-action-primary-100)', text: 'var(--content-action-primary-700)' },
}

function daysInRange(from: string, to: string): string[] {
  const out: string[] = []
  const cur = new Date(from + 'T00:00:00')
  const end = new Date(to + 'T00:00:00')
  while (cur <= end) {
    out.push(cur.toISOString().split('T')[0])
    cur.setDate(cur.getDate() + 1)
  }
  return out
}

function fmtDay(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function TimeOffStrip({ timeOff, from, to }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)
  const days = daysInRange(from, to)

  const byDate: Record<string, TimeOffEntry> = {}
  timeOff.forEach(t => { byDate[t.date] = t })

  // Limit display to 90 days; if range is larger, show a summary instead
  if (days.length > 90) {
    const approvedCount = timeOff.filter(t => t.status === 'approved').length
    return (
      <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-body-secondary)', fontFamily: 'var(--font-sans)' }}>
        {approvedCount > 0
          ? `${approvedCount} approved time-off day${approvedCount > 1 ? 's' : ''} in this period — narrow range to see day-by-day view`
          : 'No approved time off in this period'}
      </div>
    )
  }

  const hasAny = timeOff.length > 0

  return (
    <div style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, fontSize: 11, color: 'var(--text-body-secondary)' }}>
        {(Object.keys(TYPE_COLORS) as TimeOffEntry['type'][]).map(type => (
          <span key={type} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: TYPE_COLORS[type].bg, border: `1px solid ${TYPE_COLORS[type].text}30`, display: 'inline-block' }} />
            {type}
          </span>
        ))}
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--neutral-100)', display: 'inline-block' }} />
          Worked
        </span>
      </div>

      {!hasAny ? (
        <div style={{ padding: '16px 0', fontSize: 13, color: 'var(--text-body-secondary)' }}>
          No time off in this period
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Day boxes */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {days.map(date => {
              const entry = byDate[date]
              const color = entry ? TYPE_COLORS[entry.type] : null
              return (
                <div
                  key={date}
                  onMouseEnter={() => setHovered(date)}
                  onMouseLeave={() => setHovered(null)}
                  title={entry ? `${fmtDay(date)} — ${entry.type} (${entry.status})` : fmtDay(date)}
                  style={{
                    width: 14, height: 14, borderRadius: 2,
                    background: color ? color.bg : 'var(--neutral-100)',
                    border: `1px solid ${color ? color.text + '40' : 'var(--neutral-200)'}`,
                    cursor: entry ? 'pointer' : 'default',
                    flexShrink: 0,
                    transition: 'opacity 80ms',
                    opacity: hovered && hovered !== date ? 0.5 : 1,
                  }}
                  aria-label={entry ? `${fmtDay(date)}: ${entry.type} (${entry.status})` : fmtDay(date)}
                />
              )
            })}
          </div>

          {/* Hover tooltip */}
          {hovered && byDate[hovered] && (
            <div style={{
              position: 'absolute', bottom: 'calc(100% + 6px)', left: 0,
              background: 'var(--text-body-primary)', color: 'var(--neutral-0)', borderRadius: 6,
              padding: '6px 10px', fontSize: 12, pointerEvents: 'none', zIndex: 100,
              whiteSpace: 'nowrap',
            }}>
              {fmtDay(hovered)} — <strong>{byDate[hovered].type}</strong> · {byDate[hovered].status}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
