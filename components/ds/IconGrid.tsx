'use client'

import { useState } from 'react'
import * as Ph from '@phosphor-icons/react'

// Curated icon set relevant to a SaaS product UI
const icons: { name: string; Icon: Ph.Icon }[] = [
  // Navigation & actions
  { name: 'House', Icon: Ph.House },
  { name: 'ArrowLeft', Icon: Ph.ArrowLeft },
  { name: 'ArrowRight', Icon: Ph.ArrowRight },
  { name: 'ArrowUp', Icon: Ph.ArrowUp },
  { name: 'ArrowDown', Icon: Ph.ArrowDown },
  { name: 'CaretLeft', Icon: Ph.CaretLeft },
  { name: 'CaretRight', Icon: Ph.CaretRight },
  { name: 'CaretUp', Icon: Ph.CaretUp },
  { name: 'CaretDown', Icon: Ph.CaretDown },
  { name: 'MagnifyingGlass', Icon: Ph.MagnifyingGlass },
  { name: 'Funnel', Icon: Ph.Funnel },
  { name: 'SortAscending', Icon: Ph.SortAscending },
  { name: 'SortDescending', Icon: Ph.SortDescending },
  // CRUD & files
  { name: 'Plus', Icon: Ph.Plus },
  { name: 'Minus', Icon: Ph.Minus },
  { name: 'X', Icon: Ph.X },
  { name: 'Check', Icon: Ph.Check },
  { name: 'PencilSimple', Icon: Ph.PencilSimple },
  { name: 'Trash', Icon: Ph.Trash },
  { name: 'Copy', Icon: Ph.Copy },
  { name: 'File', Icon: Ph.File },
  { name: 'FileText', Icon: Ph.FileText },
  { name: 'Folder', Icon: Ph.Folder },
  { name: 'DownloadSimple', Icon: Ph.DownloadSimple },
  { name: 'UploadSimple', Icon: Ph.UploadSimple },
  // Status & feedback
  { name: 'CheckCircle', Icon: Ph.CheckCircle },
  { name: 'Warning', Icon: Ph.Warning },
  { name: 'WarningCircle', Icon: Ph.WarningCircle },
  { name: 'Info', Icon: Ph.Info },
  { name: 'Question', Icon: Ph.Question },
  { name: 'XCircle', Icon: Ph.XCircle },
  { name: 'Spinner', Icon: Ph.Spinner },
  // User & account
  { name: 'User', Icon: Ph.User },
  { name: 'Users', Icon: Ph.Users },
  { name: 'UserCircle', Icon: Ph.UserCircle },
  { name: 'SignIn', Icon: Ph.SignIn },
  { name: 'SignOut', Icon: Ph.SignOut },
  { name: 'Lock', Icon: Ph.Lock },
  { name: 'LockOpen', Icon: Ph.LockOpen },
  { name: 'Key', Icon: Ph.Key },
  // Communication
  { name: 'Bell', Icon: Ph.Bell },
  { name: 'BellRinging', Icon: Ph.BellRinging },
  { name: 'Chat', Icon: Ph.Chat },
  { name: 'Envelope', Icon: Ph.Envelope },
  { name: 'Phone', Icon: Ph.Phone },
  // Layout & view
  { name: 'List', Icon: Ph.List },
  { name: 'GridFour', Icon: Ph.GridFour },
  { name: 'SquaresFour', Icon: Ph.SquaresFour },
  { name: 'Rows', Icon: Ph.Rows },
  { name: 'Columns', Icon: Ph.Columns },
  { name: 'Sidebar', Icon: Ph.Sidebar },
  { name: 'Eye', Icon: Ph.Eye },
  { name: 'EyeSlash', Icon: Ph.EyeSlash },
  // Data & charts
  { name: 'ChartBar', Icon: Ph.ChartBar },
  { name: 'ChartLine', Icon: Ph.ChartLine },
  { name: 'ChartPie', Icon: Ph.ChartPie },
  { name: 'Table', Icon: Ph.Table },
  { name: 'Database', Icon: Ph.Database },
  // Settings & config
  { name: 'GearSix', Icon: Ph.GearSix },
  { name: 'Sliders', Icon: Ph.Sliders },
  { name: 'ToggleLeft', Icon: Ph.ToggleLeft },
  { name: 'ToggleRight', Icon: Ph.ToggleRight },
  // Misc
  { name: 'Link', Icon: Ph.Link },
  { name: 'LinkSimple', Icon: Ph.LinkSimple },
  { name: 'ShareNetwork', Icon: Ph.ShareNetwork },
  { name: 'Star', Icon: Ph.Star },
  { name: 'Heart', Icon: Ph.Heart },
  { name: 'Bookmark', Icon: Ph.Bookmark },
  { name: 'Tag', Icon: Ph.Tag },
  { name: 'Calendar', Icon: Ph.Calendar },
  { name: 'Clock', Icon: Ph.Clock },
  { name: 'MapPin', Icon: Ph.MapPin },
  { name: 'Globe', Icon: Ph.Globe },
  { name: 'CreditCard', Icon: Ph.CreditCard },
  { name: 'Receipt', Icon: Ph.Receipt },
  { name: 'Package', Icon: Ph.Package },
  { name: 'Wrench', Icon: Ph.Wrench },
  { name: 'Lightning', Icon: Ph.Lightning },
  { name: 'Moon', Icon: Ph.Moon },
  { name: 'Sun', Icon: Ph.Sun },
]

export function IconGrid() {
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const filtered = query.trim()
    ? icons.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()))
    : icons

  function copy(name: string) {
    navigator.clipboard.writeText(`<${name} />`)
    setCopied(name)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div>
      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Ph.MagnifyingGlass
          className="absolute left-3 top-1/2 -translate-y-1/2"
          size={14}
          style={{ color: 'var(--color-text-secondary)' }}
        />
        <input
          type="search"
          placeholder="Search icons…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-2 text-sm rounded-md border outline-none focus:ring-2"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface-form-field)',
            color: 'var(--color-text-primary)',
            // @ts-expect-error CSS custom property
            '--tw-ring-color': 'var(--color-primary)',
          }}
        />
      </div>

      {/* Count */}
      <p className="text-xs mb-4" style={{ color: 'var(--color-text-secondary)' }}>
        {filtered.length} icon{filtered.length !== 1 ? 's' : ''}
        {query ? ` matching "${query}"` : ''}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {filtered.map(({ name, Icon }) => (
          <button
            key={name}
            onClick={() => copy(name)}
            title={`${name} — click to copy`}
            className="flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-colors cursor-pointer"
            style={{
              borderColor: copied === name ? 'var(--color-primary)' : 'var(--color-border)',
              backgroundColor: copied === name ? 'var(--color-info-100)' : 'var(--color-surface-section)',
            }}
          >
            <Icon size={20} style={{ color: 'var(--color-text-primary)' }} />
            <span
              className="text-[10px] text-center leading-tight break-all"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {copied === name ? 'Copied!' : name}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-center py-12" style={{ color: 'var(--color-text-secondary)' }}>
          No icons match &ldquo;{query}&rdquo;
        </p>
      )}
    </div>
  )
}
