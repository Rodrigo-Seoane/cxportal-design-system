'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { SandboxShell } from '@/components/sandbox/SandboxShell'
import {
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  DotsThreeIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  PencilSimpleIcon,
  FolderOpenIcon,
  CopyIcon,
  TagIcon,
  TrashIcon,
  SlidersHorizontalIcon,
  XIcon,
  ArrowSquareOutIcon,
} from '@phosphor-icons/react'

// ── Types ──────────────────────────────────────────────────────────────────────

type Article = {
  id: string
  title: string
  kb: string
  folder: string
  tags: string[]
  modified: string
  modifiedBy: string
}

// ── Data ───────────────────────────────────────────────────────────────────────

const ARTICLES: Article[] = [
  { id: '1',  title: 'API Documentation Guidelines',   kb: 'Engineering',  folder: 'Development',  tags: ['dep:Engineering', 'status:Deprecated'],   modified: 'Apr 12, 2026', modifiedBy: 'Carlos M.' },
  { id: '2',  title: 'Onboarding Process Overview',    kb: 'Product',      folder: 'HR & People',  tags: ['dep:Product', 'audience:Internal'],         modified: 'Apr 11, 2026', modifiedBy: 'Sara L.' },
  { id: '3',  title: 'Q1 Marketing Campaign Results',  kb: 'Marketing',    folder: 'Campaigns',    tags: ['dep:Marketing', 'access:Confidential'],     modified: 'Apr 10, 2026', modifiedBy: 'Tom K.' },
  { id: '4',  title: 'Security Policy v2.0',           kb: 'Engineering',  folder: 'Security',     tags: ['priority:Urgent', 'access:Confidential'],   modified: 'Apr 9, 2026',  modifiedBy: 'Anna R.' },
  { id: '5',  title: 'Product Roadmap 2026',           kb: 'Product',      folder: 'Strategy',     tags: ['dep:Product', 'access:Confidential'],       modified: 'Apr 8, 2026',  modifiedBy: 'Sara L.' },
  { id: '6',  title: 'Customer Support Playbook',      kb: 'Product',      folder: 'Support',      tags: ['dep:Product', 'audience:External'],         modified: 'Apr 7, 2026',  modifiedBy: 'Mike D.' },
  { id: '7',  title: 'Finance Report Q1 2026',         kb: 'Finance',      folder: 'Reports',      tags: ['dep:Finance', 'access:Confidential'],       modified: 'Apr 6, 2026',  modifiedBy: 'Lisa P.' },
  { id: '8',  title: 'Legal Compliance Checklist',     kb: 'Legal',        folder: 'Compliance',   tags: ['dep:Legal', 'priority:High'],               modified: 'Apr 5, 2026',  modifiedBy: 'John H.' },
  { id: '9',  title: 'Brand Identity Guidelines',      kb: 'Marketing',    folder: 'Brand Assets', tags: ['dep:Marketing', 'audience:External'],       modified: 'Apr 4, 2026',  modifiedBy: 'Emma W.' },
  { id: '10', title: 'Infrastructure Architecture',    kb: 'Engineering',  folder: 'Architecture', tags: ['dep:Engineering', 'priority:High'],         modified: 'Apr 3, 2026',  modifiedBy: 'Carlos M.' },
  { id: '11', title: 'Vendor Management Policy',       kb: 'Legal',        folder: 'Procurement',  tags: ['dep:Legal', 'access:Public'],               modified: 'Apr 2, 2026',  modifiedBy: 'John H.' },
  { id: '12', title: 'Employee Handbook 2026',         kb: 'Product',      folder: 'HR & People',  tags: ['dep:Product', 'audience:Internal'],         modified: 'Apr 1, 2026',  modifiedBy: 'Sara L.' },
  { id: '13', title: 'Data Privacy Framework',         kb: 'Legal',        folder: 'Compliance',   tags: ['dep:Legal', 'status:Archived'],             modified: 'Mar 31, 2026', modifiedBy: 'Anna R.' },
]

const KB_LIST    = ['Engineering', 'Product', 'Marketing', 'Finance', 'Legal']
const FOLDER_LIST = ['Development', 'Security', 'Architecture', 'HR & People', 'Strategy', 'Support', 'Campaigns', 'Brand Assets', 'Reports', 'Compliance', 'Procurement']

