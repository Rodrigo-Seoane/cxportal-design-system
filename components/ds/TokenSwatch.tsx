'use client'

import { useState } from 'react'

interface TokenSwatchProps {
  name: string
  hex: string
  cssVar: string
}

export function TokenSwatch({ name, hex, cssVar }: TokenSwatchProps) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(hex)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const isTransparent = !hex.startsWith('#')

  return (
    // Card: min 240px, hugs content width
    <div
      className="flex items-center gap-2 p-2 border"
      style={{
        minWidth: '240px',
        borderRadius: '4px',
        backgroundColor: 'white',
        borderColor: '#eff1f3',
      }}
    >
      {/* ── Color square — click to copy ─────────────────────────────── */}
      <button
        onClick={copy}
        className="shrink-0 cursor-pointer transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2"
        style={{
          width: '36px',
          height: '36px',
          minWidth: '36px',
          backgroundColor: hex,
          // Checkerboard for rgba / transparent tokens
          backgroundImage: isTransparent
            ? 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%)'
            : undefined,
          backgroundSize: isTransparent ? '16px 16px' : undefined,
          borderRadius: '4px',
        }}
        aria-label={`Copy ${hex}`}
      />

      {/* ── Text block ───────────────────────────────────────────────── */}
      <div className="flex flex-col min-w-0 flex-1" style={{ gap: '4px' }}>

        {/* Row: label + hex badge */}
        <div className="flex items-center justify-between gap-1">
          <span
            className="font-semibold whitespace-nowrap truncate"
            style={{
              fontSize: '14px',
              lineHeight: '20px',
              color: '#021920',
            }}
          >
            {name}
          </span>

          {/* Hex badge — click to copy */}
          <button
            onClick={copy}
            className="shrink-0 whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none"
            style={{
              backgroundColor: copied ? '#d9e7fd' : '#eff1f3',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '10px',
              lineHeight: '16px',
              color: '#021920',
            }}
            aria-label={`Copy ${hex}`}
          >
            {copied ? 'Copied!' : hex}
          </button>
        </div>

        {/* CSS variable name */}
        <p
          className="font-mono truncate"
          style={{
            fontSize: '10px',
            lineHeight: '16px',
            color: '#7a828c',
          }}
        >
          {cssVar}
        </p>
      </div>
    </div>
  )
}
