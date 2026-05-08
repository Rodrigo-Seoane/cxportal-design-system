'use client'

import type { ActivityCategory } from '@/mocks/wfm/store'

const ACTIVITY_STYLES: Record<ActivityCategory, { bg: string; text: string }> = {
  Productive:      { bg: '#d6e2f5', text: '#1a3561' },
  'Non-Productive':{ bg: '#fbeed8', text: '#7a4a00' },
  'Time Off':      { bg: '#eff1f3', text: '#4b535e' },
}

export interface ActivityPillProps {
  activity: ActivityCategory
  size?: 'sm' | 'md'
}

export function ActivityPill({ activity, size = 'md' }: ActivityPillProps) {
  const s = ACTIVITY_STYLES[activity]
  return (
    <span
      style={{
        display:    'inline-flex',
        alignItems: 'center',
        padding:    size === 'sm' ? '2px 6px' : '3px 8px',
        borderRadius: 64,
        background: s.bg,
        fontFamily: 'var(--font-sans)',
        fontSize:   size === 'sm' ? 10 : 12,
        fontWeight:  600,
        lineHeight: '16px',
        color:      s.text,
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      {activity}
    </span>
  )
}
