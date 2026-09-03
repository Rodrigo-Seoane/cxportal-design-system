'use client'

import { CheckCircleIcon, ClockIcon, FileIcon, WarningIcon } from '@phosphor-icons/react'
import { DrillOutLink } from '@/components/wfm/DrillOutLink'
import type { WeekReadiness, ScheduleStatus } from '@/mocks/wfm/rollup'

interface Props {
  weeks: WeekReadiness[]
  scopeId: string
}

const STATUS_CONFIG: Record<ScheduleStatus, {
  label: string
  icon: React.ReactNode
  bg: string
  border: string
  text: string
}> = {
  published: {
    label: 'Published',
    icon: <CheckCircleIcon size={14} weight="fill" aria-hidden="true" />,
    bg: 'var(--success-100)', border: 'var(--surface-accent-success-dark)', text: 'var(--success-600)',
  },
  reviewed: {
    label: 'Reviewed',
    icon: <ClockIcon size={14} weight="regular" aria-hidden="true" />,
    bg: 'var(--warning-100)', border: 'var(--text-warning)', text: 'var(--text-warning)',
  },
  generated: {
    label: 'Generated',
    icon: <FileIcon size={14} weight="regular" aria-hidden="true" />,
    bg: 'var(--warning-100)', border: 'var(--text-warning)', text: 'var(--text-warning)',
  },
  'not-started': {
    label: 'Not Started',
    icon: <WarningIcon size={14} weight="fill" aria-hidden="true" />,
    bg: 'var(--error-50)', border: 'var(--text-error)', text: 'var(--text-destructive)',
  },
}

// "Not Started" within 2 weeks is higher urgency
function isUrgent(weekIdx: number, status: ScheduleStatus): boolean {
  return status === 'not-started' && weekIdx < 2
}

export function ScheduleReadinessPanel({ weeks, scopeId }: Props) {
  const notStartedCount = weeks.filter(w => w.status === 'not-started').length
  const firstEight = weeks.slice(0, 8)
  const notStartedInFirst8 = firstEight.filter(w => w.status === 'not-started').length

  return (
    <div style={{ background: 'var(--neutral-0)', borderRadius: 8, border: '1px solid var(--neutral-100)', overflow: 'hidden', fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: '1px solid var(--neutral-100)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-body-primary)' }}>
            Schedule Publication Readiness
          </span>
          {notStartedInFirst8 > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 10px', borderRadius: 64, fontSize: 12, fontWeight: 600,
              background: 'var(--warning-100)', color: 'var(--text-warning)', border: '1px solid var(--border-color-accent-warning-light)',
            }}>
              <WarningIcon size={12} weight="fill" aria-hidden="true" />
              {notStartedInFirst8} of next 8 weeks not yet published
            </span>
          )}
          {notStartedInFirst8 === 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 10px', borderRadius: 64, fontSize: 12, fontWeight: 600,
              background: 'var(--success-100)', color: 'var(--success-600)', border: '1px solid var(--success-200)',
            }}>
              <CheckCircleIcon size={12} weight="fill" aria-hidden="true" />
              Next 8 weeks published
            </span>
          )}
        </div>
        <span style={{ fontSize: 11, color: 'var(--neutral-300)' }}>18-week window</span>
      </div>

      {/* Scrollable week grid */}
      <div style={{ overflowX: 'auto', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 8, minWidth: 'max-content' }}>
          {weeks.map((week, idx) => {
            const cfg = STATUS_CONFIG[week.status]
            const urgent = isUrgent(idx, week.status)
            return (
              <div
                key={week.weekStartIso}
                tabIndex={0}
                aria-label={`Week of ${week.weekLabel}: ${cfg.label}${week.agentsCoveredPct > 0 ? `, ${week.agentsCoveredPct}% agents covered` : ''}`}
                style={{
                  width: 116, flexShrink: 0, borderRadius: 8,
                  border: `1px solid ${urgent ? 'var(--text-error)' : cfg.border + '60'}`,
                  background: urgent ? 'var(--error-50)' : cfg.bg + '50',
                  padding: '10px 12px',
                  outline: 'none',
                }}
                onFocus={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 2px var(--content-action-primary-600)' }}
                onBlur={e  => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
              >
                {/* Week label */}
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-body-secondary)', marginBottom: 6, whiteSpace: 'nowrap' }}>
                  {week.weekLabel}
                </div>

                {/* Status chip */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '3px 0', borderRadius: 4, marginBottom: 6,
                  color: urgent ? 'var(--text-destructive)' : cfg.text,
                  fontSize: 11, fontWeight: 600,
                }}>
                  {urgent ? <WarningIcon size={14} weight="fill" color="var(--text-error)" aria-hidden="true" /> : cfg.icon}
                  {cfg.label}
                </div>

                {/* Coverage */}
                {week.agentsCoveredPct > 0 ? (
                  <div style={{ fontSize: 11, color: 'var(--text-body-secondary)', marginBottom: 6 }}>
                    {week.agentsCoveredPct}% covered
                    <div style={{ height: 3, background: 'var(--neutral-100)', borderRadius: 2, marginTop: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${week.agentsCoveredPct}%`, height: '100%', background: cfg.border, borderRadius: 2 }} />
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: 'var(--neutral-300)', marginBottom: 6 }}>—</div>
                )}

                {/* Drill-out */}
                <DrillOutLink
                  report="schedule-publication"
                  params={{
                    [scopeId.startsWith('sg-') ? 'staffingGroupId' : scopeId.startsWith('fg-') ? 'forecastGroupId' : 'queueId']: scopeId,
                    from: week.weekStartIso,
                  }}
                  label="FCS"
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '8px 20px 14px',
        borderTop: '1px solid var(--neutral-100)', fontSize: 11, color: 'var(--text-body-secondary)',
      }}>
        {(Object.entries(STATUS_CONFIG) as [ScheduleStatus, typeof STATUS_CONFIG[ScheduleStatus]][]).map(([key, cfg]) => (
          <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: cfg.text }}>{cfg.icon}</span>
            {cfg.label}
          </span>
        ))}
        <span style={{ marginLeft: 'auto' }}>
          Weeks starting within 2 weeks show urgency styling if unpublished.
        </span>
      </div>
    </div>
  )
}
