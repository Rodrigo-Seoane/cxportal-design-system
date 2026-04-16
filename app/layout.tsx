import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'

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
        <Sidebar />
        <div
          style={{
            marginLeft: 'var(--sidebar-w)',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            transition: 'margin-left 0.22s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {children}
        </div>
      </body>
    </html>
  )
}
