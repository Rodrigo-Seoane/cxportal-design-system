// ── Band header — numbered marker + framing question (spec §6.1) ───────────
// Bands are visually distinct groups, not an undifferentiated wall of cards.

export function BandHeader({ number, title, question }: { number: number; title: string; question: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-[var(--border-color-accent-info-light)] bg-[var(--surface-accent-info-light)] px-4 py-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--content-action-primary-600)] text-xs font-semibold text-white">
        {number}
      </span>
      <div className="flex flex-col">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--text-body-primary)]">{title}</p>
        <p className="text-xs text-[var(--text-body-secondary)]">{question}</p>
      </div>
    </div>
  )
}
