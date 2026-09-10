import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { CRRTWidget } from '@/components/layout/CRRTWidget'
import { TopBar } from '@/components/ui/top-bar'

export const metadata: Metadata = {
  title: 'CxPortal Design System',
  description: 'Interactive design system for the CxPortal SaaS product — tokens, components, and sandbox.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full" style={{ backgroundColor: 'var(--color-surface-display)' }}>
        <div id="app-shell">
          <Sidebar />
          <div
            style={{
              marginLeft: 'var(--sidebar-w)',
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              transition: 'margin-left 0.22s cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            {/* Top Bar -- global page-shell chrome (2026-09-10), stays fixed
                while the content column below scrolls. */}
            <TopBar product="new-ui" />
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {children}
            </div>
          </div>
          <CRRTWidget />
        </div>
      </body>
    </html>
  )
}
