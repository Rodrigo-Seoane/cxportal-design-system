'use client'

import { useState, useRef, useEffect } from 'react'
import { SlidersIcon } from '@phosphor-icons/react'
import { useWFMStore } from '@/mocks/wfm/store'
import type { ForceState } from '@/mocks/wfm/store'

const STATES: { value: ForceState; label: string; description: string }[] = [
  { value: 'data',     label: 'Data',          description: 'Happy path — mock data loaded' },
  { value: 'loading',  label: 'Loading',       description: 'All regions show skeletons' },
  { value: 'empty',    label: 'Empty',         description: 'Filter returns zero matches' },
  { value: 'error',    label: 'Error',         description: 'Inline error + stale values' },
  { value: 'partial',  label: 'Partial data',  description: 'KPI loaded; agent panel loading' },
  { value: 'degraded', label: 'Degraded source', description: 'Agent stream down; banner shown' },
]

export function ForceStateTool() {
  const { forceState, setForceState } = useWFMStore()
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
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display:     'inline-flex',
          alignItems:  'center',
          gap:          6,
          padding:     '4px 10px',
          borderRadius: 6,
          border:      '1px solid #d9dce0',
          background:  '#f8f8f8',
          cursor:      'pointer',
          fontSize:     12,
          fontWeight:   600,
          color:       '#4b535e',
          fontFamily:  'var(--font-sans)',
        }}
        title="Dev tool — force page state"
      >
        <SlidersIcon size={14} weight="regular" aria-hidden="true" />
        State: {STATES.find(s => s.value === forceState)?.label}
      </button>

      {open && (
        <div style={{
          position:   'absolute',
          top:        'calc(100% + 4px)',
          right:       0,
          background: '#ffffff',
          border:     '1px solid #e2e5e8',
          borderRadius: 8,
          boxShadow:  '0 4px 24px rgba(2,25,32,0.12)',
          minWidth:    240,
          zIndex:      60,
          overflow:   'hidden',
        }}>
          {STATES.map(s => (
            <button
              key={s.value}
              onClick={() => { setForceState(s.value); setOpen(false) }}
              style={{
                display:      'block',
                width:        '100%',
                textAlign:    'left',
                padding:      '10px 14px',
                border:       'none',
                borderBottom: '1px solid #eff1f3',
                background:   s.value === forceState ? '#f0f4fb' : 'transparent',
                cursor:       'pointer',
                fontFamily:   'var(--font-sans)',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: s.value === forceState ? 600 : 400, color: '#021920' }}>
                {s.label}
              </div>
              <div style={{ fontSize: 11, color: '#7a828c', marginTop: 1 }}>
                {s.description}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
