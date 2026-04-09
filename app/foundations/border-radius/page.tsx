import { TopBar } from '@/components/layout/TopBar'
import { RadiusDemo } from '@/components/ds/RadiusDemo'

export default function BorderRadiusPage() {
  return (
    <>
      <TopBar title="Border Radius" />
      <main className="flex-1 px-8 py-10 max-w-3xl">
        <div className="mb-8">
          <h2
            className="text-2xl font-semibold mb-1"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Border Radius
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Five radius tokens map to CSS variables and Tailwind utilities via the{' '}
            <code className="text-xs font-mono px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--color-surface-display)' }}>
              --radius-*
            </code>{' '}
            scale.
          </p>
        </div>

        <div
          className="rounded-lg p-8 border"
          style={{
            backgroundColor: 'var(--color-surface-section)',
            borderColor: 'var(--color-border)',
          }}
        >
          <RadiusDemo />
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
                { token: 'xs', cssVar: '--radius-xs', value: '2px' },
                { token: 'sm', cssVar: '--radius-sm', value: '4px' },
                { token: 'md', cssVar: '--radius-md', value: '8px' },
                { token: 'lg', cssVar: '--radius-lg', value: '16px' },
                { token: 'round', cssVar: '--radius-round', value: '64px' },
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
      </main>
    </>
  )
}
