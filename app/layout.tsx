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
        <div className="ml-60 min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}
