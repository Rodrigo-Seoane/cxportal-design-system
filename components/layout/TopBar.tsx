export function TopBar({ title, figmaUpdated }: { title?: string; figmaUpdated?: string }) {
  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between h-14 px-8 border-b"
      style={{
        backgroundColor: 'var(--color-surface-section)',
        borderColor: 'var(--color-border)',
      }}
    >
      <h1
        className="text-base font-semibold"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {title ?? 'Design System'}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {figmaUpdated && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 400,
              color: 'var(--color-text-secondary)',
              whiteSpace: 'nowrap',
            }}
          >
            Figma synced {figmaUpdated}
          </span>
        )}
        <a
          href="https://www.figma.com/design/exoHhvasbJSziVGakV8Y0r/CxPortal-%7C-Design-System"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-colors"
          style={{
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 2C9.243 2 7 4.243 7 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z" fill="#0ACF83"/>
            <path d="M7 12c-2.757 0-5 2.243-5 5s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z" fill="#F24E1E"/>
            <path d="M17 12c-2.757 0-5 2.243-5 5s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z" fill="#FF7262"/>
            <path d="M7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z" fill="#F24E1E"/>
            <path d="M17 2c-2.757 0-5 2.243-5 5s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z" fill="#1ABCFE"/>
          </svg>
          Figma
        </a>
      </div>
    </header>
  )
}
