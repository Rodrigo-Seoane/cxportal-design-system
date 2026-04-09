import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'

const sections = [
  {
    title: 'Foundations',
    description: 'Design tokens: colors, typography, spacing, border radius, and icons.',
    href: '/foundations/colors',
    links: [
      { label: 'Colors', href: '/foundations/colors' },
      { label: 'Typography', href: '/foundations/typography' },
      { label: 'Spacing', href: '/foundations/spacing' },
      { label: 'Icons', href: '/foundations/icons' },
    ],
  },
  {
    title: 'Components',
    description: 'Interactive component playground with live prop controls and usage guidelines.',
    href: '/components/button',
    links: [
      { label: 'Button', href: '/components/button' },
      { label: 'Input', href: '/components/input' },
      { label: 'Select', href: '/components/select' },
      { label: 'Table', href: '/components/table' },
    ],
  },
  {
    title: 'Sandbox',
    description: 'Build, test, and validate new features with devs and stakeholders before they graduate into the system.',
    href: '/sandbox',
    links: [
      { label: 'All Experiments', href: '/sandbox' },
    ],
  },
]

export default function HomePage() {
  return (
    <>
      <TopBar title="Overview" />
      <main className="flex-1 px-8 py-10 max-w-4xl">
        {/* Hero */}
        <div className="mb-10">
          <h2
            className="text-2xl font-semibold mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            CxPortal Design System
          </h2>
          <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
            A living reference for building CxPortal — tokens, components, and a sandbox for new ideas.
            Always grounded in the Figma source of truth.
          </p>
        </div>

        {/* Sections */}
        <div className="grid gap-4 sm:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.title}
              href={section.href}
              className="block rounded-lg p-5 border transition-shadow hover:shadow-md"
              style={{
                backgroundColor: 'var(--color-surface-section)',
                borderColor: 'var(--color-border)',
              }}
            >
              <h3
                className="text-base font-semibold mb-1"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {section.title}
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                {section.description}
              </p>
              <ul className="space-y-1">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      {link.label} →
                    </span>
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>

        {/* Lifecycle note */}
        <div
          className="mt-8 rounded-lg px-5 py-4 text-sm"
          style={{
            backgroundColor: 'var(--color-info-100)',
            color: 'var(--color-text-primary)',
          }}
        >
          <strong>Living system lifecycle:</strong> Build in Sandbox → validate with team → graduate to Components.
          All work must use design tokens from Foundations as its starting point.
        </div>
      </main>
    </>
  )
}
