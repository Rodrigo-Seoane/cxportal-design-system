import { TopBar } from '@/components/layout/TopBar'
import { IconGrid } from '@/components/ds/IconGrid'

export default function IconsPage() {
  return (
    <>
      <TopBar title="Icons" />
      <main className="flex-1 px-8 py-10">
        <div className="mb-8">
          <h2
            className="text-2xl font-semibold mb-1"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Icons
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Phosphor Icons — curated set for CxPortal. Click any icon to copy its JSX tag.
            Import from{' '}
            <code
              className="text-xs font-mono px-1 py-0.5 rounded"
              style={{ backgroundColor: 'var(--color-surface-display)' }}
            >
              @phosphor-icons/react
            </code>.
          </p>
        </div>

        <IconGrid />
      </main>
    </>
  )
}
