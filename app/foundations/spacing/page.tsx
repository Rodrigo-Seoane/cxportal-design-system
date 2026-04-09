import { TopBar } from '@/components/layout/TopBar'
import { SpacingGrid } from '@/components/ds/SpacingGrid'

export default function SpacingPage() {
  return (
    <>
      <TopBar title="Spacing" />
      <main className="flex-1 px-8 py-10 max-w-3xl">
        <div className="mb-8">
          <h2
            className="text-2xl font-semibold mb-1"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Spacing Scale
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Tailwind 4px unit system — 1 unit = 4px. Use these values exclusively for margin, padding, and gap.
          </p>
        </div>

        <div
          className="rounded-lg p-6 border"
          style={{
            backgroundColor: 'var(--color-surface-section)',
            borderColor: 'var(--color-border)',
          }}
        >
          {/* Header row */}
          <div
            className="flex items-center gap-4 pb-3 mb-3 border-b"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <span
              className="w-10 text-xs text-right font-semibold uppercase tracking-wider shrink-0"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Unit
            </span>
            <span
              className="flex-1 text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Visual
            </span>
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              px
            </span>
          </div>
          <SpacingGrid />
        </div>
      </main>
    </>
  )
}
