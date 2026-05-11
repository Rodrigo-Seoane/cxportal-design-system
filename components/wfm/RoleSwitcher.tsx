'use client'

import { useState, useRef, useEffect } from 'react'
import { CaretDownIcon, UserCircleIcon } from '@phosphor-icons/react'
import { useWFMStore } from '@/mocks/wfm/store'
import type { Role } from '@/mocks/wfm/store'

const ROLES: { value: Role; label: string }[] = [
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'wfm-lead',   label: 'WFM Lead'   },
  { value: 'admin',      label: 'Admin'       },
]

export function RoleSwitcher() {
  const { role, setRole } = useWFMStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = ROLES.find(r => r.value === role)

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
          background:  '#fdf8ef',
          cursor:      'pointer',
          fontSize:     12,
          fontWeight:   600,
          color:       '#7a4a00',
          fontFamily:  'var(--font-sans)',
        }}
        title="Dev tool — switch role"
      >
        <UserCircleIcon size={14} weight="regular" aria-hidden="true" />
        {current?.label}
        <CaretDownIcon size={12} weight="regular" aria-hidden="true" />
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
          minWidth:    140,
          zIndex:      60,
          overflow:   'hidden',
        }}>
          {ROLES.map(r => (
            <button
              key={r.value}
              onClick={() => { setRole(r.value); setOpen(false) }}
              style={{
                display:   'block',
                width:     '100%',
                textAlign: 'left',
                padding:   '8px 14px',
                border:    'none',
                background: r.value === role ? '#f0f4fb' : 'transparent',
                cursor:    'pointer',
                fontSize:   13,
                fontWeight: r.value === role ? 600 : 400,
                color:     '#021920',
                fontFamily:'var(--font-sans)',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
