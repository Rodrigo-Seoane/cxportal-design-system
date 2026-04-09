import { TopBar } from '@/components/layout/TopBar'
import { TypographyScale } from '@/components/ds/TypographyScale'

export default function TypographyPage() {
  return (
    <>
      <TopBar title="Typography" />
      <main className="flex-1 px-8 py-10 max-w-5xl">
        <div className="mb-8">
          <h2
            className="text-2xl font-semibold mb-1"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Typography Scale
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Mona Sans variable font · weights 300 / 400 / 600 / 800
          </p>
        </div>

        <TypographyScale />
      </main>
    </>
  )
}
