'use client'

import { useState } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────

export type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left'

export interface TooltipProps {
  content: string
  placement?: TooltipPlacement
  children: React.ReactNode
  className?: string
}

// ── Positioning helpers ────────────────────────────────────────────────────────

function getTooltipStyle(placement: TooltipPlacement): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'absolute',
    zIndex: 50,
    pointerEvents: 'none',
  }
  switch (placement) {
    case 'top':
      return { ...base, bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' }
    case 'bottom':
      return { ...base, top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' }
    case 'left':
      return { ...base, right: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)' }
    case 'right':
      return { ...base, left: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)' }
  }
}

// Arrow is an 8×8 square rotated 45°, with only the two outer-facing border sides
// visible, so it forms a triangle pointing toward the trigger element.
function getArrowStyle(placement: TooltipPlacement): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'absolute',
    width: 8,
    height: 8,
    background: '#eef3fb',
    transform: 'rotate(45deg)',
  }
  switch (placement) {
    // Arrow sits at bottom of body, pointing down
    case 'top':
      return {
        ...base,
        bottom: -4,
        left: '50%',
        marginLeft: -4,
        borderRight: '1px solid #a4beea',
        borderBottom: '1px solid #a4beea',
      }
    // Arrow sits at top of body, pointing up
    case 'bottom':
      return {
        ...base,
        top: -4,
        left: '50%',
        marginLeft: -4,
        borderTop: '1px solid #a4beea',
        borderLeft: '1px solid #a4beea',
      }
    // Arrow sits at right of body, pointing right
    case 'left':
      return {
        ...base,
        right: -4,
        top: '50%',
        marginTop: -4,
        borderTop: '1px solid #a4beea',
        borderRight: '1px solid #a4beea',
      }
    // Arrow sits at left of body, pointing left
    case 'right':
      return {
        ...base,
        left: -4,
        top: '50%',
        marginTop: -4,
        borderBottom: '1px solid #a4beea',
        borderLeft: '1px solid #a4beea',
      }
  }
}

// ── Tooltip ────────────────────────────────────────────────────────────────────

export function Tooltip({
  content,
  placement = 'top',
  children,
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      className={className}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          style={getTooltipStyle(placement)}
        >
          <div
            style={{
              position: 'relative',
              width: 'max-content',
              maxWidth: 200,
              padding: 8,
              background: '#eef3fb',
              border: '1px solid #a4beea',
              borderRadius: 4,
              boxShadow: '0 4px 24px 0 rgba(5,3,38,0.08)',
              whiteSpace: 'normal',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 400,
                lineHeight: '20px',
                color: '#021920',
              }}
            >
              {content}
            </p>
            <div style={getArrowStyle(placement)} />
          </div>
        </div>
      )}
    </div>
  )
}
