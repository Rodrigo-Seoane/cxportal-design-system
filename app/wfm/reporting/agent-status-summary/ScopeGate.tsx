'use client'

import { FunnelIcon } from '@phosphor-icons/react'
import { useRouter, usePathname } from 'next/navigation'
import { FORECAST_GROUPS, STAFFING_GROUPS } from '@/mocks/wfm/store'

const QUICK_SCOPES = [
  { label: 'My team',              sg: 'sg-triage-day'   },
  { label: 'OK — Triage',          fg: 'fg-triage'       },
  { label: 'OK — Behavioral Health', fg: 'fg-bh'         },
  { label: 'All overnight',         sg: ['sg-triage-night', 'sg-bh-night', 'sg-pharm-night'].join(',') },
]

export function ScopeGate() {
  const router = useRouter()
  const pathname = usePathname()

  const apply = (params: Record<string, string>) => {
    const qs = new URLSearchParams(params)
    qs.set('range', 'live')
    router.replace(`${pathname}?${qs.toString()}`, { scroll: false })
  }

  return (
    <div
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        minHeight:       400,
        padding:        '48px 24px',
        textAlign:      'center',
        fontFamily:     'var(--font-sans)',
      }}
    >
      <div
        style={{
          width:        64,
          height:       64,
          borderRadius: '50%',
          background:  'var(--content-action-primary-100)',
          display:     'flex',
          alignItems:  'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <FunnelIcon size={28} color="var(--content-action-primary-600)" weight="regular" />
      </div>

      <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 600, color: 'var(--text-body-primary)' }}>
        Select a scope to see your agents
      </h2>
      <p style={{ margin: '0 0 28px', fontSize: 14, color: 'var(--text-body-secondary)', maxWidth: 420, lineHeight: '20px' }}>
        This view shows agents within a staffing group or forecast group. Select one using the
        filter above, or pick a common scope below to get started.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {QUICK_SCOPES.map(scope => (
          <button
            key={scope.label}
            onClick={() => {
              if ('sg' in scope) {
                // handle comma-separated multiple SGs
                apply({ sg: scope.sg! })
              } else {
                apply({ fg: scope.fg! })
              }
            }}
            style={{
              padding:     '8px 16px',
              borderRadius: 64,
              border:      '1px solid var(--info-100)',
              background:  'var(--content-action-primary-100)',
              cursor:      'pointer',
              fontSize:     13,
              fontWeight:   500,
              color:       'var(--content-action-primary-700)',
              fontFamily:  'var(--font-sans)',
              transition:  'background 120ms ease',
            }}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'var(--info-100)' }}
            onMouseOut={e  => { (e.currentTarget as HTMLElement).style.background = 'var(--content-action-primary-100)' }}
          >
            {scope.label}
          </button>
        ))}
      </div>
    </div>
  )
}
