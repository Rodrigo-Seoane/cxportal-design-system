'use client'

import { useState } from 'react'
import { LiveProvider, LivePreview, LiveError } from 'react-live'
import { registry, type PropValues } from '@/lib/component-registry'
import { PropControls } from './PropControls'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="text-xs px-2.5 py-1 rounded transition-colors"
      style={{
        color: copied ? 'var(--color-primary)' : 'var(--color-text-secondary)',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface-section)',
      }}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

export function ComponentPlayground({ slug }: { slug: string }) {
  const entry = registry[slug]
  if (!entry) return null

  // Initialize state from schema defaults
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [values, setValues] = useState<PropValues>(() => {
    const init: PropValues = {}
    for (const [key, ctrl] of Object.entries(entry.propSchema)) {
      init[key] = ctrl.default
    }
    return init
  })

  function handleChange(key: string, value: string | boolean) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const code = entry.generateCode(values)

  return (
    <LiveProvider code={code} scope={entry.scope} enableTypeScript={false}>
      <div className="space-y-3">
        {/* ── Preview pane ── */}
        <div
          className="rounded-lg border overflow-hidden"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {/* Preview canvas */}
          <div
            className="min-h-40 flex items-center justify-center p-10"
            style={{
              backgroundColor: 'var(--color-surface-display)',
              backgroundImage:
                'radial-gradient(circle, var(--color-border) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          >
            <LivePreview />
          </div>

          {/* Error bar */}
          <LiveError
            className="px-4 py-3 text-xs font-mono"
            style={{
              backgroundColor: 'var(--color-error-100)',
              color: '#8b1a2a',
              borderTop: '1px solid var(--color-error-200)',
            }}
          />
        </div>

        {/* ── Prop controls ── */}
        <PropControls
          schema={entry.propSchema}
          values={values}
          onChange={handleChange}
        />

        {/* ── Code snippet ── */}
        <div
          className="rounded-lg border overflow-hidden"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div
            className="flex items-center justify-between px-4 py-2 border-b"
            style={{
              backgroundColor: 'var(--color-surface-display)',
              borderColor: 'var(--color-border)',
            }}
          >
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Code
            </span>
            <CopyButton text={code} />
          </div>
          <pre
            className="px-4 py-4 text-sm font-mono overflow-x-auto"
            style={{
              backgroundColor: 'var(--color-surface-nav)',
              color: 'var(--color-text-on-dark)',
              margin: 0,
            }}
          >
            {code}
          </pre>
        </div>
      </div>
    </LiveProvider>
  )
}
