'use client'

export interface AdherenceBadgeProps {
  adherence: 'adherent' | 'out'
  size?: 'sm' | 'md'
}

export function AdherenceBadge({ adherence, size = 'md' }: AdherenceBadgeProps) {
  const isOut = adherence === 'out'
  return (
    <span
      aria-label={isOut ? 'Out of adherence' : 'Adherent'}
      style={{
        display:      'inline-flex',
        alignItems:   'center',
        gap:           4,
        padding:      size === 'sm' ? '2px 6px' : '3px 8px',
        borderRadius:  64,
        background:   isOut ? '#fbc6d4' : '#ddf4d2',
        fontFamily:   'var(--font-sans)',
        fontSize:     size === 'sm' ? 10 : 12,
        fontWeight:    600,
        lineHeight:   '16px',
        color:        isOut ? '#8b1a2a' : '#1a6b1a',
        whiteSpace:   'nowrap',
        userSelect:   'none',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
          background: isOut ? '#ef2056' : '#4b9924',
        }}
      />
      {isOut ? 'Out' : 'OK'}
    </span>
  )
}
