import { radii } from '@/lib/tokens'

const entries = Object.entries(radii) as [keyof typeof radii, string][]

export function RadiusDemo() {
  return (
    <div className="flex flex-wrap gap-6">
      {entries.map(([name, value]) => (
        <div key={name} className="flex flex-col items-center gap-3">
          {/* Box */}
          <div
            className="w-24 h-24 border-2"
            style={{
              borderRadius: value,
              borderColor: 'var(--color-primary)',
              backgroundColor: 'var(--color-info-100)',
            }}
          />
          {/* Labels */}
          <div className="text-center">
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {name}
            </p>
            <p
              className="text-xs font-mono"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
