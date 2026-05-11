'use client'

import { useState, useRef, useEffect } from 'react'
import { DotsThreeVerticalIcon } from '@phosphor-icons/react'
import { Tooltip } from '@/components/ui/tooltip'

export interface KebabAction {
  label: string
  onClick?: () => void
  disabled?: boolean
  disabledReason?: string
  href?: string
  target?: string
}

export interface KebabMenuProps {
  actions: KebabAction[]
  agentName: string
}

export function KebabMenu({ actions, agentName }: KebabMenuProps) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !btnRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }} onClick={e => e.stopPropagation()}>
      <button
        ref={btnRef}
        aria-label={`${agentName} actions`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        style={{
          display:     'flex',
          alignItems:  'center',
          justifyContent: 'center',
          width:        44,
          height:       44,
          border:      'none',
          background:  'transparent',
          cursor:      'pointer',
          borderRadius: 6,
          color:       '#7a828c',
        }}
      >
        <DotsThreeVerticalIcon size={18} weight="bold" aria-hidden="true" />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={`${agentName} actions`}
          style={{
            position:   'absolute',
            top:        '100%',
            right:       0,
            background: '#ffffff',
            border:     '1px solid #e2e5e8',
            borderRadius: 8,
            boxShadow:  '0 4px 16px rgba(2,25,32,0.14)',
            minWidth:    200,
            zIndex:      9999,
            overflow:   'hidden',
          }}
        >
          {actions.map(action => {
            const item = (
              <button
                key={action.label}
                role="menuitem"
                disabled={action.disabled}
                onClick={() => { action.onClick?.(); setOpen(false) }}
                style={{
                  display:    'block',
                  width:      '100%',
                  textAlign:  'left',
                  padding:    '10px 14px',
                  border:     'none',
                  background: 'transparent',
                  cursor:     action.disabled ? 'not-allowed' : 'pointer',
                  fontSize:    13,
                  fontWeight:  400,
                  color:      action.disabled ? '#aab0b8' : '#021920',
                  fontFamily: 'var(--font-sans)',
                  borderBottom: '1px solid #eff1f3',
                }}
                onMouseOver={e => {
                  if (!action.disabled) (e.currentTarget as HTMLElement).style.background = '#f0f4fb'
                }}
                onMouseOut={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                {action.label}
              </button>
            )

            if (action.disabled && action.disabledReason) {
              return (
                <Tooltip key={action.label} content={action.disabledReason} placement="left">
                  {item}
                </Tooltip>
              )
            }
            return item
          })}
        </div>
      )}
    </div>
  )
}
