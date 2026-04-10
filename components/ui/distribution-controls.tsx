'use client'

import { useState, useRef, useCallback } from 'react'

// ── Design tokens ──────────────────────────────────────────────────────────────
const T = {
  primaryFill:   '#a0c2f9',   // Region A active bar  --content-action/primary/200
  secondaryFill: '#3264b8',   // Region B active bar  --content-action/primary/500
  passiveBg:     '#f8f8f8',   // Passive zone         --neutral/50
  passiveBorder: '#eff1f3',   // Passive zone border  --border-color/neutral
  cardBg:        '#ffffff',   // --surface/section
  cardBorder:    '#eff1f3',   // --border-color/neutral
  textPrimary:   '#021920',   // --text/body/primary
  textOnDark:    '#eff1f3',   // --text/body/on-dark-surface
  textDisabled:  '#aab0b8',   // --text/form-field/disabled
  inputBorder:   '#4285f4',   // --border-color/form-fields/focus
  handle:        '#4285f4',
} as const

const STEP = 10
const snap = (v: number) => Math.round(v / STEP) * STEP

// Bar layout constants (px, relative to bar container)
const BAR_H  = 28
const BAR1_Y = 9    // top bar y-offset in container
const BAR2_Y = 45   // bottom bar y-offset in container

// ── Typography presets ────────────────────────────────────────────────────────

const captionLg: React.CSSProperties = {
  fontFamily: "'Mona Sans', sans-serif",
  fontSize: 12,
  fontWeight: 600,
  lineHeight: '16px',
  letterSpacing: '0.48px',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
}
const captionSm: React.CSSProperties = {
  fontFamily: "'Mona Sans', sans-serif",
  fontSize: 8,
  fontWeight: 600,
  lineHeight: '12px',
  letterSpacing: '0.32px',
  textTransform: 'lowercase',
  whiteSpace: 'nowrap',
}

// ─────────────────────────────────────────────────────────────────────────────

export interface DistributionControlsProps {
  /** Initial percentage for Region A (0–100, snapped to 10s). Default: 0 */
  defaultValue?: number
  regionA?: string
  regionB?: string
  onChange?: (a: number, b: number) => void
  className?: string
}

