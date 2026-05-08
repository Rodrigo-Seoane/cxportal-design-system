'use client'

import { BriefcaseIcon, CoffeeIcon, CalendarBlankIcon, QuestionIcon } from '@phosphor-icons/react'
import type { ActivityCategory } from '@/mocks/wfm/store'

const ACTIVITY_META: Record<ActivityCategory | 'Unknown', {
  bg: string; text: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: React.ComponentType<any>
}> = {
  Productive:       { bg: '#d6e2f5', text: '#1a3561', Icon: BriefcaseIcon },
  'Non-Productive': { bg: '#fbeed8', text: '#7a4a00', Icon: CoffeeIcon },
  'Time Off':       { bg: '#eff1f3', text: '#4b535e', Icon: CalendarBlankIcon },
  Unknown:          { bg: '#eff1f3', text: '#aab0b8', Icon: QuestionIcon },
}

export interface ActivityPillProps {
  /** The broad category from FCS activity model */
  activity: ActivityCategory | 'Unknown'
  /** Specific activity name (e.g. "Lunch Break", "Inbound Call") */
  name?: string
  size?: 'sm' | 'md'
}

export function ActivityPill({ activity, name, size = 'md' }: ActivityPillProps) {
  const meta = ACTIVITY_META[activity] ?? ACTIVITY_META.Unknown
  const { bg, text, Icon } = meta
  const fs = size === 'sm' ? 10 : 12
  const iconSize = size === 'sm' ? 10 : 12

  return (
    <span
      style={{
        display:    'inline-flex',
        alignItems: 'center',
        gap:         4,
        padding:    size === 'sm' ? '2px 6px' : '3px 8px',
        borderRadius: 64,
        background: bg,
        fontFamily: 'var(--font-sans)',
        fontSize:   fs,
        fontWeight:  600,
        lineHeight: '16px',
        color:      text,
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      <Icon size={iconSize} weight="regular" aria-hidden="true" />
      {name ?? activity}
    </span>
  )
}
