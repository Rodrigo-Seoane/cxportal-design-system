import { PageTitle } from '@/components/layout/PageTitle'
import { GridDemo } from '@/components/ds/GridDemo'

export default function GridPage() {
  return (
    <>
      <PageTitle title="Grid" />
      <main className="flex-1 px-8 py-10 max-w-3xl">
        <div className="mb-8">
          <h2
            className="text-2xl font-semibold mb-1"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Layout Grid
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            A flat 12-column grid with a 16px gutter and 16px outer margin, mapped to CSS
            variables via the{' '}
            <code className="text-xs font-mono px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--color-surface-display)' }}>
              --grid-*
            </code>{' '}
            scale. The spec doesn&apos;t change per breakpoint — the rows below show the same
            fixed grid reflowing as available width grows.
          </p>
        </div>

        <div
          className="rounded-lg p-8 border overflow-x-auto"
          style={{
            backgroundColor: 'var(--color-surface-section)',
            borderColor: 'var(--color-border)',
          }}
        >
          <GridDemo />
        </div>

        {/* Token reference table */}
        <div className="mt-8">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Token', 'CSS Variable', 'Value'].map((h) => (
                  <th
                    key={h}
                    className="text-left pb-2 font-semibold text-xs uppercase tracking-wider"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { token: 'columns', cssVar: '--grid-columns', value: '12' },
                { token: 'gutter', cssVar: '--grid-gutter', value: '16px' },
                { token: 'margin', cssVar: '--grid-margin', value: '16px' },
              ].map((row) => (
                <tr
                  key={row.token}
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <td className="py-2.5 font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {row.token}
                  </td>
                  <td className="py-2.5 font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {row.cssVar}
                  </td>
                  <td className="py-2.5 font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          No Figma Principles/Usage frames exist yet for this foundation — this page and its
          tokens were built directly from the audit note (12 columns, 16px gutter, 16px outer
          margin) with no design-doc source to verify against. The 5 breakpoint rows above are
          Tailwind&apos;s own default breakpoints, not a documented Figma spec — flagged as an
          inferred choice, not a confirmed one.
        </p>
      </main>
    </>
  )
}
