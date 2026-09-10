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
            Two grid styles, sharing a 16px gutter and 16px outer margin, mapped to CSS
            variables via the{' '}
            <code className="text-xs font-mono px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--color-surface-display)' }}>
              --grid-*
            </code>{' '}
            scale. Neither spec changes per breakpoint — the rows below show the same fixed
            grid reflowing as available width grows.
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            12 Column internal — main content
          </h3>
          <div
            className="rounded-lg p-8 border overflow-x-auto"
            style={{
              backgroundColor: 'var(--color-surface-section)',
              borderColor: 'var(--color-border)',
            }}
          >
            <GridDemo columns={12} />
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            16 cols (wide) — full-bleed layouts
          </h3>
          <div
            className="rounded-lg p-8 border overflow-x-auto"
            style={{
              backgroundColor: 'var(--color-surface-section)',
              borderColor: 'var(--color-border)',
            }}
          >
            <GridDemo columns={16} />
          </div>
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
                { token: 'wideColumns', cssVar: '--grid-wide-columns', value: '16' },
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
          Both grid styles and their exact values (12/16 columns, 16px gutter, 16px margin)
          are confirmed directly against Figma's <code>gridStyles</code> export
          (<code>figma_styles.json</code>, 2026-09-10) — no longer an inferred spec. No Figma
          Principles/Usage frames exist yet for this foundation, so usage guidance (when to
          reach for 12 vs. 16 columns) is still undocumented. The 5 breakpoint rows on each
          grid are Tailwind&apos;s own default breakpoints, not a documented Figma spec —
          still an inferred choice for demonstration purposes, not a confirmed one.
        </p>
      </main>
    </>
  )
}
