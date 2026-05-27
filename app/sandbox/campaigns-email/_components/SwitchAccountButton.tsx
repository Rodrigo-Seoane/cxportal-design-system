'use client'

import { useState, useEffect, useRef } from 'react'
import { CaretDownIcon } from '@phosphor-icons/react'
import { ACCOUNTS } from '../_mock/accounts'
import { useUIStore } from '../_store/ui-store'

export function SwitchAccountButton() {
  const { activeAccountId, setActiveAccountId } = useUIStore()
  const [open, setOpen]                         = useState(false)
  const containerRef                            = useRef<HTMLDivElement>(null)

  const active = ACCOUNTS.find(a => a.id === activeAccountId) ?? ACCOUNTS[0]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display:     'inline-flex',
          alignItems:  'center',
          gap:          6,
          padding:     '7px 12px',
          borderRadius: 8,
          border:      '1px solid var(--color-border)',
          background:  'var(--color-surface-section)',
          fontSize:     13,
          fontWeight:   500,
          color:       'var(--color-text-primary)',
          cursor:      'pointer',
          whiteSpace:  'nowrap',
        }}
      >
        {active.name}
        <CaretDownIcon
          size={12}
          color="var(--color-text-secondary)"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }}
        />
      </button>

      {open && (
        <div style={{
          position:  'absolute',
          right:      0,
          top:       'calc(100% + 4px)',
          minWidth:  220,
          background:'var(--color-surface-section)',
          border:    '1px solid var(--color-border)',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          zIndex:     50,
          overflow:  'hidden',
        }}>
          {ACCOUNTS.map(a => (
            <button
              key={a.id}
              onClick={() => { setActiveAccountId(a.id); setOpen(false) }}
              style={{
                display:    'block',
                width:      '100%',
                padding:    '10px 14px',
                textAlign:  'left',
                fontSize:    13,
                fontWeight:  a.id === activeAccountId ? 600 : 400,
                color:       a.id === activeAccountId ? 'var(--color-primary)' : 'var(--color-text-primary)',
                background:  a.id === activeAccountId ? 'var(--color-info-100)' : 'transparent',
                border:     'none',
                cursor:     'pointer',
              }}
              onMouseEnter={e => {
                if (a.id !== activeAccountId)
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface-display)'
              }}
              onMouseLeave={e => {
                if (a.id !== activeAccountId)
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              }}
            >
              {a.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