export function DistributionControls({
  defaultValue = 0,
  regionA = 'us-west-2',
  regionB = 'us-east-1',
  onChange,
  className,
}: DistributionControlsProps) {
  const [value, setValue] = useState<number>(snap(Math.max(0, Math.min(100, defaultValue))))
  const barRef   = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const [westInput, setWestInput] = useState<string | null>(null)
  const [eastInput, setEastInput] = useState<string | null>(null)

  const east = 100 - value

  const commit = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(100, snap(next)))
    setValue(clamped)
    setWestInput(null)
    setEastInput(null)
    onChange?.(clamped, 100 - clamped)
  }, [onChange])

  // ── Drag ──────────────────────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    e.preventDefault()
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !barRef.current) return
    const rect = barRef.current.getBoundingClientRect()
    commit(((e.clientX - rect.left) / rect.width) * 100)
  }
  const onPointerUp = () => { dragging.current = false }

  // ── Inputs ────────────────────────────────────────────────────────────────
  const onWestBlur = () => {
    const v = parseInt(westInput ?? String(value))
    commit(isNaN(v) ? value : v)
  }
  const onEastBlur = () => {
    const v = parseInt(eastInput ?? String(east))
    commit(isNaN(v) ? value : 100 - v)
  }
  const onWestKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onWestBlur()
    if (e.key === 'ArrowUp')   { e.preventDefault(); commit(value + STEP) }
    if (e.key === 'ArrowDown') { e.preventDefault(); commit(value - STEP) }
  }
  const onEastKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onEastBlur()
    if (e.key === 'ArrowUp')   { e.preventDefault(); commit(value - STEP) }
    if (e.key === 'ArrowDown') { e.preventDefault(); commit(value + STEP) }
  }

  // ── Bar fill border-radius ────────────────────────────────────────────────
  const blueBR    = value === 100 ? '8px' : '8px 0 0 8px'
  const darkBR    = east  === 100 ? '8px' : '0 8px 8px 0'
  const topPassBR = value === 0   ? '8px' : '0 8px 8px 0'
  const btmPassBR = east  === 0   ? '8px' : '8px 0 0 8px'

  // ── Transition helpers ────────────────────────────────────────────────────
  const pos = 'left 160ms cubic-bezier(0.25,0,0.25,1)'
  const wid = 'width 160ms cubic-bezier(0.25,0,0.25,1)'

  // ── Label placement rules (derived from Figma) ───────────────────────────
  //
  // TOP BAR (Region A):
  //   value = 0:     "0% [name]" grayed group at left:8 in passive
  //   value = 10–19: "[%] [name]" group in passive zone, RIGHT of handle
  //   value = 20–29: [name] in fill at left:8  |  [%] in passive RIGHT of handle
  //   value ≥ 30:    [name] in fill at left:8  |  [%] in fill, LEFT of handle (near right edge of fill)
  //
  // BOTTOM BAR (Region B):
  //   east = 0:      "[name] 0%" grayed group at right:8 in passive
  //   east = 10–19:  "[name] [%]" group in passive zone, LEFT of handle
  //   east = 20–29:  [name] in fill at right:8  |  [%] in passive LEFT of handle
  //   east ≥ 30:     [name] in fill at right:8  |  [%] in fill, RIGHT of handle (near left edge of fill)

  // vertical centre for each bar
  const bar1Center = BAR1_Y + BAR_H / 2  // 23
  const bar2Center = BAR2_Y + BAR_H / 2  // 59

  // % label tops (captionLg: 16px line-height → center – 8px)
  const top1Pct = bar1Center - 8   // 15
  const top2Pct = bar2Center - 8   // 51

  // name label tops (captionSm: 12px line-height → center – 6px)
  const top1Name = bar1Center - 6  // 17
  const top2Name = bar2Center - 6  // 53

  // group container tops: span bar height, align children centrally
  const grpTop1 = BAR1_Y   // 9
  const grpTop2 = BAR2_Y   // 45

  // shared absolute props for labels inside fills / passive
  const lbl: React.CSSProperties = { position: 'absolute', pointerEvents: 'none', zIndex: 3 }

  return (
    <div
      className={className}
      style={{
        background: T.cardBg,
        border: `1px solid ${T.cardBorder}`,
        borderRadius: 8,
        padding: '8px 16px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        width: '100%',
        minWidth: 372,
        boxSizing: 'border-box',
      }}
    >
      {/* Title */}
      <p style={{
        margin: 0,
        fontFamily: "'Mona Sans', sans-serif",
        fontSize: 18,
        fontWeight: 400,
        lineHeight: '24px',
        color: T.textPrimary,
      }}>
        Agent Distribution
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

        {/* ── Bar container ─────────────────────────────────────────────────── */}
        <div
          ref={barRef}
          style={{ position: 'relative', height: 86, width: '100%', userSelect: 'none' }}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >

          {/* ── FILLS — pure backgrounds, no labels ───────────────────────── */}

          {/* Top: blue fill (Region A) */}
          {value > 0 && (
            <div style={{
              position: 'absolute', top: BAR1_Y, left: 0,
              width: `${value}%`, height: BAR_H,
              background: T.primaryFill,
              borderRadius: blueBR,
              transition: wid,
            }} />
          )}

          {/* Top: passive fill */}
          <div style={{
            position: 'absolute', top: BAR1_Y,
            left: `${value}%`, right: 0,
            height: BAR_H,
            background: T.passiveBg,
            border: `1px solid ${T.passiveBorder}`,
            borderLeft: value > 0 ? 'none' : undefined,
            borderRadius: topPassBR,
            transition: pos,
          }} />

          {/* Bottom: passive fill */}
          {value > 0 && (
            <div style={{
              position: 'absolute', top: BAR2_Y,
              left: 0, width: `${value}%`,
              height: BAR_H,
              background: T.passiveBg,
              border: `1px solid ${T.passiveBorder}`,
              borderRight: 'none',
              borderRadius: btmPassBR,
              transition: wid,
            }} />
          )}

          {/* Bottom: dark blue fill (Region B) */}
          {east > 0 && (
            <div style={{
              position: 'absolute', top: BAR2_Y,
              left: `${value}%`, right: 0,
              height: BAR_H,
              background: T.secondaryFill,
              borderRadius: darkBR,
              transition: pos,
            }} />
          )}

          {/* ── LABELS ────────────────────────────────────────────────────── */}

          {/* ── TOP BAR: value = 0 ────── "0% name" grayed, left:8 in passive */}
          {value === 0 && (
            <div style={{
              ...lbl, left: 8,
              top: grpTop1, height: BAR_H,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <span style={{ ...captionLg, color: T.textPrimary }}>0%</span>
              <span style={{ ...captionSm, color: T.textDisabled }}>{regionA}</span>
            </div>
          )}

          {/* ── TOP BAR: value 10–19 ─── both labels in passive RIGHT of handle */}
          {value >= 10 && value < 20 && (
            <div style={{
              ...lbl,
              left: `${value}%`,
              top: grpTop1, height: BAR_H,
              transform: 'translateX(6px)',
              display: 'flex', alignItems: 'center', gap: 4,
              transition: pos,
            }}>
              <span style={{ ...captionLg, color: T.textPrimary }}>{value}%</span>
              <span style={{ ...captionSm, color: T.textPrimary }}>{regionA}</span>
            </div>
          )}

          {/* ── TOP BAR: value 20–29 ─── name in fill | % in passive RIGHT of handle */}
          {value >= 20 && value < 30 && (
            <>
              <span style={{ ...captionSm, ...lbl, left: 8, top: top1Name, color: T.textPrimary }}>
                {regionA}
              </span>
              <span style={{
                ...captionLg, ...lbl,
                left: `${value}%`, top: top1Pct,
                transform: 'translateX(6px)',
                color: T.textPrimary,
                transition: pos,
              }}>
                {value}%
              </span>
            </>
          )}

          {/* ── TOP BAR: value ≥ 30 ──── both labels inside fill */}
          {value >= 30 && (
            <>
              <span style={{ ...captionSm, ...lbl, left: 8, top: top1Name, color: T.textPrimary }}>
                {regionA}
              </span>
              <span style={{
                ...captionLg, ...lbl,
                left: `${value}%`, top: top1Pct,
                transform: 'translateX(calc(-100% - 8px))',
                color: T.textPrimary,
                transition: pos,
              }}>
                {value}%
              </span>
            </>
          )}

          {/* ── BOTTOM BAR: east = 0 ─── "name 0%" grayed, right:8 in passive */}
          {east === 0 && (
            <div style={{
              ...lbl, right: 8,
              top: grpTop2, height: BAR_H,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ ...captionSm, color: T.textDisabled }}>{regionB}</span>
              <span style={{ ...captionLg, color: T.textDisabled }}>0%</span>
            </div>
          )}

          {/* ── BOTTOM BAR: east 10–19 ── both labels in passive LEFT of handle */}
          {east >= 10 && east < 20 && (
            <div style={{
              ...lbl,
              left: `${value}%`,
              top: grpTop2, height: BAR_H,
              transform: 'translateX(calc(-100% - 6px))',
              display: 'flex', alignItems: 'center', gap: 4,
              transition: pos,
            }}>
              <span style={{ ...captionSm, color: T.textPrimary }}>{regionB}</span>
              <span style={{ ...captionLg, color: T.textPrimary }}>{east}%</span>
            </div>
          )}

          {/* ── BOTTOM BAR: east 20–29 ── name in fill | % in passive LEFT of handle */}
          {east >= 20 && east < 30 && (
            <>
              <span style={{ ...captionSm, ...lbl, right: 8, top: top2Name, color: T.textOnDark }}>
                {regionB}
              </span>
              <span style={{
                ...captionLg, ...lbl,
                left: `${value}%`, top: top2Pct,
                transform: 'translateX(calc(-100% - 6px))',
                color: T.textPrimary,
                transition: pos,
              }}>
                {east}%
              </span>
            </>
          )}

          {/* ── BOTTOM BAR: east ≥ 30 ─── both labels inside dark fill */}
          {east >= 30 && (
            <>
              <span style={{ ...captionSm, ...lbl, right: 8, top: top2Name, color: T.textOnDark }}>
                {regionB}
              </span>
              <span style={{
                ...captionLg, ...lbl,
                left: `${value}%`, top: top2Pct,
                transform: 'translateX(8px)',
                color: T.textOnDark,
                transition: pos,
              }}>
                {east}%
              </span>
            </>
          )}

          {/* ── Tick marks ────────────────────────────────────────────────── */}
          <div style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}>
            {Array.from({ length: 11 }, (_, i) => (
              <div key={i} style={{
                width: 1,
                height: i === 0 || i === 5 || i === 10 ? 4 : 2,
                background: '#c5cdd6',
                borderRadius: 1,
              }} />
            ))}
          </div>

          {/* ── Drag handle ───────────────────────────────────────────────── */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: `${value}%`,
              transform: 'translateX(-50%)',
              width: 20, height: '100%',
              cursor: 'ew-resize',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              zIndex: 10,
              transition: pos,
            }}
            onPointerDown={onPointerDown}
          >
            {/* Vertical line spanning both bars */}
            <div style={{
              position: 'absolute',
              top: BAR1_Y,
              height: BAR2_Y - BAR1_Y + BAR_H,
              width: 2,
              background: T.handle,
              borderRadius: 1,
            }} />
            {/* Thumb centred in the gap between bars */}
            <div style={{
              position: 'absolute',
              top: BAR1_Y + BAR_H + (BAR2_Y - BAR1_Y - BAR_H) / 2,
              transform: 'translateY(-50%)',
              width: 14, height: 14,
              borderRadius: '50%',
              background: '#fff',
              border: `2px solid ${T.handle}`,
              boxShadow: '0 1px 4px rgba(2,25,32,0.18)',
              zIndex: 1,
            }} />
          </div>
        </div>

        {/* Region labels row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          ...captionLg,
          color: T.textPrimary,
        }}>
          <span>{regionA}</span>
          <span>{regionB}</span>
        </div>

        {/* Input fields row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

          {/* Region A input */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: T.cardBg,
            border: `1px solid ${T.inputBorder}`,
            borderRadius: 8, padding: 8,
          }}>
            <input
              type="text"
              inputMode="numeric"
              value={westInput ?? String(value)}
              onChange={e => setWestInput(e.target.value)}
              onBlur={onWestBlur}
              onKeyDown={onWestKey}
              aria-label={`${regionA} traffic percentage`}
              style={{
                fontFamily: "'Mona Sans', sans-serif",
                fontSize: 14, fontWeight: 400, lineHeight: '20px',
                color: T.textPrimary,
                width: 28, border: 'none', outline: 'none',
                background: 'transparent', textAlign: 'right',
              }}
            />
            <span style={{
              fontFamily: "'Mona Sans', sans-serif",
              fontSize: 14, color: T.textDisabled, lineHeight: '20px',
              userSelect: 'none',
            }}>%</span>
          </div>

          {/* Region B input */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: T.cardBg,
            border: `1px solid ${T.inputBorder}`,
            borderRadius: 8, padding: 8,
          }}>
            <input
              type="text"
              inputMode="numeric"
              value={eastInput ?? String(east)}
              onChange={e => setEastInput(e.target.value)}
              onBlur={onEastBlur}
              onKeyDown={onEastKey}
              aria-label={`${regionB} traffic percentage`}
              style={{
                fontFamily: "'Mona Sans', sans-serif",
                fontSize: 14, fontWeight: 400, lineHeight: '20px',
                color: T.textPrimary,
                width: 28, border: 'none', outline: 'none',
                background: 'transparent', textAlign: 'right',
              }}
            />
            <span style={{
              fontFamily: "'Mona Sans', sans-serif",
              fontSize: 14, color: T.textDisabled, lineHeight: '20px',
              userSelect: 'none',
            }}>%</span>
          </div>

        </div>
      </div>
    </div>
  )
}
