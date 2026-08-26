'use client'

import React, { useState } from 'react'
import { TokenSwatch } from '@/components/ds/TokenSwatch'
import {
  CONTEXTS,
  THEMES,
  SEMANTIC_GROUPS,
  type Context,
  type Theme,
  type ModeKey,
} from './semantic-tokens'

// ─── Segmented control ────────────────────────────────────────────────────────

type SegmentedProps<T extends string> = {
  label: string
  options: readonly T[]
  value: T
  onChange: (v: T) => void
}

function Segmented<T extends string>({ label, options, value, onChange }: SegmentedProps<T>) {
  return (
    <div className="flex items-center" style={{ gap: '8px' }}>
      <span
        style={{
          fontSize: '12px',
          lineHeight: '16px',
          fontWeight: 600,
          letterSpacing: '0.48px',
          textTransform: 'uppercase',
          color: '#7a828c',
        }}
      >
        {label}
      </span>

      <div
        role="tablist"
        aria-label={label}
        className="inline-flex border"
        style={{
          borderRadius: '6px',
          backgroundColor: '#f8f8f8',
          borderColor: '#eff1f3',
          padding: '2px',
        }}
      >
        {options.map((opt) => {
          const active = opt === value
          return (
            <button
              key={opt}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(opt)}
              className="transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2"
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                lineHeight: '16px',
                fontWeight: active ? 600 : 500,
                borderRadius: '4px',
                backgroundColor: active ? '#ffffff' : 'transparent',
                boxShadow: active ? '0 1px 2px rgba(5, 3, 38, 0.08)' : 'none',
                color: active ? '#021920' : '#4b535e',
                border: 'none',
              }}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Explorer ─────────────────────────────────────────────────────────────────

export function ColorsExplorer() {
  const [context, setContext] = useState<Context>('CxPortal')
  const [theme,   setTheme]   = useState<Theme>('Light')
  const mode: ModeKey = `${context}/${theme}`

  return (
    <div className="flex flex-col" style={{ gap: '28px' }}>

      {/* Sticky context / theme switcher */}
      <div
        className="sticky flex flex-wrap items-center border"
        style={{
          top: '56px', // Below PageTitle (h-14 = 56px)
          zIndex: 5,
          gap: '20px',
          padding: '12px 16px',
          borderRadius: '8px',
          backgroundColor: 'var(--color-surface-section, #ffffff)',
          borderColor: '#eff1f3',
        }}
      >
        <Segmented<Context> label="Context" options={CONTEXTS} value={context} onChange={setContext} />
        <Segmented<Theme>   label="Theme"   options={THEMES}   value={theme}   onChange={setTheme} />

        <span
          className="ml-auto font-mono"
          style={{ fontSize: '10px', lineHeight: '16px', color: '#7a828c' }}
        >
          mode: {mode}
        </span>
      </div>

      {/* Groups */}
      {SEMANTIC_GROUPS.map((group, gi) => (
        <React.Fragment key={group.title}>
          {gi > 0 && (
            <div
              style={{
                height: '1px',
                backgroundColor: '#eff1f3',
                width: '100%',
                flexShrink: 0,
              }}
            />
          )}

          <div className="flex flex-col" style={{ gap: '16px' }}>
            {/* Group header */}
            <div className="flex flex-col" style={{ gap: '4px' }}>
              <h3
                style={{
                  fontSize: '18px',
                  lineHeight: '24px',
                  color: 'var(--color-text-primary)',
                  fontWeight: 400,
                }}
              >
                {group.title}
              </h3>
              {group.description && (
                <p style={{ fontSize: '14px', lineHeight: '20px', color: 'var(--color-text-secondary)' }}>
                  {group.description}
                </p>
              )}
            </div>

            {/* Swatches */}
            <div className="flex flex-wrap" style={{ gap: '8px' }}>
              {group.tokens.map((t) => {
                const hex = t.values[mode] ?? t.values['CxPortal/Light'] ?? '#000000'
                return (
                  <TokenSwatch
                    key={t.token}
                    name={t.name}
                    hex={hex}
                    cssVar={`--${t.token}`}
                  />
                )
              })}
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}