const TAG_ITEMS = [
  { key: 'access:Public',       label: 'Public',       bg: '#fbc6d4', dot: '#c0394e' },
  { key: 'access:Confidential', label: 'Confidential', bg: '#fbc6d4', dot: '#c0394e' },
  { key: 'dep:Product',         label: 'Product',      bg: '#d6e2f5', dot: '#3a6bc0' },
  { key: 'dep:Engineering',     label: 'Engineering',  bg: '#d6e2f5', dot: '#3a6bc0' },
  { key: 'dep:Marketing',       label: 'Marketing',    bg: '#d6e2f5', dot: '#3a6bc0' },
  { key: 'dep:Finance',         label: 'Finance',      bg: '#d6e2f5', dot: '#3a6bc0' },
  { key: 'dep:Legal',           label: 'Legal',        bg: '#d6e2f5', dot: '#3a6bc0' },
  { key: 'status:Archived',     label: 'Archived',     bg: '#eff1f3', dot: '#7a828c' },
  { key: 'priority:High',       label: 'High Priority',bg: '#ddf4d2', dot: '#3a8a3a' },
]

const TAG_STYLE: Record<string, { bg: string; text: string }> = {
  'access:Public':       { bg: '#fef3c7', text: '#854d0e' },
  'access:Confidential': { bg: '#fbc6d4', text: '#8b1a2a' },
  'dep:Product':         { bg: '#d6e2f5', text: '#1a3d6b' },
  'dep:Marketing':       { bg: '#d6e2f5', text: '#1a3d6b' },
  'dep:Finance':         { bg: '#d6e2f5', text: '#1a3d6b' },
  'dep:Engineering':     { bg: '#d6e2f5', text: '#1a3d6b' },
  'dep:Legal':           { bg: '#d6e2f5', text: '#1a3d6b' },
  'status:Deprecated':   { bg: '#fbeed8', text: '#7a4a00' },
  'status:Archived':     { bg: '#eff1f3', text: '#4b535e' },
  'priority:High':       { bg: '#ddf4d2', text: '#1a6b1a' },
  'priority:Urgent':     { bg: '#fee2e2', text: '#991b1b' },
  'audience:Internal':   { bg: '#fbeed8', text: '#7a4a00' },
  'audience:External':   { bg: '#ffe9cc', text: '#7a4a00' },
}

// Format: strip prefix for display
function tagLabel(key: string) {
  return key.split(':')[1] ?? key
}

// ── Portal dropdown ────────────────────────────────────────────────────────────

type DropdownSection = {
  heading?: string
  items: { label: string; icon?: React.ReactNode; danger?: boolean; onClick?: () => void }[]
}

