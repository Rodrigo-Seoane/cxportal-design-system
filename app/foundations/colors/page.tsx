import { PageTitle } from '@/components/layout/PageTitle'
import { ColorsExplorer } from './ColorsExplorer'

export default function ColorsPage() {
  return (
    <>
      <PageTitle title="Colors" />
      <main className="flex-1 px-8 py-10 w-full">

        {/* Page header */}
        <div className="flex flex-col mb-7" style={{ gap: '4px' }}>
          <h2
            style={{
              fontSize: '24px',
              lineHeight: '30px',
              color: 'var(--color-text-primary)',
              fontWeight: 400,
            }}
          >
            Color Tokens · Semantic Collection
          </h2>
          <p style={{ fontSize: '14px', lineHeight: '20px', color: 'var(--color-text-secondary)' }}>
            Sourced from the{' '}
            <strong style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
              Semantic
            </strong>{' '}
            collection in Figma. Values resolve per <em>context</em> (CxCentral, CxPortal, Cases) and{' '}
            <em>theme</em> (Light, Dark). Switch below to see how each token adapts; click any swatch to copy its hex.
          </p>
        </div>

        <ColorsExplorer />
      </main>
    </>
  )
}
