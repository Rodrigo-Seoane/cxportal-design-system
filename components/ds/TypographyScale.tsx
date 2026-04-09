import { typography } from '@/lib/tokens'

function Row({
  label,
  size,
  lineHeight,
  weight,
  letterSpacing,
  preview,
}: {
  label: string
  size: number
  lineHeight: number
  weight: number
  letterSpacing?: string
  preview?: string
}) {
  return (
    <div
      className="flex items-baseline gap-6 py-4 border-b"
      style={{ borderColor: 'var(--color-border)' }}
    >
      {/* Meta */}
      <div className="w-44 shrink-0">
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          {size}px / {lineHeight}px · {weight}
          {letterSpacing ? ` · ${letterSpacing} ls` : ''}
        </p>
      </div>

      {/* Live preview */}
      <p
        style={{
          fontSize: `${size}px`,
          lineHeight: `${lineHeight}px`,
          fontWeight: weight,
          letterSpacing: letterSpacing ?? 'normal',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {preview ?? 'The quick brown fox jumps over the lazy dog'}
      </p>
    </div>
  )
}

export function TypographyScale() {
  return (
    <div>
      {/* Headings */}
      <section className="mb-10">
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-1"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Headings
        </h2>
        <div>
          {typography.headings.map((h) => (
            <Row
              key={h.name}
              label={h.name}
              size={h.size}
              lineHeight={h.lineHeight}
              weight={h.weight}
            />
          ))}
        </div>
      </section>

      {/* Body */}
      <section className="mb-10">
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-1"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Body
        </h2>
        <div>
          {typography.body.map((b) => (
            b.weights.map((w) => (
              <Row
                key={`${b.name}-${w}`}
                label={`${b.name} · ${w}`}
                size={b.size}
                lineHeight={b.lineHeight}
                weight={w}
              />
            ))
          ))}
        </div>
      </section>

      {/* Captions */}
      <section>
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-1"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Captions
        </h2>
        <div>
          {typography.captions.map((c) => (
            <Row
              key={c.name}
              label={c.name}
              size={c.size}
              lineHeight={c.lineHeight}
              weight={c.weight}
              letterSpacing={c.letterSpacing}
              preview="CAPTION LABEL TEXT"
            />
          ))}
        </div>
      </section>
    </div>
  )
}