function PortalDropdown({
  anchorRef,
  open,
  onClose,
  sections,
  width = 200,
  align = 'left',
}: {
  anchorRef: React.RefObject<HTMLElement | null>
  open: boolean
  onClose: () => void
  sections: DropdownSection[]
  width?: number
  align?: 'left' | 'right'
}) {
  const [style, setStyle] = useState<React.CSSProperties>({})
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || !anchorRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    setStyle({
      position: 'fixed',
      top:  rect.bottom + 4,
      left: align === 'right' ? rect.right - width : rect.left,
      zIndex: 9999,
      width,
    })
  }, [open, anchorRef, width, align])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (anchorRef.current?.contains(target) || menuRef.current?.contains(target)) return
      onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, anchorRef, onClose])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      ref={menuRef}
      style={{
        ...style,
        background:   '#ffffff',
        border:       '1px solid #d9dce0',
        borderRadius: '8px',
        boxShadow:    '0 4px 24px rgba(5,3,38,0.10)',
        overflow:     'hidden',
      }}
    >
      {sections.map((section, si) => (
        <div key={si}>
          {si > 0 && <div style={{ height: 1, background: '#eff1f3', margin: '4px 0' }} />}
          {section.heading && (
            <div style={{
              padding: '6px 12px 2px',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
              color: '#7a828c',
            }}>
              {section.heading}
            </div>
          )}
          {section.items.map((item, ii) => (
            <button
              key={ii}
              onClick={() => { item.onClick?.(); onClose() }}
              style={{
                display:     'flex',
                alignItems:  'center',
                gap:         8,
                width:       '100%',
                padding:     '8px 12px',
                background:  'transparent',
                border:      'none',
                cursor:      'pointer',
                fontSize:    13,
                fontWeight:  400,
                color:       item.danger ? '#ef2056' : '#021920',
                textAlign:   'left',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f5f7fa' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
            >
              {item.icon && <span style={{ flexShrink: 0, color: item.danger ? '#ef2056' : '#7a828c' }}>{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      ))}
    </div>,
    document.body,
  )
}

// ── Filter panel ───────────────────────────────────────────────────────────────

function FilterPanel({
  open,
  onToggle,
  activeKBs,
  onToggleKB,
  activeFolders,
  onToggleFolder,
  activeTags,
  onToggleTag,
}: {
  open: boolean
  onToggle: () => void
  activeKBs: Set<string>
  onToggleKB: (kb: string) => void
  activeFolders: Set<string>
  onToggleFolder: (f: string) => void
  activeTags: Set<string>
  onToggleTag: (t: string) => void
}) {
  const COLLAPSED_W = 48
  const EXPANDED_W  = 240

  return (
    <div style={{
      width:         open ? EXPANDED_W : COLLAPSED_W,
      flexShrink:    0,
      transition:    'width 0.2s ease',
      overflow:      'hidden',
      borderRight:   '1px solid #eff1f3',
      background:    '#ffffff',
      display:       'flex',
      flexDirection: 'column',
    }}>
      {/* Toggle button */}
      <div style={{
        height:         48,
        display:        'flex',
        alignItems:     'center',
        justifyContent: open ? 'space-between' : 'center',
        padding:        open ? '0 12px 0 16px' : 0,
        flexShrink:     0,
        borderBottom:   '1px solid #eff1f3',
      }}>
        {open && (
          <span style={{ fontSize: 12, fontWeight: 600, color: '#021920', letterSpacing: '0.24px' }}>
            Filters
          </span>
        )}
        <button
          onClick={onToggle}
          title={open ? 'Collapse filters' : 'Expand filters'}
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            width:          28,
            height:         28,
            borderRadius:   6,
            border:         'none',
            background:     'transparent',
            cursor:         'pointer',
            color:          '#4b535e',
            flexShrink:     0,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#eff1f3' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
        >
          <SlidersHorizontalIcon size={16} />
        </button>
      </div>

      {/* Filter content — only visible when expanded */}
      {open && (
        <div style={{
          flex:      1,
          overflowY: 'auto',
          padding:   '8px 0',
        }}>

          {/* Knowledge Base section */}
          <FilterSection icon={<FunnelSimpleIcon size={13} />} label="Knowledge Base">
            {KB_LIST.map(kb => (
              <FilterCheckItem
                key={kb}
                label={kb}
                checked={activeKBs.has(kb)}
                onToggle={() => onToggleKB(kb)}
              />
            ))}
          </FilterSection>

          {/* Folders section */}
          <FilterSection icon={<FunnelSimpleIcon size={13} />} label="Folders">
            {FOLDER_LIST.map(f => (
              <FilterCheckItem
                key={f}
                label={f}
                checked={activeFolders.has(f)}
                onToggle={() => onToggleFolder(f)}
              />
            ))}
          </FilterSection>

          {/* Tags section */}
          <FilterSection
            icon={<FunnelSimpleIcon size={13} />}
            label="Tags"
            action={
              <button style={{
                display:     'flex',
                alignItems:  'center',
                gap:         4,
                border:      'none',
                background:  'transparent',
                cursor:      'pointer',
                fontSize:    11,
                fontWeight:  500,
                color:       '#4285f4',
                padding:     '2px 4px',
                borderRadius: 4,
              }}>
                <PlusIcon size={11} />
                New Tag
              </button>
            }
          >
            {TAG_ITEMS.map(t => (
              <FilterTagItem
                key={t.key}
                tag={t}
                checked={activeTags.has(t.key)}
                onToggle={() => onToggleTag(t.key)}
              />
            ))}
          </FilterSection>
        </div>
      )}
    </div>
  )
}

function FilterSection({
  icon,
  label,
  children,
  action,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  const [expanded, setExpanded] = useState(true)
  return (
    <div style={{ marginBottom: 4 }}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(v => !v)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(v => !v) } }}
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          width:          '100%',
          padding:        '6px 12px',
          cursor:         'pointer',
          userSelect:     'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#7a828c' }}>{icon}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#021920', letterSpacing: '0.24px' }}>
            {label}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {action && <span onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>{action}</span>}
          <span style={{ color: '#7a828c', transition: 'transform 0.15s', transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', display: 'flex' }}>
            <CaretDownIcon size={12} />
          </span>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '0 4px 4px' }}>
          {children}
        </div>
      )}
    </div>
  )
}

