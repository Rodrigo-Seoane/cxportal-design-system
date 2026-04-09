import { spacing } from '@/lib/tokens'

export function SpacingGrid() {
  return (
    <div className="space-y-2">
      {spacing.map((unit) => {
        const px = unit * 4
        return (
          <div key={unit} className="flex items-center gap-4">
            {/* Unit label */}
            <span
              className="w-10 text-xs text-right font-mono shrink-0"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {unit}
            </span>

            {/* Visual bar */}
            <div
              className="h-5 rounded-sm shrink-0"
              style={{
                width: px > 0 ? `${Math.min(px, 384)}px` : '2px',
                minWidth: px > 0 ? undefined : '2px',
                backgroundColor: 'var(--color-primary)',
                opacity: 0.7,
              }}
            />

            {/* px label */}
            <span
              className="text-xs font-mono"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {px}px
            </span>
          </div>
        )
      })}
    </div>
  )
}
