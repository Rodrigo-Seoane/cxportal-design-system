'use client'

import React from 'react'
import { TokenSwatch } from '@/components/ds/TokenSwatch'
import { SEMANTIC_GROUPS } from './semantic-tokens'

// ─── Explorer ─────────────────────────────────────────────────────────────────

export function ColorsExplorer() {
  return (
    <div className="flex flex-col" style={{ gap: '28px' }}>
      {SEMANTIC_GROUPS.map((group, gi) => (
        <React.Fragment key={group.title}>
          {gi > 0 && (
            <div
              style={{
                height: '1px',
                backgroundColor: 'var(--neutral-100)',
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
              {group.tokens.map((t) => (
                <TokenSwatch
                  key={t.token}
                  name={t.name}
                  hex={t.hex}
                  cssVar={`--${t.token}`}
                />
              ))}
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}