function FilterCheckItem({
  label,
  checked,
  onToggle,
}: {
  label: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <label style={{
      display:     'flex',
      alignItems:  'center',
      gap:         8,
      padding:     '4px 8px',
      cursor:      'pointer',
      borderRadius: 4,
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLLabelElement).style.background = '#f5f7fa' }}
    onMouseLeave={e => { (e.currentTarget as HTMLLabelElement).style.background = 'transparent' }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        style={{ width: 13, height: 13, accentColor: '#4285f4', cursor: 'pointer', flexShrink: 0 }}
      />
      <span style={{ fontSize: 12, color: '#4b535e', userSelect: 'none' }}>{label}</span>
    </label>
  )
}

function FilterTagItem({
  tag,
  checked,
  onToggle,
}: {
  tag: { key: string; label: string; bg: string; dot: string }
  checked: boolean
  onToggle: () => void
}) {
  return (
    <label style={{
      display:     'flex',
      alignItems:  'center',
      gap:         8,
      padding:     '4px 8px',
      cursor:      'pointer',
      borderRadius: 4,
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLLabelElement).style.background = '#f5f7fa' }}
    onMouseLeave={e => { (e.currentTarget as HTMLLabelElement).style.background = 'transparent' }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        style={{ width: 13, height: 13, accentColor: '#4285f4', cursor: 'pointer', flexShrink: 0 }}
      />
      <span style={{
        display:      'inline-flex',
        alignItems:   'center',
        gap:          5,
        padding:      '1px 7px 1px 5px',
        borderRadius: 100,
        background:   tag.bg,
        fontSize:     11,
        fontWeight:   500,
        color:        tag.dot,
        userSelect:   'none',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: tag.dot, flexShrink: 0 }} />
        {tag.label}
      </span>
    </label>
  )
}

// ── Tag chip ───────────────────────────────────────────────────────────────────

function TagChip({ tagKey }: { tagKey: string }) {
  const s = TAG_STYLE[tagKey] ?? { bg: '#eff1f3', text: '#4b535e' }
  return (
    <span style={{
      display:      'inline-flex',
      alignItems:   'center',
      padding:      '2px 8px',
      borderRadius: 100,
      background:   s.bg,
      fontSize:     11,
      fontWeight:   500,
      color:        s.text,
      whiteSpace:   'nowrap',
      lineHeight:   '16px',
    }}>
      {tagLabel(tagKey)}
    </span>
  )
}

// ── Checkbox ───────────────────────────────────────────────────────────────────

function Checkbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean
  indeterminate?: boolean
  onChange: () => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate
  }, [indeterminate])
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      style={{ width: 14, height: 14, accentColor: '#4285f4', cursor: 'pointer' }}
    />
  )
}

// ── Pagination ─────────────────────────────────────────────────────────────────

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  return (
    <div style={{
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      gap:            4,
      padding:        '12px 16px',
      borderTop:      '1px solid #eff1f3',
    }}>
      <PaginationBtn
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        label="Back"
        icon={<CaretLeftIcon size={12} />}
      />
      {Array.from({ length: total }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          style={{
            width:        28,
            height:       28,
            display:      'flex',
            alignItems:   'center',
            justifyContent:'center',
            border:       p === page ? '1px solid #4285f4' : '1px solid transparent',
            borderRadius: 6,
            background:   p === page ? '#eef3fb' : 'transparent',
            color:        p === page ? '#4285f4' : '#4b535e',
            fontSize:     13,
            fontWeight:   p === page ? 600 : 400,
            cursor:       'pointer',
          }}
        >
          {p}
        </button>
      ))}
      <PaginationBtn
        onClick={() => onChange(Math.min(total, page + 1))}
        disabled={page === total}
        label="Next"
        icon={<CaretRightIcon size={12} />}
        iconAfter
      />
    </div>
  )
}

