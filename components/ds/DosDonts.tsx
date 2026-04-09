import { type ReactNode } from 'react'
import { Check, X } from 'lucide-react'

// ─── DosDonts container ───────────────────────────────────────────────────────
// Renders a 2-column grid of Do / Don't blocks.
// Usage in MDX:
//
//   <DosDonts>
//     <Do description="Emphasize the primary action.">
//       ...optional visual preview...
//     </Do>
//     <Dont description="Put more than 1 primary button in a group." />
//   </DosDonts>
// ─────────────────────────────────────────────────────────────────────────────

export function DosDonts({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
      {children}
    </div>
  )
}

// ─── Do block ─────────────────────────────────────────────────────────────────

export function Do({
  description,
  children,
}: {
  description: string
  children?: ReactNode
}) {
  return (
    <div
      className="rounded-lg border-2 overflow-hidden"
      style={{ borderColor: 'var(--color-success-200)' }}
    >
      {/* Label */}
      <div
        className="flex items-center gap-2 px-4 py-2"
        style={{ backgroundColor: 'var(--color-success-100)' }}
      >
        <Check size={14} strokeWidth={2.5} style={{ color: '#1a6b1a' }} />
        <span className="text-xs font-semibold" style={{ color: '#1a6b1a' }}>
          Do
        </span>
      </div>

      {/* Optional visual preview */}
      {children && (
        <div
          className="p-6 flex items-center justify-center gap-3 min-h-24"
          style={{ backgroundColor: 'var(--color-surface-display)' }}
        >
          {children}
        </div>
      )}

      {/* Description */}
      <div
        className="px-4 py-3"
        style={{ backgroundColor: 'var(--color-surface-section)' }}
      >
        <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
          {description}
        </p>
      </div>
    </div>
  )
}

// ─── Dont block ───────────────────────────────────────────────────────────────

export function Dont({
  description,
  children,
}: {
  description: string
  children?: ReactNode
}) {
  return (
    <div
      className="rounded-lg border-2 overflow-hidden"
      style={{ borderColor: 'var(--color-error-200)' }}
    >
      {/* Label */}
      <div
        className="flex items-center gap-2 px-4 py-2"
        style={{ backgroundColor: 'var(--color-error-100)' }}
      >
        <X size={14} strokeWidth={2.5} style={{ color: '#8b1a2a' }} />
        <span className="text-xs font-semibold" style={{ color: '#8b1a2a' }}>
          Don't
        </span>
      </div>

      {/* Optional visual preview */}
      {children && (
        <div
          className="p-6 flex items-center justify-center gap-3 min-h-24"
          style={{ backgroundColor: 'var(--color-surface-display)' }}
        >
          {children}
        </div>
      )}

      {/* Description */}
      <div
        className="px-4 py-3"
        style={{ backgroundColor: 'var(--color-surface-section)' }}
      >
        <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
          {description}
        </p>
      </div>
    </div>
  )
}
