import { grid } from '@/lib/tokens'

// The grid spec itself is flat (fixed columns, 16px gutter, 16px margin) at
// every size — Tailwind's 5 default breakpoints are shown here to
// demonstrate how that same fixed grid reflows as available width grows.
// Each row is scaled to fit the docs content column, capped at 100%.
const BREAKPOINTS = [
  { name: 'sm',  label: 'Mobile',  px: 640 },
  { name: 'md',  label: 'Tablet',  px: 768 },
  { name: 'lg',  label: 'Laptop',  px: 1024 },
  { name: 'xl',  label: 'Desktop', px: 1280 },
  { name: '2xl', label: 'Wide',    px: 1536 },
] as const

export interface GridDemoProps {
  /** Column count for this grid style. Default: 12 ("12 Column internal"). */
  columns?: number
}

export function GridDemo({ columns = 12 }: GridDemoProps) {
  return (
    <div className="flex flex-col gap-6">
      {BREAKPOINTS.map(({ name, label, px }) => (
        <div key={name} className="flex flex-col gap-2">
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {label}{' '}
            <span className="font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {name} · {px}px
            </span>
          </p>
          <div
            style={{
              width: `min(100%, ${px / 2}px)`,
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: grid.gutter,
              padding: `0 ${grid.margin}`,
              boxSizing: 'content-box',
            }}
          >
            {Array.from({ length: columns }).map((_, i) => (
              <div
                key={i}
                className="h-8 rounded border"
                style={{
                  backgroundColor: 'var(--color-info-100)',
                  borderColor: 'var(--color-primary)',
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