function PaginationBtn({
  onClick,
  disabled,
  label,
  icon,
  iconAfter,
}: {
  onClick: () => void
  disabled?: boolean
  label: string
  icon: React.ReactNode
  iconAfter?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:          4,
        padding:      '4px 10px',
        border:       '1px solid #d9dce0',
        borderRadius: 6,
        background:   'transparent',
        fontSize:     13,
        fontWeight:   400,
        color:        disabled ? '#aab0b8' : '#4b535e',
        cursor:       disabled ? 'not-allowed' : 'pointer',
        opacity:      disabled ? 0.6 : 1,
      }}
    >
      {!iconAfter && icon}
      {label}
      {iconAfter && icon}
    </button>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function CollapsibleFilterPage() {
  const [filtersOpen,    setFiltersOpen]   = useState(false)
  const [selectedRows,   setSelectedRows]  = useState<Set<string>>(new Set())
  const [actionsOpen,    setActionsOpen]   = useState(false)
  const [rowActionsId,   setRowActionsId]  = useState<string | null>(null)
  const [searchQuery,    setSearchQuery]   = useState('')
  const [page,           setPage]          = useState(1)
  const [activeKBs,      setActiveKBs]     = useState<Set<string>>(new Set())
  const [activeFolders,  setActiveFolders] = useState<Set<string>>(new Set())
  const [activeTags,     setActiveTags]    = useState<Set<string>>(new Set())

  const actionsRef   = useRef<HTMLButtonElement>(null)
  const rowRefs      = useRef<Map<string, HTMLButtonElement>>(new Map())

  const allSelected  = selectedRows.size === ARTICLES.length
  const someSelected = selectedRows.size > 0 && !allSelected
  const bulkMode     = selectedRows.size > 0

  const toggleAll = useCallback(() => {
    setSelectedRows(prev =>
      prev.size === ARTICLES.length
        ? new Set()
        : new Set(ARTICLES.map(a => a.id))
    )
  }, [])

  const toggleRow = useCallback((id: string) => {
    setSelectedRows(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const clearSelection = () => setSelectedRows(new Set())

  const toggleKB     = (kb: string)  => setActiveKBs(prev    => { const n = new Set(prev); n.has(kb) ? n.delete(kb) : n.add(kb); return n })
  const toggleFolder = (f: string)   => setActiveFolders(prev => { const n = new Set(prev); n.has(f)  ? n.delete(f)  : n.add(f);  return n })
  const toggleTag    = (t: string)   => setActiveTags(prev    => { const n = new Set(prev); n.has(t)  ? n.delete(t)  : n.add(t);  return n })

  const actionSections: DropdownSection[] = [
    {
      heading: 'Knowledge Base',
      items: [
        { label: 'Create article',          icon: <PlusIcon size={14} /> },
        { label: 'Import articles',         icon: <ArrowSquareOutIcon size={14} /> },
      ],
    },
    {
      heading: 'Settings',
      items: [
        { label: 'Manage knowledge bases',  icon: <FunnelSimpleIcon size={14} /> },
        { label: 'Manage tags',             icon: <TagIcon size={14} /> },
      ],
    },
  ]

  const rowActionSections: DropdownSection[] = [
    {
      heading: 'File Management',
      items: [
        { label: 'Edit article',    icon: <PencilSimpleIcon size={14} /> },
        { label: 'Move to folder',  icon: <FolderOpenIcon size={14} /> },
        { label: 'Duplicate',       icon: <CopyIcon size={14} /> },
      ],
    },
    {
      heading: 'Tags',
      items: [
        { label: 'Add tag',         icon: <TagIcon size={14} /> },
        { label: 'Remove tag',      icon: <TagIcon size={14} /> },
        { label: 'Delete',          icon: <TrashIcon size={14} />, danger: true },
      ],
    },
  ]

  return (
    <SandboxShell
      title="Collapsible Filter"
      description="Article table with an inline collapsible filter panel. Supports KB, folder, and tag filters with active-filter chips and a pagination bar."
      status="In Review"
      author="Rodrigo S."
      created="2026-04-12"
    >
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8f9fb' }}>

      {/* Page header */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '16px 24px',
        background:     '#ffffff',
        borderBottom:   '1px solid #eff1f3',
        flexShrink:     0,
      }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#021920', margin: 0, lineHeight: '26px' }}>
            Knowledge Management
          </h2>
          <p style={{ fontSize: 13, color: '#7a828c', margin: '2px 0 0', lineHeight: '18px' }}>
            {ARTICLES.length} articles across {KB_LIST.length} knowledge bases
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Search */}
          <div style={{
            display:     'flex',
            alignItems:  'center',
            gap:         6,
            padding:     '6px 10px',
            border:      '1px solid #d9dce0',
            borderRadius: 8,
            background:  '#ffffff',
            width:       220,
          }}>
            <MagnifyingGlassIcon size={14} color="#7a828c" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search articles…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                flex:        1,
                border:      'none',
                outline:     'none',
                fontSize:    13,
                color:       '#021920',
                background:  'transparent',
              }}
            />
          </div>

          {/* Actions button */}
          <button
            ref={actionsRef}
            onClick={() => setActionsOpen(v => !v)}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          6,
              padding:      '7px 14px',
              border:       '1px solid #d9dce0',
              borderRadius: 8,
              background:   actionsOpen ? '#f5f7fa' : '#ffffff',
              fontSize:     13,
              fontWeight:   500,
              color:        '#021920',
              cursor:       'pointer',
            }}
          >
            Actions
            <CaretDownIcon
              size={12}
              style={{
                transition: 'transform 0.15s',
                transform:  actionsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </button>

          <PortalDropdown
            anchorRef={actionsRef}
            open={actionsOpen}
            onClose={() => setActionsOpen(false)}
            sections={actionSections}
            width={220}
            align="right"
          />
        </div>
      </div>

      {/* Main content: filter panel + table */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        <FilterPanel
          open={filtersOpen}
          onToggle={() => setFiltersOpen(v => !v)}
          activeKBs={activeKBs}
          onToggleKB={toggleKB}
          activeFolders={activeFolders}
          onToggleFolder={toggleFolder}
          activeTags={activeTags}
          onToggleTag={toggleTag}
        />

        {/* Table area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#ffffff' }}>

          {/* Bulk actions bar */}
          {bulkMode && (
            <div style={{
              display:     'flex',
              alignItems:  'center',
              gap:         12,
              padding:     '8px 16px',
              background:  '#eef3fb',
              borderBottom:'1px solid #c6d8f8',
              flexShrink:  0,
            }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#1a3d6b' }}>
                {selectedRows.size} article{selectedRows.size !== 1 ? 's' : ''} selected
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <BulkBtn label="Move" icon={<FolderOpenIcon size={13} />} />
                <BulkBtn label="Add Tag" icon={<TagIcon size={13} />} />
                <BulkBtn label="Delete" icon={<TrashIcon size={13} />} danger />
              </div>
              <button
                onClick={clearSelection}
                style={{
                  marginLeft:  'auto',
                  display:     'flex',
                  alignItems:  'center',
                  gap:         4,
                  border:      'none',
                  background:  'transparent',
                  cursor:      'pointer',
                  fontSize:    12,
                  color:       '#4285f4',
                  fontWeight:  500,
                  padding:     '2px 6px',
                  borderRadius: 4,
                }}
              >
                <XIcon size={13} />
                Clear selection
              </button>
            </div>
          )}

          {/* Table */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            <table style={{
              width:           '100%',
              borderCollapse:  'collapse',
              fontSize:        13,
              tableLayout:     'auto',
            }}>
              <thead>
                <tr style={{ background: '#f8f9fb', borderBottom: '1px solid #eff1f3' }}>
                  <Th style={{ width: 40, paddingLeft: 16 }}>
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={toggleAll}
                    />
                  </Th>
                  <Th style={{ minWidth: 200 }}>Title</Th>
                  <Th style={{ width: 130 }}>Knowledge Base</Th>
                  <Th style={{ width: 130 }}>Folder</Th>
                  <Th style={{ minWidth: 160 }}>Tags</Th>
                  <Th style={{ width: 110 }}>Modified</Th>
                  {bulkMode && <Th style={{ width: 110 }}>Modified By</Th>}
                  <Th style={{ width: 48 }} />
                </tr>
              </thead>
              <tbody>
                {ARTICLES.map((article, idx) => {
                  const isSelected = selectedRows.has(article.id)
                  return (
                    <tr
                      key={article.id}
                      style={{
                        background:  isSelected ? '#f0f5fe' : idx % 2 === 0 ? '#ffffff' : '#fafbfc',
                        borderBottom:'1px solid #eff1f3',
                      }}
                    >
                      <Td style={{ width: 40, paddingLeft: 16 }}>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleRow(article.id)}
                        />
                      </Td>
                      <Td style={{ fontWeight: 500, color: '#021920' }}>
                        {article.title}
                      </Td>
                      <Td>
                        <span style={{
                          display:      'inline-flex',
                          alignItems:   'center',
                          gap:          5,
                          padding:      '2px 8px',
                          borderRadius: 100,
                          background:   '#eff1f3',
                          fontSize:     11,
                          fontWeight:   500,
                          color:        '#4b535e',
                          whiteSpace:   'nowrap',
                        }}>
                          {article.kb}
                        </span>
                      </Td>
                      <Td style={{ color: '#7a828c' }}>
                        {article.folder}
                      </Td>
                      <Td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {article.tags.map(t => <TagChip key={t} tagKey={t} />)}
                        </div>
                      </Td>
                      <Td style={{ color: '#7a828c', whiteSpace: 'nowrap' }}>
                        {article.modified}
                      </Td>
                      {bulkMode && (
                        <Td style={{ color: '#7a828c', whiteSpace: 'nowrap' }}>
                          {article.modifiedBy}
                        </Td>
                      )}
                      <Td style={{ width: 48, paddingRight: 8 }}>
                        <button
                          ref={el => {
                            if (el) rowRefs.current.set(article.id, el)
                            else    rowRefs.current.delete(article.id)
                          }}
                          onClick={() => setRowActionsId(prev => prev === article.id ? null : article.id)}
                          style={{
                            display:        'flex',
                            alignItems:     'center',
                            justifyContent: 'center',
                            width:           28,
                            height:          28,
                            border:          'none',
                            borderRadius:    6,
                            background:      rowActionsId === article.id ? '#eff1f3' : 'transparent',
                            cursor:          'pointer',
                            color:           '#7a828c',
                          }}
                          onMouseEnter={e => {
                            if (rowActionsId !== article.id)
                              (e.currentTarget as HTMLButtonElement).style.background = '#eff1f3'
                          }}
                          onMouseLeave={e => {
                            if (rowActionsId !== article.id)
                              (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                          }}
                        >
                          <DotsThreeIcon size={16} weight="bold" />
                        </button>

                        <PortalDropdown
                          anchorRef={{ current: rowRefs.current.get(article.id) ?? null }}
                          open={rowActionsId === article.id}
                          onClose={() => setRowActionsId(null)}
                          sections={rowActionSections}
                          width={200}
                          align="right"
                        />
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <Pagination page={page} total={5} onChange={setPage} />
        </div>
      </div>
    </div>
    </SandboxShell>
  )
}

// ── Small helpers ──────────────────────────────────────────────────────────────

function Th({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <th style={{
      padding:     '10px 12px',
      textAlign:   'left',
      fontSize:    11,
      fontWeight:  600,
      color:       '#7a828c',
      letterSpacing: '0.4px',
      textTransform: 'uppercase',
      whiteSpace:  'nowrap',
      ...style,
    }}>
      {children}
    </th>
  )
}

function Td({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <td style={{
      padding:  '10px 12px',
      fontSize: 13,
      color:    '#4b535e',
      verticalAlign: 'middle',
      ...style,
    }}>
      {children}
    </td>
  )
}

function BulkBtn({
  label,
  icon,
  danger,
}: {
  label: string
  icon: React.ReactNode
  danger?: boolean
}) {
  return (
    <button
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:          5,
        padding:      '5px 10px',
        border:       `1px solid ${danger ? '#f792ac' : '#d9dce0'}`,
        borderRadius: 6,
        background:   '#ffffff',
        fontSize:     12,
        fontWeight:   500,
        color:        danger ? '#ef2056' : '#021920',
        cursor:       'pointer',
      }}
    >
      <span style={{ color: danger ? '#ef2056' : '#7a828c' }}>{icon}</span>
      {label}
    </button>
  )
}
