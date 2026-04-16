'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { SandboxShell } from '@/components/sandbox/SandboxShell'
import { DocumentView } from './DocumentView'
import { BulkMoveModal } from './BulkMoveModal'
import { toast, Toaster } from '@/components/ui/toast'
import {
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  UploadSimpleIcon,
  FolderPlusIcon,
  FoldersIcon,
  DotsThreeIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  PencilSimpleIcon,
  FolderOpenIcon,
  FolderMinusIcon,
  CopyIcon,
  TagIcon,
  TrashIcon,
  StackPlusIcon,
  StackMinusIcon,
  XCircleIcon,
  ArticleIcon,
  SlidersHorizontalIcon,
  PlugsConnectedIcon,
  ArrowsDownUpIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  XIcon,
  CheckIcon,
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

const KB_LIST     = ['Engineering', 'Product', 'Marketing', 'Finance', 'Legal']
const FOLDER_LIST = ['Development', 'Security', 'Architecture', 'HR & People', 'Strategy', 'Support', 'Campaigns', 'Brand Assets', 'Reports', 'Compliance', 'Procurement']

// Dot colors from the Figma DS tokens
const TAG_ITEMS: { key: string; dotBg: string; dotDashed?: boolean }[] = [
  { key: 'status:Archived',     dotBg: '#d6e2f5' },   // info/100
  { key: 'status:Deprecated',   dotBg: '#a4beea' },   // info/200
  { key: 'priority:High',       dotBg: '#ddf4d2' },   // success/100
  { key: 'priority:Urgent',     dotBg: '#b5e89c' },   // success/200
  { key: 'audience:Internal',   dotBg: '#fbeed8' },   // warning/100
  { key: 'audience:External',   dotBg: '#f1c780' },   // warning/300
  { key: 'access:Confidential', dotBg: '#fbc6d4' },   // error/100
  { key: 'access:Public',       dotBg: '#f792ac' },   // error/200
  { key: 'dep:Engineering',     dotBg: 'transparent', dotDashed: true },
  { key: 'dep:Product',         dotBg: 'transparent', dotDashed: true },
  { key: 'dep:Marketing',       dotBg: 'transparent', dotDashed: true },
  { key: 'dep:Finance',         dotBg: 'transparent', dotDashed: true },
  { key: 'dep:Legal',           dotBg: 'transparent', dotDashed: true },
]

const TAG_STYLE: Record<string, { bg: string; text: string }> = {
  'access:Public':       { bg: '#f792ac', text: '#8b1a2a' },   // error/200
  'access:Confidential': { bg: '#fbc6d4', text: '#8b1a2a' },   // error/100
  'dep:Product':         { bg: '#d6e2f5', text: '#1a3d6b' },   // info/100
  'dep:Marketing':       { bg: '#d6e2f5', text: '#1a3d6b' },
  'dep:Finance':         { bg: '#d6e2f5', text: '#1a3d6b' },
  'dep:Engineering':     { bg: '#d6e2f5', text: '#1a3d6b' },
  'dep:Legal':           { bg: '#d6e2f5', text: '#1a3d6b' },
  'status:Deprecated':   { bg: '#a4beea', text: '#1a3d6b' },   // info/200
  'status:Archived':     { bg: '#d6e2f5', text: '#1a3d6b' },   // info/100
  'priority:High':       { bg: '#ddf4d2', text: '#1a6b1a' },   // success/100
  'priority:Urgent':     { bg: '#b5e89c', text: '#1a6b1a' },   // success/200
  'audience:Internal':   { bg: '#fbeed8', text: '#7a4a00' },   // warning/100
  'audience:External':   { bg: '#f1c780', text: '#7a4a00' },   // warning/300
}

const TAG_COLORS: { hex: string; dashed?: boolean }[] = [
  { hex: '#d6e2f5' },
  { hex: '#a4beea' },
  { hex: '#ddf4d2' },
  { hex: '#b5e89c' },
  { hex: '#fbeed8' },
  { hex: '#f7ddb1' },
  { hex: '#fbc6d4' },
  { hex: '#f792ac' },
  { hex: 'dashed', dashed: true },
]

function tagLabel(key: string) {
  return key.replace(':', ': ')
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
                display:    'flex',
                alignItems: 'center',
                gap:        8,
                width:      '100%',
                padding:    '8px 12px',
                background: 'transparent',
                border:     'none',
                cursor:     'pointer',
                fontSize:   13,
                fontWeight: 400,
                color:      item.danger ? '#ef2056' : '#021920',
                textAlign:  'left',
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

// ── Table Filter ───────────────────────────────────────────────────────────────
// DS component (node 71-16179 in CxPortal Design System).
// A compact trigger that opens a portal checkbox dropdown.

function TableFilter({
  label,
  items,
  active,
  onToggle,
}: {
  label: string
  items: string[]
  active: Set<string>
  onToggle: (item: string) => void
}) {
  const [open, setOpen]         = useState(false)
  const triggerRef              = useRef<HTMLButtonElement>(null)
  const menuRef                 = useRef<HTMLDivElement>(null)
  const [dropStyle, setDropStyle] = useState<React.CSSProperties>({})

  const updatePos = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setDropStyle({
      position: 'fixed',
      top:      rect.bottom + 4,
      left:     rect.left,
      width:    rect.width,
      zIndex:   9999,
    })
  }, [])

  useEffect(() => {
    if (!open) return
    updatePos()
    window.addEventListener('scroll', updatePos, true)
    window.addEventListener('resize', updatePos)
    return () => {
      window.removeEventListener('scroll', updatePos, true)
      window.removeEventListener('resize', updatePos)
    }
  }, [open, updatePos])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const activeCount = active.size

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => { updatePos(); setOpen(v => !v) }}
        style={{
          display:        'flex',
          alignItems:     'center',
          gap:            8,
          width:          '100%',
          padding:        8,
          height:         36,
          background:     '#ffffff',
          border:         `1px solid ${open ? '#4285f4' : '#eff1f3'}`,
          borderRadius:   8,
          cursor:         'pointer',
          textAlign:      'left',
          outline:        'none',
        }}
      >
        <span style={{
          flex:          1,
          display:       'flex',
          alignItems:    'center',
          gap:           6,
          fontSize:      12,
          fontWeight:    600,
          color:         '#021920',
          letterSpacing: '0.24px',
          lineHeight:    '20px',
        }}>
          {label}
          {activeCount > 0 && (
            <span style={{
              fontSize:     10,
              fontWeight:   700,
              lineHeight:   '16px',
              padding:      '0 5px',
              borderRadius: 100,
              background:   '#4285f4',
              color:        '#ffffff',
            }}>
              {activeCount}
            </span>
          )}
        </span>
        <FunnelSimpleIcon
          size={16}
          color={activeCount > 0 ? '#4285f4' : '#7a828c'}
          style={{ flexShrink: 0 }}
        />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          style={{
            ...dropStyle,
            background:   '#ffffff',
            border:       '1px solid #d9dce0',
            borderRadius: 8,
            boxShadow:    '0 4px 24px rgba(5,3,38,0.10)',
            overflow:     'hidden',
          }}
        >
          {items.map(item => (
            <label
              key={item}
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:        8,
                padding:    '7px 12px',
                cursor:     'pointer',
                background: active.has(item) ? '#f0f5fe' : 'transparent',
              }}
              onMouseEnter={e => {
                if (!active.has(item))
                  (e.currentTarget as HTMLLabelElement).style.background = '#f5f7fa'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLLabelElement).style.background = active.has(item) ? '#f0f5fe' : 'transparent'
              }}
            >
              <input
                type="checkbox"
                checked={active.has(item)}
                onChange={() => onToggle(item)}
                style={{ width: 13, height: 13, accentColor: '#4285f4', cursor: 'pointer', flexShrink: 0 }}
              />
              <span style={{ fontSize: 12, color: '#4b535e', userSelect: 'none' }}>{item}</span>
            </label>
          ))}
        </div>,
        document.body,
      )}
    </>
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
  onClearAll,
  tagItems,
  onNewTag,
  onEditTag,
  onDeleteTag,
}: {
  open: boolean
  onToggle: () => void
  activeKBs: Set<string>
  onToggleKB: (kb: string) => void
  activeFolders: Set<string>
  onToggleFolder: (f: string) => void
  activeTags: Set<string>
  onToggleTag: (t: string) => void
  onClearAll: () => void
  tagItems: typeof TAG_ITEMS
  onNewTag: () => void
  onEditTag: (key: string) => void
  onDeleteTag: (key: string) => void
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
      {/* Header */}
      <div style={{
        height:         48,
        display:        'flex',
        alignItems:     'center',
        justifyContent: open ? 'space-between' : 'center',
        padding:        open ? '0 8px 0 12px' : 0,
        flexShrink:     0,
        borderBottom:   '1px solid #eff1f3',
        minWidth:       open ? EXPANDED_W : COLLAPSED_W,
      }}>
        {open ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={onToggle}
                title="Collapse filters"
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  width:          24,
                  height:         24,
                  border:         'none',
                  borderRadius:   4,
                  background:     'transparent',
                  cursor:         'pointer',
                  color:          '#4b535e',
                  padding:        0,
                  flexShrink:     0,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#eff1f3' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
              >
                <SlidersHorizontalIcon size={16} />
              </button>
              <span style={{ fontSize: 18, fontWeight: 400, color: '#021920', lineHeight: '24px' }}>
                Filters
              </span>
            </div>
            <button
              onClick={onClearAll}
              style={{
                display:     'flex',
                alignItems:  'center',
                gap:         6,
                border:      'none',
                background:  'transparent',
                cursor:      'pointer',
                fontSize:    10,
                fontWeight:  600,
                color:       '#3264b8',
                padding:     '4px 6px',
                borderRadius: 4,
                whiteSpace:  'nowrap',
              }}
            >
              <XCircleIcon size={14} />
              Clear Filters
            </button>
          </>
        ) : (
          <button
            onClick={onToggle}
            title="Expand filters"
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

        )}
      </div>

      {/* Filter content — only visible when expanded */}
      {open && (
        <div style={{
          flex:          1,
          overflowY:     'auto',
          padding:       '16px 12px',
          display:       'flex',
          flexDirection: 'column',
          gap:           16,
          minWidth:      EXPANDED_W,
        }}>

          {/* Knowledge Base — TableFilter */}
          <TableFilter
            label="Knowledge Base"
            items={KB_LIST}
            active={activeKBs}
            onToggle={onToggleKB}
          />

          {/* Folders — TableFilter */}
          <TableFilter
            label="Folders"
            items={FOLDER_LIST}
            active={activeFolders}
            onToggle={onToggleFolder}
          />

          {/* Tags — always visible, no collapse */}
          <div>
            <div style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-between',
              marginBottom:   8,
            }}>
              <span style={{ fontSize: 18, fontWeight: 400, color: '#021920', lineHeight: '24px' }}>
                Tags
              </span>
              <button
                onClick={onNewTag}
                style={{
                  display:     'flex',
                  alignItems:  'center',
                  gap:         6,
                  border:      'none',
                  background:  'transparent',
                  cursor:      'pointer',
                  fontSize:    10,
                  fontWeight:  600,
                  color:       '#3264b8',
                  padding:     '4px 6px',
                  borderRadius: 4,
                }}>
                <PlusCircleIcon size={14} />
                New Tag
              </button>
            </div>

            {/* Tag selector list */}
            <div style={{ borderTop: '1px solid #eff1f3' }}>
              {tagItems.map(tag => (
                <FilterTagItem
                  key={tag.key}
                  tag={tag}
                  checked={activeTags.has(tag.key)}
                  onToggle={() => onToggleTag(tag.key)}
                  onEdit={() => onEditTag(tag.key)}
                  onDelete={() => onDeleteTag(tag.key)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Filter tag item (TagFilterSelector style) ──────────────────────────────────

function FilterTagItem({
  tag,
  checked,
  onToggle,
  onEdit,
  onDelete,
}: {
  tag: { key: string; dotBg: string; dotDashed?: boolean }
  checked: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const [hovered,  setHovered]  = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos,  setMenuPos]  = useState({ top: 0, left: 0 })
  const [mounted,  setMounted]  = useState(false)
  const menuBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuBtnRef.current && !menuBtnRef.current.contains(e.target as Node))
        setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  function openMenu(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPos({ top: rect.bottom + 4, left: rect.right - 128 })
    setMenuOpen(v => !v)
  }

  const bg = checked ? '#f0f5fe' : hovered ? '#f5f7fa' : '#ffffff'

  return (
    <div
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', height: 32,
        padding: '4px 8px', cursor: 'pointer',
        background: bg, borderBottom: '1px solid #eff1f3',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, padding: '0 4px' }}>
        <div style={{
          width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
          background: tag.dotDashed ? 'transparent' : tag.dotBg,
          border:     tag.dotDashed ? '1px dashed #323840' : 'none',
        }} />
        <span style={{ fontSize: 12, fontWeight: 400, color: '#4b535e', lineHeight: '20px', whiteSpace: 'nowrap', userSelect: 'none' }}>
          {tag.key.replace(':', ': ')}
        </span>
      </div>

      {(hovered || menuOpen) && (
        <button
          ref={menuBtnRef}
          onClick={openMenu}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: menuOpen ? '#e8edf3' : 'transparent',
            border: 'none', borderRadius: 4, padding: '2px 3px',
            cursor: 'pointer', color: '#7a828c', flexShrink: 0,
          }}
        >
          <DotsThreeIcon size={14} weight="bold" />
        </button>
      )}

      {mounted && menuOpen && createPortal(
        <div style={{
          position: 'fixed', top: menuPos.top, left: menuPos.left,
          zIndex: 9999, background: '#ffffff',
          border: '1px solid #eff1f3', borderRadius: 8,
          boxShadow: '0px 4px 16px rgba(5,3,38,0.12)',
          minWidth: 128, overflow: 'hidden',
        }}>
          {([
            { icon: <PencilSimpleIcon size={14} />, label: 'Edit Tag', action: onEdit   },
            { icon: <TrashIcon        size={14} />, label: 'Delete',   action: onDelete },
          ] as { icon: React.ReactNode; label: string; action: () => void }[]).map(({ icon, label, action }) => (
            <button
              key={label}
              onMouseDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); setMenuOpen(false); action() }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '9px 12px', background: 'none',
                border: 'none', cursor: 'pointer', fontSize: 13,
                color: '#021920', textAlign: 'left',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f5f7fa' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
            >
              {icon}{label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}

// ── Tag chip ───────────────────────────────────────────────────────────────────

function TagChip({ tagKey, styleMap = TAG_STYLE }: { tagKey: string; styleMap?: Record<string, { bg: string; text: string }> }) {
  const s = styleMap[tagKey] ?? { bg: '#eff1f3', text: '#4b535e' }
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
      display:    'flex',
      alignItems: 'center',
      gap:        4,
      padding:    '12px 16px',
      borderTop:  '1px solid #eff1f3',
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
            width:          28,
            height:         28,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            border:         p === page ? '1px solid #4285f4' : '1px solid transparent',
            borderRadius:   6,
            background:     p === page ? '#eef3fb' : 'transparent',
            color:          p === page ? '#4285f4' : '#4b535e',
            fontSize:       13,
            fontWeight:     p === page ? 600 : 400,
            cursor:         'pointer',
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
        display:    'flex',
        alignItems: 'center',
        gap:        4,
        padding:    '4px 10px',
        border:     '1px solid #d9dce0',
        borderRadius: 6,
        background: 'transparent',
        fontSize:   13,
        fontWeight: 400,
        color:      disabled ? '#aab0b8' : '#4b535e',
        cursor:     disabled ? 'not-allowed' : 'pointer',
        opacity:    disabled ? 0.6 : 1,
      }}
    >
      {!iconAfter && icon}
      {label}
      {iconAfter && icon}
    </button>
  )
}

// ── Tag assign dropdown ────────────────────────────────────────────────────────

type TagDropView   = 'list' | 'addNew'
type BulkModalView = 'list' | 'createNew'

function TagAssignDropdown({
  articleTitle,
  articleTags,
  tagRegistry,
  tagStyleMap,
  anchorEl,
  view,
  search,
  newKey,
  newValue,
  newColor,
  onSearch,
  onToggleTag,
  onClear,
  onSwitchToAddNew,
  onNewKeyChange,
  onNewValueChange,
  onNewColorChange,
  onAddNewTag,
  onCancel,
  onClose,
}: {
  articleTitle: string
  articleTags: string[]
  tagRegistry: { key: string; dotBg: string; dotDashed?: boolean }[]
  tagStyleMap: Record<string, { bg: string; text: string }>
  anchorEl: HTMLTableCellElement | null
  view: TagDropView
  search: string
  newKey: string
  newValue: string
  newColor: string
  onSearch: (v: string) => void
  onToggleTag: (key: string) => void
  onClear: () => void
  onSwitchToAddNew: () => void
  onNewKeyChange: (v: string) => void
  onNewValueChange: (v: string) => void
  onNewColorChange: (v: string) => void
  onAddNewTag: () => void
  onCancel: () => void
  onClose: () => void
}) {
  const [mounted, setMounted] = useState(false)
  const [pos, setPos]         = useState<React.CSSProperties>({})
  const panelRef              = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  // Position below (or above) anchor cell, flipping if there isn't enough room
  const updatePos = useCallback(() => {
    if (!anchorEl) return
    const r      = anchorEl.getBoundingClientRect()
    const panelH = panelRef.current?.offsetHeight ?? 340
    const gap    = 4

    if (r.bottom + gap + panelH <= window.innerHeight) {
      setPos({ position: 'fixed', top: r.bottom + gap, left: r.left, zIndex: 9999 })
    } else {
      setPos({ position: 'fixed', top: Math.max(8, r.top - panelH - gap), left: r.left, zIndex: 9999 })
    }
  }, [anchorEl])

  useEffect(() => {
    if (!anchorEl) return
    updatePos()
    window.addEventListener('scroll', updatePos, true)
    window.addEventListener('resize', updatePos)
    return () => {
      window.removeEventListener('scroll', updatePos, true)
      window.removeEventListener('resize', updatePos)
    }
  }, [anchorEl, updatePos])

  // Recalculate after view changes (list vs addNew have different heights)
  useEffect(() => {
    requestAnimationFrame(updatePos)
  }, [view, updatePos])

  // Click outside to close
  useEffect(() => {
    if (!anchorEl) return
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
      if (anchorEl.contains(t) || panelRef.current?.contains(t)) return
      onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [anchorEl, onClose])

  // Escape to close
  useEffect(() => {
    if (!anchorEl) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [anchorEl, onClose])

  const filteredTags   = tagRegistry.filter(t => t.key.replace(':', ': ').toLowerCase().includes(search.toLowerCase()))
  const newTagKey      = newKey.trim() && newValue.trim() ? `${newKey.trim()}:${newValue.trim()}` : null
  const isDuplicate    = !!newTagKey && tagRegistry.some(t => t.key === newTagKey)
  const canAddNew      = !!newTagKey && !isDuplicate

  const PANEL_STYLE: React.CSSProperties = {
    width:        290,
    background:   '#ffffff',
    border:       '1px solid #eff1f3',
    borderRadius: 8,
    boxShadow:    '0px 4px 24px 0px rgba(5,3,38,0.08)',
    fontFamily:   'Mona Sans, system-ui, sans-serif',
    overflow:     'hidden',
  }

  const HEADER_STYLE: React.CSSProperties = {
    padding:      '8px 10px',
    borderBottom: '1px solid #eff1f3',
    fontSize:     10,
    fontWeight:   600,
    color:        '#021920',
    letterSpacing: '0.4px',
  }

  if (!mounted || !anchorEl) return null

  return createPortal(
    <div ref={panelRef} style={{ ...pos, ...PANEL_STYLE }} onClick={e => e.stopPropagation()}>

      {/* ── LIST VIEW ──────────────────────────────────────────── */}
      {view === 'list' && (<>

        {/* Header */}
        <div style={HEADER_STYLE}>
          Assign Tags to &ldquo;{articleTitle}&rdquo;
        </div>

        {/* Search */}
        <div style={{ padding: '6px 8px', borderBottom: '1px solid #eff1f3' }}>
          <div style={{
            display:     'flex',
            alignItems:  'center',
            gap:         6,
            background:  '#f5f7fa',
            borderRadius: 6,
            padding:     '5px 8px',
          }}>
            <MagnifyingGlassIcon size={13} color="#7a828c" style={{ flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => onSearch(e.target.value)}
              placeholder="Search tags…"
              style={{
                border:     'none',
                background: 'transparent',
                outline:    'none',
                fontSize:   12,
                color:      '#4b535e',
                width:      '100%',
              }}
            />
          </div>
        </div>

        {/* Tag list */}
        <div style={{ maxHeight: 220, overflowY: 'auto' }}>
          {filteredTags.length === 0 && (
            <div style={{ padding: '12px 10px', fontSize: 12, color: '#7a828c', textAlign: 'center' }}>
              No tags found
            </div>
          )}
          {filteredTags.map(tag => {
            const checked = articleTags.includes(tag.key)
            const s       = tagStyleMap[tag.key] ?? { bg: '#eff1f3', text: '#4b535e' }
            return (
              <div
                key={tag.key}
                onClick={() => onToggleTag(tag.key)}
                style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          8,
                  padding:      '7px 10px',
                  cursor:       'pointer',
                  background:   checked ? '#f0f5fe' : '#ffffff',
                  borderBottom: '1px solid #f5f7fa',
                }}
                onMouseEnter={e => { if (!checked) (e.currentTarget as HTMLDivElement).style.background = '#f5f7fa' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = checked ? '#f0f5fe' : '#ffffff' }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {}}
                  style={{ width: 13, height: 13, accentColor: '#4285f4', flexShrink: 0, cursor: 'pointer' }}
                />
                <div style={{
                  width:        10,
                  height:       10,
                  borderRadius: '50%',
                  background:   tag.dotDashed ? 'transparent' : tag.dotBg,
                  border:       tag.dotDashed ? '1.5px dashed #323840' : 'none',
                  flexShrink:   0,
                }} />
                <span style={{ fontSize: 12, color: '#4b535e', flex: 1 }}>
                  {tag.key.replace(':', ': ')}
                </span>
                {checked && <CheckIcon size={12} color="#4285f4" />}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{
          display:      'flex',
          alignItems:   'center',
          borderTop:    '1px solid #eff1f3',
        }}>
          <button
            onClick={onClear}
            style={{
              flex:        1,
              padding:     '9px 8px',
              border:      'none',
              background:  'transparent',
              cursor:      'pointer',
              fontSize:    12,
              fontWeight:  600,
              color:       '#3264b8',
              letterSpacing: '0.24px',
            }}
          >
            Clear
          </button>
          <span style={{ color: '#aab0b8', fontSize: 14 }}>|</span>
          <button
            onClick={onSwitchToAddNew}
            style={{
              flex:        1,
              padding:     '9px 8px',
              border:      'none',
              background:  'transparent',
              cursor:      'pointer',
              fontSize:    12,
              fontWeight:  600,
              color:       '#3264b8',
              letterSpacing: '0.24px',
            }}
          >
            Add New
          </button>
        </div>
      </>)}

      {/* ── ADD NEW VIEW ───────────────────────────────────────── */}
      {view === 'addNew' && (<>

        {/* Header */}
        <div style={HEADER_STYLE}>
          Assign Tags to &ldquo;{articleTitle}&rdquo;
        </div>

        {/* Form */}
        <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>

          {/* Key */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#021920', letterSpacing: '0.24px' }}>
              Key
            </label>
            <input
              value={newKey}
              onChange={e => onNewKeyChange(e.target.value)}
              placeholder="e.g.: audience"
              style={{
                padding:      8,
                border:       `1px solid ${newKey.trim() ? '#4285f4' : '#d9dce0'}`,
                borderRadius: 8,
                fontSize:     14,
                color:        '#4b535e',
                outline:      'none',
                background:   '#ffffff',
              }}
            />
          </div>

          {/* Value */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#021920', letterSpacing: '0.24px' }}>
              Value
            </label>
            <input
              value={newValue}
              onChange={e => onNewValueChange(e.target.value)}
              placeholder="e.g.: Internal"
              style={{
                padding:      8,
                border:       `1px solid ${newValue.trim() ? '#4285f4' : '#d9dce0'}`,
                borderRadius: 8,
                fontSize:     14,
                color:        '#4b535e',
                outline:      'none',
                background:   '#ffffff',
              }}
            />
          </div>

          {/* Duplicate warning */}
          {isDuplicate && (
            <p style={{ margin: 0, fontSize: 12, color: '#021920' }}>
              This key value pair already exist.
            </p>
          )}
        </div>

        {/* Color section header */}
        <div style={{
          padding:      '6px 10px',
          borderTop:    '1px solid #eff1f3',
          borderBottom: '1px solid #eff1f3',
          fontSize:     10,
          fontWeight:   600,
          letterSpacing: '0.4px',
          color:        '#021920',
        }}>
          Tag Color
        </div>

        {/* Color swatches */}
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '8px 10px',
        }}>
          {TAG_COLORS.map(c => {
            const isSelected = newColor === c.hex
            return (
              <button
                key={c.hex}
                onClick={() => onNewColorChange(c.hex)}
                title={c.hex}
                style={{
                  width:        22,
                  height:       22,
                  borderRadius: '50%',
                  border:       c.dashed ? '1.5px dashed #323840' : isSelected ? '2px solid #4285f4' : '2px solid transparent',
                  background:   c.dashed ? 'transparent' : c.hex,
                  cursor:       'pointer',
                  display:      'flex',
                  alignItems:   'center',
                  justifyContent: 'center',
                  padding:      0,
                  flexShrink:   0,
                  outline:      'none',
                  boxSizing:    'border-box',
                }}
              >
                {isSelected && (
                  <XIcon size={10} color={c.dashed ? '#323840' : '#4b535e'} weight="bold" />
                )}
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{
          display:    'flex',
          alignItems: 'center',
          borderTop:  '1px solid #eff1f3',
        }}>
          <button
            onClick={onCancel}
            style={{
              flex:        1,
              padding:     '9px 8px',
              border:      'none',
              background:  'transparent',
              cursor:      'pointer',
              fontSize:    12,
              fontWeight:  600,
              color:       '#3264b8',
              letterSpacing: '0.24px',
            }}
          >
            Cancel
          </button>
          <span style={{ color: '#aab0b8', fontSize: 14 }}>|</span>
          <button
            onClick={canAddNew ? onAddNewTag : undefined}
            style={{
              flex:        1,
              padding:     '9px 8px',
              border:      'none',
              background:  'transparent',
              cursor:      canAddNew ? 'pointer' : 'not-allowed',
              fontSize:    12,
              fontWeight:  600,
              color:       canAddNew ? '#3264b8' : '#aab0b8',
              letterSpacing: '0.24px',
            }}
          >
            Add New Tag
          </button>
        </div>
      </>)}

    </div>,
    document.body,
  )
}

// ── Bulk Tag Modal ─────────────────────────────────────────────────────────────

function BulkTagModal({
  mode,
  selectedCount,
  allTags,
  commonTags,
  checkedTags,
  onToggleTag,
  view,
  search,
  onSearch,
  createKey,
  createValue,
  createColor,
  onCreateKeyChange,
  onCreateValueChange,
  onCreateColorChange,
  onSwitchToCreateNew,
  onCommitNewTag,
  onCancelCreateNew,
  onApply,
  onClose,
}: {
  mode: 'add' | 'remove'
  selectedCount: number
  allTags: { key: string; dotBg: string; dotDashed?: boolean }[]
  commonTags: { key: string; dotBg: string; dotDashed?: boolean }[]
  checkedTags: Set<string>
  onToggleTag: (key: string) => void
  view: BulkModalView
  search: string
  onSearch: (v: string) => void
  createKey: string
  createValue: string
  createColor: string
  onCreateKeyChange: (v: string) => void
  onCreateValueChange: (v: string) => void
  onCreateColorChange: (v: string) => void
  onSwitchToCreateNew: () => void
  onCommitNewTag: () => void
  onCancelCreateNew: () => void
  onApply: () => void
  onClose: () => void
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!mounted) return null

  const isAdd        = mode === 'add'
  const tagList      = isAdd ? allTags : commonTags
  const filteredTags = isAdd
    ? tagList.filter(t => t.key.replace(':', ': ').toLowerCase().includes(search.toLowerCase()))
    : tagList

  const title    = isAdd ? 'Bulk Add Tags' : 'Bulk Remove Tags'
  const subtitle = isAdd
    ? `Add tags to ${selectedCount} selected article${selectedCount !== 1 ? 's' : ''}.`
    : 'Only tags that exist in ALL selected documents are shown.'
  const applyLabel = isAdd
    ? checkedTags.size > 0 ? `Add ${checkedTags.size} Tag${checkedTags.size !== 1 ? 's' : ''}` : 'Add Tags'
    : checkedTags.size > 0 ? `Remove ${checkedTags.size} Tag${checkedTags.size !== 1 ? 's' : ''}` : 'Remove Tags'

  const newTagFull  = createKey.trim() && createValue.trim() ? `${createKey.trim()}:${createValue.trim()}` : null
  const isDuplicate = !!newTagFull && allTags.some(t => t.key === newTagFull)
  const canCreate   = !!newTagFull && !isDuplicate

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(5,3,38,0.4)',
          zIndex: 10000,
        }}
      />

      {/* Modal card */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position:      'fixed',
          top:           '50%',
          left:          '50%',
          transform:     'translate(-50%, -50%)',
          zIndex:        10001,
          width:         492,
          maxWidth:      'calc(100vw - 32px)',
          background:    '#ffffff',
          borderRadius:  12,
          boxShadow:     '0px 8px 40px 0px rgba(5,3,38,0.16)',
          fontFamily:    'Mona Sans, system-ui, sans-serif',
          display:       'flex',
          flexDirection: 'column',
          maxHeight:     'calc(100vh - 64px)',
          overflow:      'hidden',
        }}
      >

        {/* ── Header ──────────────────────────────────────────── */}
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '16px 20px',
          borderBottom:   '1px solid #eff1f3',
          flexShrink:     0,
        }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#021920', lineHeight: '24px' }}>
            {title}
          </span>
          <button
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, border: 'none', borderRadius: 6,
              background: 'transparent', cursor: 'pointer', color: '#7a828c',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#eff1f3' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* ── LIST VIEW ───────────────────────────────────────── */}
        {view === 'list' && (<>

          {/* Subtitle */}
          <div style={{
            padding:      '12px 20px',
            borderBottom: '1px solid #eff1f3',
            fontSize:     13,
            color:        '#7a828c',
            lineHeight:   '20px',
            flexShrink:   0,
          }}>
            {subtitle}
          </div>

          {/* Search (add mode only) */}
          {isAdd && (
            <div style={{ padding: '8px 20px', borderBottom: '1px solid #eff1f3', flexShrink: 0 }}>
              <div style={{
                display:    'flex',
                alignItems: 'center',
                gap:        6,
                background: '#f5f7fa',
                borderRadius: 6,
                padding:    '6px 10px',
              }}>
                <MagnifyingGlassIcon size={14} color="#7a828c" style={{ flexShrink: 0 }} />
                <input
                  value={search}
                  onChange={e => onSearch(e.target.value)}
                  placeholder="Search existing tags…"
                  autoFocus
                  style={{
                    border: 'none', background: 'transparent', outline: 'none',
                    fontSize: 13, color: '#4b535e', width: '100%',
                  }}
                />
              </div>
            </div>
          )}

          {/* Tag list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredTags.length === 0 && !isAdd && (
              <div style={{ padding: '32px 20px', textAlign: 'center', fontSize: 13, color: '#7a828c' }}>
                No common tags across all selected articles.
              </div>
            )}
            {filteredTags.length === 0 && isAdd && (
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ fontSize: 13, color: '#7a828c' }}>No matches.</span>
                <button
                  onClick={onSwitchToCreateNew}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, color: '#3264b8', padding: 0,
                  }}
                >
                  <PlusCircleIcon size={15} />
                  Create New Tag
                </button>
              </div>
            )}
            {filteredTags.map(tag => {
              const checked = checkedTags.has(tag.key)
              return (
                <label
                  key={tag.key}
                  style={{
                    display:      'flex',
                    alignItems:   'center',
                    gap:          10,
                    padding:      '9px 20px',
                    cursor:       'pointer',
                    background:   checked ? '#f0f5fe' : '#ffffff',
                    borderBottom: '1px solid #f5f7fa',
                  }}
                  onMouseEnter={e => { if (!checked) (e.currentTarget as HTMLLabelElement).style.background = '#f5f7fa' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLLabelElement).style.background = checked ? '#f0f5fe' : '#ffffff' }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleTag(tag.key)}
                    style={{ width: 14, height: 14, accentColor: '#4285f4', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <div style={{
                    width:        10,
                    height:       10,
                    borderRadius: '50%',
                    background:   tag.dotDashed ? 'transparent' : tag.dotBg,
                    border:       tag.dotDashed ? '1.5px dashed #323840' : 'none',
                    flexShrink:   0,
                  }} />
                  <span style={{ fontSize: 13, color: '#4b535e', flex: 1, userSelect: 'none' }}>
                    {tag.key.replace(':', ': ')}
                  </span>
                  {checked && <CheckIcon size={13} color="#4285f4" />}
                </label>
              )
            })}
            {filteredTags.length > 0 && isAdd && (
              <div style={{ padding: '10px 20px', borderTop: '1px solid #eff1f3' }}>
                <button
                  onClick={onSwitchToCreateNew}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, color: '#3264b8', padding: 0,
                  }}
                >
                  <PlusCircleIcon size={15} />
                  Create New Tag
                </button>
              </div>
            )}
          </div>
        </>)}

        {/* ── CREATE NEW VIEW ─────────────────────────────────── */}
        {view === 'createNew' && (<>
          <div style={{
            padding:      '12px 20px',
            borderBottom: '1px solid #eff1f3',
            flexShrink:   0,
          }}>
            <button
              onClick={onCancelCreateNew}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                border: 'none', background: 'transparent', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, color: '#3264b8', padding: 0, marginBottom: 8,
              }}
            >
              ← Back to tags
            </button>
            <p style={{ margin: 0, fontSize: 13, color: '#7a828c', lineHeight: '20px' }}>
              Create a new tag and add it to all selected articles.
            </p>
          </div>

          <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#021920', letterSpacing: '0.24px' }}>Key</label>
              <input
                value={createKey}
                onChange={e => onCreateKeyChange(e.target.value)}
                placeholder="e.g.: audience"
                autoFocus
                style={{
                  padding: 8,
                  border: `1px solid ${createKey.trim() ? '#4285f4' : '#d9dce0'}`,
                  borderRadius: 8, fontSize: 14, color: '#4b535e', outline: 'none', background: '#ffffff',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#021920', letterSpacing: '0.24px' }}>Value</label>
              <input
                value={createValue}
                onChange={e => onCreateValueChange(e.target.value)}
                placeholder="e.g.: Internal"
                style={{
                  padding: 8,
                  border: `1px solid ${createValue.trim() ? '#4285f4' : '#d9dce0'}`,
                  borderRadius: 8, fontSize: 14, color: '#4b535e', outline: 'none', background: '#ffffff',
                }}
              />
            </div>
            {isDuplicate && (
              <p style={{ margin: 0, fontSize: 12, color: '#021920' }}>
                This key value pair already exists.
              </p>
            )}
            <div>
              <div style={{
                fontSize: 10, fontWeight: 600, letterSpacing: '0.4px',
                color: '#021920', textTransform: 'uppercase', marginBottom: 8,
              }}>
                Tag Color
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {TAG_COLORS.map(c => {
                  const isSelected = createColor === c.hex
                  return (
                    <button
                      key={c.hex}
                      onClick={() => onCreateColorChange(c.hex)}
                      title={c.hex}
                      style={{
                        width: 24, height: 24, borderRadius: '50%',
                        border: c.dashed ? '1.5px dashed #323840' : isSelected ? '2px solid #4285f4' : '2px solid transparent',
                        background: c.dashed ? 'transparent' : c.hex,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 0, flexShrink: 0, outline: 'none', boxSizing: 'border-box',
                      }}
                    >
                      {isSelected && <XIcon size={10} color={c.dashed ? '#323840' : '#4b535e'} weight="bold" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </>)}

        {/* ── Footer ──────────────────────────────────────────── */}
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'flex-end',
          gap:            8,
          padding:        '12px 20px',
          borderTop:      '1px solid #eff1f3',
          flexShrink:     0,
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px', border: '1px solid #d9dce0', borderRadius: 8,
              background: '#ffffff', fontSize: 13, fontWeight: 500, color: '#4b535e', cursor: 'pointer',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f5f7fa' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#ffffff' }}
          >
            Cancel
          </button>
          {view === 'list' && (
            <button
              onClick={checkedTags.size > 0 ? onApply : undefined}
              style={{
                padding:    '8px 16px',
                border:     'none',
                borderRadius: 8,
                background: checkedTags.size > 0 ? '#4285f4' : '#d9dce0',
                fontSize:   13,
                fontWeight: 600,
                color:      checkedTags.size > 0 ? '#ffffff' : '#aab0b8',
                cursor:     checkedTags.size > 0 ? 'pointer' : 'not-allowed',
              }}
            >
              {applyLabel}
            </button>
          )}
          {view === 'createNew' && (
            <button
              onClick={canCreate ? onCommitNewTag : undefined}
              style={{
                padding:    '8px 16px',
                border:     'none',
                borderRadius: 8,
                background: canCreate ? '#4285f4' : '#d9dce0',
                fontSize:   13,
                fontWeight: 600,
                color:      canCreate ? '#ffffff' : '#aab0b8',
                cursor:     canCreate ? 'pointer' : 'not-allowed',
              }}
            >
              Create &amp; Add Tag
            </button>
          )}
        </div>

      </div>
    </>,
    document.body,
  )
}

// ── Rename Article Modal ───────────────────────────────────────────────────────

function RenameArticleModal({
  article,
  onClose,
  onSave,
}: {
  article: Article
  onClose: () => void
  onSave: (newTitle: string) => void
}) {
  const [newName, setNewName] = useState(article.title)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const canSave = newName.trim().length > 0 && newName.trim() !== article.title

  function handleSave() {
    if (!canSave) return
    onSave(newName.trim())
    onClose()
  }

  if (!mounted) return null

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 1002,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: 8,
          width: 492,
          maxWidth: 'calc(100vw - 32px)',
          padding: 16,
          boxShadow: '0 4px 24px rgba(5,3,38,0.08)',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid #eff1f3', paddingBottom: 16, marginBottom: 0,
        }}>
          <span style={{ fontSize: 24, fontWeight: 400, color: '#021920' }}>Rename Article</span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a828c', display: 'flex', padding: 0 }}
          >
            <XIcon size={18} />
          </button>
        </div>

        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#4b535e', letterSpacing: '0.24px' }}>
              Current Name
            </label>
            <input
              disabled
              value={article.title}
              style={{
                width: '100%', padding: 8,
                background: '#eff1f3', border: '1px solid #d9dce0',
                borderRadius: 8, fontSize: 14, color: '#7a828c',
                boxSizing: 'border-box', outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#4b535e', letterSpacing: '0.24px' }}>
              * New Name
            </label>
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              style={{
                width: '100%', padding: 8,
                background: '#fff', border: '1px solid #4285f4',
                borderRadius: 8, fontSize: 14, color: '#021920',
                boxSizing: 'border-box', outline: 'none',
              }}
            />
          </div>
        </div>

        <div style={{
          borderTop: '1px solid #eff1f3', paddingTop: 16,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <button
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, color: '#3264b8',
            }}
          >
            <XCircleIcon size={16} />Cancel
          </button>
          <button
            onClick={canSave ? handleSave : undefined}
            disabled={!canSave}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#4285f4', border: '1px solid #689df6',
              color: '#eff1f3', padding: '8px 12px', borderRadius: 8,
              fontSize: 12, cursor: canSave ? 'pointer' : 'not-allowed',
              opacity: canSave ? 1 : 0.5,
            }}
          >
            <PlusCircleIcon size={16} />Save Changes
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Delete Article Modal ───────────────────────────────────────────────────────

function DeleteArticleModal({
  article,
  onClose,
  onConfirm,
}: {
  article: Article
  onClose: () => void
  onConfirm: () => void
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!mounted) return null

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 1002,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: 8,
          width: 492,
          maxWidth: 'calc(100vw - 32px)',
          padding: 16,
          boxShadow: '0 4px 24px rgba(5,3,38,0.08)',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid #eff1f3', paddingBottom: 16, marginBottom: 0,
        }}>
          <span style={{ fontSize: 24, fontWeight: 400, color: '#021920' }}>Delete Article</span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a828c', display: 'flex', padding: 0 }}
          >
            <XIcon size={18} />
          </button>
        </div>

        <div style={{ padding: 16 }}>
          <p style={{ margin: 0, fontSize: 14, color: '#4b535e', lineHeight: '20px' }}>
            Are you sure you want to delete &ldquo;{article.title}&rdquo;? This action cannot be undone.
          </p>
        </div>

        <div style={{
          borderTop: '1px solid #eff1f3', paddingTop: 16,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <button
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, color: '#3264b8',
            }}
          >
            <XCircleIcon size={16} />Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#ef2056', border: '1px solid #f45c82',
              color: '#ffffff', padding: '8px 12px', borderRadius: 8,
              fontSize: 12, cursor: 'pointer',
            }}
          >
            <TrashIcon size={16} />Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function CollapsibleFilterPage() {
  const [filtersOpen,   setFiltersOpen]   = useState(false)
  const [selectedRows,  setSelectedRows]  = useState<Set<string>>(new Set())
  const [actionsOpen,   setActionsOpen]   = useState(false)
  const [rowActionsId,  setRowActionsId]  = useState<string | null>(null)
  const [searchQuery,   setSearchQuery]   = useState('')
  const [page,          setPage]          = useState(1)
  const [sortCol,       setSortCol]       = useState<keyof Article | null>(null)
  const [sortDir,       setSortDir]       = useState<'asc' | 'desc'>('asc')
  const [activeKBs,     setActiveKBs]     = useState<Set<string>>(new Set())
  const [activeFolders, setActiveFolders] = useState<Set<string>>(new Set())
  const [activeTags,    setActiveTags]    = useState<Set<string>>(new Set())

  // Mutable data (articles + tag registry)
  const [articles,     setArticles]     = useState<Article[]>(ARTICLES)
  const [tagRegistry,  setTagRegistry]  = useState([...TAG_ITEMS])
  const [tagStyleMap,  setTagStyleMap]  = useState<Record<string, { bg: string; text: string }>>({ ...TAG_STYLE })

  // Tag-assign dropdown state
  const [tagDropId,    setTagDropId]    = useState<string | null>(null)
  const [tagDropView,  setTagDropView]  = useState<TagDropView>('list')
  const [tagSearch,    setTagSearch]    = useState('')
  const [newTagKey,    setNewTagKey]    = useState('')
  const [newTagValue,  setNewTagValue]  = useState('')
  const [newTagColor,  setNewTagColor]  = useState('#d6e2f5')

  // Bulk tag modal state
  const [bulkTagModal,    setBulkTagModal]    = useState<'add' | 'remove' | null>(null)
  const [bulkModalSearch, setBulkModalSearch] = useState('')
  const [bulkModalTags,   setBulkModalTags]   = useState<Set<string>>(new Set())
  const [bulkModalView,   setBulkModalView]   = useState<BulkModalView>('list')
  const [bulkCreateKey,   setBulkCreateKey]   = useState('')
  const [bulkCreateValue, setBulkCreateValue] = useState('')
  const [bulkCreateColor, setBulkCreateColor] = useState('#d6e2f5')

  // Bulk move modal state
  const [showBulkMove, setShowBulkMove] = useState(false)

  // Tag add / edit / delete modals
  const [showAddTagModal, setShowAddTagModal] = useState(false)
  const [editingTag,  setEditingTag]  = useState<string | null>(null)
  const [deletingTag, setDeletingTag] = useState<string | null>(null)

  // Document detail view
  const [activeArticle, setActiveArticle] = useState<Article | null>(null)

  // Article rename / delete modals
  const [renamingArticle,   setRenamingArticle]   = useState<Article | null>(null)
  const [deletingArticleId, setDeletingArticleId] = useState<string | null>(null)

  const actionsRef   = useRef<HTMLButtonElement>(null)
  const rowRefs      = useRef<Map<string, HTMLButtonElement>>(new Map())
  const tagCellRefs  = useRef<Map<string, HTMLTableCellElement>>(new Map())

  const allSelected  = selectedRows.size === articles.length
  const someSelected = selectedRows.size > 0 && !allSelected
  const bulkMode     = selectedRows.size > 0

  const toggleAll = useCallback(() => {
    setSelectedRows(prev =>
      prev.size === articles.length
        ? new Set()
        : new Set(articles.map(a => a.id))
    )
  }, [articles])

  const toggleRow = useCallback((id: string) => {
    setSelectedRows(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const handleSort = useCallback((col: keyof Article) => {
    setSortCol(prev => {
      if (prev === col) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); return col }
      setSortDir('asc'); return col
    })
  }, [])

  const clearSelection  = () => setSelectedRows(new Set())
  const toggleKB        = (kb: string) => setActiveKBs(prev    => { const n = new Set(prev); n.has(kb) ? n.delete(kb) : n.add(kb); return n })
  const toggleFolder    = (f: string)  => setActiveFolders(prev => { const n = new Set(prev); n.has(f)  ? n.delete(f)  : n.add(f);  return n })
  const toggleTag       = (t: string)  => setActiveTags(prev    => { const n = new Set(prev); n.has(t)  ? n.delete(t)  : n.add(t);  return n })
  const clearAllFilters = () => { setActiveKBs(new Set()); setActiveFolders(new Set()); setActiveTags(new Set()) }

  // ── Tag-assign handlers ──────────────────────────────────────────────────────
  const openTagDrop = (articleId: string) => {
    setTagDropId(articleId)
    setTagDropView('list')
    setTagSearch('')
    setNewTagKey('')
    setNewTagValue('')
    setNewTagColor('#d6e2f5')
  }

  const closeTagDrop = useCallback(() => setTagDropId(null), [])

  const toggleArticleTag = (articleId: string, tagKey: string) => {
    const article  = articles.find(a => a.id === articleId)
    const isAdding = article ? !article.tags.includes(tagKey) : true
    setArticles(prev => prev.map(a =>
      a.id !== articleId ? a : {
        ...a,
        tags: a.tags.includes(tagKey) ? a.tags.filter(t => t !== tagKey) : [...a.tags, tagKey],
      }
    ))
    if (isAdding) {
      setTimeout(() => toast.success('Tag assigned', { description: tagLabel(tagKey) }), 1000)
    } else {
      setTimeout(() => toast('Tag removed', { description: tagLabel(tagKey) }), 1000)
    }
  }

  const clearArticleTags = (articleId: string) => {
    setArticles(prev => prev.map(a => a.id !== articleId ? a : { ...a, tags: [] }))
  }

  const commitNewTag = (articleId: string) => {
    const key    = newTagKey.trim()
    const value  = newTagValue.trim()
    if (!key || !value) return
    const tagKey = `${key}:${value}`
    if (tagRegistry.some(t => t.key === tagKey)) return
    const isDashed   = newTagColor === 'dashed'
    const dotBg      = isDashed ? 'transparent' : newTagColor
    const chipBg     = isDashed ? '#eff1f3' : newTagColor
    const chipText   = '#4b535e'
    setTagRegistry(prev => [...prev, { key: tagKey, dotBg, dotDashed: isDashed || undefined }])
    setTagStyleMap(prev => ({ ...prev, [tagKey]: { bg: chipBg, text: chipText } }))
    setArticles(prev => prev.map(a =>
      a.id !== articleId ? a : { ...a, tags: a.tags.includes(tagKey) ? a.tags : [...a.tags, tagKey] }
    ))
    setTagDropView('list')
    setNewTagKey('')
    setNewTagValue('')
    setNewTagColor('#d6e2f5')
    setTimeout(() => toast.success('New tag created', { description: tagLabel(tagKey) }), 1000)
  }

  // ── Bulk tag modal handlers ──────────────────────────────────────────────────

  const closeBulkModal = useCallback(() => {
    setBulkTagModal(null)
    setBulkModalSearch('')
    setBulkModalTags(new Set())
    setBulkModalView('list')
    setBulkCreateKey('')
    setBulkCreateValue('')
    setBulkCreateColor('#d6e2f5')
  }, [])

  const openBulkAddTags = useCallback(() => {
    setBulkTagModal('add')
    setBulkModalSearch('')
    setBulkModalTags(new Set())
    setBulkModalView('list')
    setBulkCreateKey('')
    setBulkCreateValue('')
    setBulkCreateColor('#d6e2f5')
  }, [])

  const openBulkRemoveTags = useCallback(() => {
    setBulkTagModal('remove')
    setBulkModalSearch('')
    setBulkModalTags(new Set())
    setBulkModalView('list')
  }, [])

  const toggleBulkModalTag = useCallback((key: string) => {
    setBulkModalTags(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }, [])

  const commitBulkNewTag = useCallback(() => {
    const key    = bulkCreateKey.trim()
    const value  = bulkCreateValue.trim()
    if (!key || !value) return
    const tagKey = `${key}:${value}`
    if (tagRegistry.some(t => t.key === tagKey)) return
    const isDashed = bulkCreateColor === 'dashed'
    const dotBg    = isDashed ? 'transparent' : bulkCreateColor
    const chipBg   = isDashed ? '#eff1f3' : bulkCreateColor
    setTagRegistry(prev => [...prev, { key: tagKey, dotBg, dotDashed: isDashed || undefined }])
    setTagStyleMap(prev => ({ ...prev, [tagKey]: { bg: chipBg, text: '#4b535e' } }))
    setArticles(prev => prev.map(a =>
      !selectedRows.has(a.id) ? a : { ...a, tags: a.tags.includes(tagKey) ? a.tags : [...a.tags, tagKey] }
    ))
    const n = selectedRows.size
    setTimeout(() => toast.success('New tag created', { description: `Added to ${n} article${n !== 1 ? 's' : ''}` }), 1000)
    closeBulkModal()
  }, [bulkCreateKey, bulkCreateValue, bulkCreateColor, tagRegistry, selectedRows, closeBulkModal])

  const applyBulkAddTags = useCallback(() => {
    setArticles(prev => prev.map(a =>
      !selectedRows.has(a.id) ? a : { ...a, tags: [...new Set([...a.tags, ...bulkModalTags])] }
    ))
    const articles = selectedRows.size
    const tags     = bulkModalTags.size
    setTimeout(() => toast.success(`Tags added to ${articles} article${articles !== 1 ? 's' : ''}`, {
      description: `${tags} tag${tags !== 1 ? 's' : ''} applied`,
    }), 1000)
    closeBulkModal()
  }, [bulkModalTags, selectedRows, closeBulkModal])

  const applyBulkRemoveTags = useCallback(() => {
    setArticles(prev => prev.map(a =>
      !selectedRows.has(a.id) ? a : { ...a, tags: a.tags.filter(t => !bulkModalTags.has(t)) }
    ))
    const articles = selectedRows.size
    const tags     = bulkModalTags.size
    setTimeout(() => toast(`Tags removed from ${articles} article${articles !== 1 ? 's' : ''}`, {
      description: `${tags} tag${tags !== 1 ? 's' : ''} removed`,
    }), 1000)
    closeBulkModal()
  }, [bulkModalTags, selectedRows, closeBulkModal])

  const handleAddNewTag = useCallback((tagKey: string, color: string) => {
    const isDashed = color === 'dashed'
    const dotBg    = isDashed ? 'transparent' : color
    const chipBg   = isDashed ? '#eff1f3'     : color
    setTagRegistry(prev => [...prev, { key: tagKey, dotBg, dotDashed: isDashed || undefined }])
    setTagStyleMap(prev => ({ ...prev, [tagKey]: { bg: chipBg, text: '#4b535e' } }))
    setShowAddTagModal(false)
  }, [])

  const handleSaveEditTag = useCallback((oldKey: string, newKey: string, newColor: string) => {
    const isDashed = newColor === 'dashed'
    const dotBg    = isDashed ? 'transparent' : newColor
    const chipBg   = isDashed ? '#eff1f3'     : newColor
    setTagRegistry(prev => prev.map(t =>
      t.key === oldKey ? { key: newKey, dotBg, dotDashed: isDashed || undefined } : t
    ))
    setTagStyleMap(prev => {
      const next = { ...prev, [newKey]: { bg: chipBg, text: prev[oldKey]?.text ?? '#4b535e' } }
      if (oldKey !== newKey) delete next[oldKey]
      return next
    })
    setArticles(prev => prev.map(a => ({ ...a, tags: a.tags.map(t => t === oldKey ? newKey : t) })))
    setActiveTags(prev => {
      if (!prev.has(oldKey)) return prev
      const next = new Set(prev); next.delete(oldKey); next.add(newKey); return next
    })
    setEditingTag(null)
  }, [])

  const handleConfirmDeleteTag = useCallback((key: string) => {
    setTagRegistry(prev => prev.filter(t => t.key !== key))
    setTagStyleMap(prev => { const next = { ...prev }; delete next[key]; return next })
    setArticles(prev => prev.map(a => ({ ...a, tags: a.tags.filter(t => t !== key) })))
    setActiveTags(prev => { if (!prev.has(key)) return prev; const next = new Set(prev); next.delete(key); return next })
    setDeletingTag(null)
  }, [])

  const handleRenameArticle = useCallback((article: Article, newTitle: string) => {
    setArticles(prev => prev.map(a => a.id === article.id ? { ...a, title: newTitle } : a))
    setRenamingArticle(null)
    toast.success('Article renamed', { description: newTitle })
  }, [])

  const handleDeleteArticle = useCallback((articleId: string) => {
    setArticles(prev => prev.filter(a => a.id !== articleId))
    setDeletingArticleId(null)
    toast('Article deleted')
  }, [])

  const buildRowActionSections = useCallback((article: Article): DropdownSection[] => [
    {
      heading: 'File Management',
      items: [
        {
          label: 'Rename',
          icon: <ArticleIcon size={14} />,
          onClick: () => setRenamingArticle(article),
        },
        {
          label: 'Edit Article',
          icon: <PencilSimpleIcon size={14} />,
          onClick: () => setActiveArticle(article),
        },
        {
          label: 'Replace Article',
          icon: <UploadSimpleIcon size={14} />,
          onClick: () => {},
        },
        {
          label: 'Delete',
          icon: <TrashIcon size={14} />,
          danger: true,
          onClick: () => setDeletingArticleId(article.id),
        },
      ],
    },
  ], [])

  const commonTagKeys = useMemo(() => {
    const sel = articles.filter(a => selectedRows.has(a.id))
    if (sel.length === 0) return []
    return tagRegistry.filter(t => sel.every(a => a.tags.includes(t.key)))
  }, [articles, selectedRows, tagRegistry])

  const ROWS_PER_PAGE = 10

  const filteredArticles = useMemo(() => {
    const filtered = articles.filter(article => {
      if (activeKBs.size > 0 && !activeKBs.has(article.kb)) return false
      if (activeFolders.size > 0 && !activeFolders.has(article.folder)) return false
      if (activeTags.size > 0 && !article.tags.some(t => activeTags.has(t))) return false
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase()
        if (!article.title.toLowerCase().includes(q)) return false
      }
      return true
    })

    if (!sortCol) return filtered

    return [...filtered].sort((a, b) => {
      const aVal = sortCol === 'tags' ? (a.tags[0] ?? '') : String(a[sortCol])
      const bVal = sortCol === 'tags' ? (b.tags[0] ?? '') : String(b[sortCol])
      const cmp  = aVal.localeCompare(bVal)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [articles, activeKBs, activeFolders, activeTags, searchQuery, sortCol, sortDir])

  useEffect(() => { setPage(1) }, [activeKBs, activeFolders, activeTags, searchQuery])

  const totalPages   = Math.max(1, Math.ceil(filteredArticles.length / ROWS_PER_PAGE))
  const pagedArticles = filteredArticles.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)

  const actionSections: DropdownSection[] = [
    {
      heading: 'Knowledge Base',
      items: [
        { label: 'Add New Article',  icon: <PlusCircleIcon size={14} /> },
        { label: 'Upload Files',     icon: <UploadSimpleIcon size={14} /> },
        { label: 'Add New Folder',   icon: <FolderPlusIcon size={14} /> },
        { label: 'Manage Folders',   icon: <FoldersIcon size={14} /> },
      ],
    },
    {
      heading: 'Settings',
      items: [
        { label: 'Edit Knowledge Base', icon: <PencilSimpleIcon size={14} /> },
        { label: 'Sync Articles',       icon: <PlugsConnectedIcon size={14} /> },
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
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, background: '#f8f9fb' }}>

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
                flex:       1,
                border:     'none',
                outline:    'none',
                fontSize:   13,
                color:      '#021920',
                background: 'transparent',
              }}
            />
          </div>

          {/* Actions button */}
          <button
            ref={actionsRef}
            onClick={() => setActionsOpen(v => !v)}
            style={{
              display:     'flex',
              alignItems:  'center',
              gap:         6,
              padding:     '7px 14px',
              border:      '1px solid #d9dce0',
              borderRadius: 8,
              background:  actionsOpen ? '#f5f7fa' : '#ffffff',
              fontSize:    13,
              fontWeight:  500,
              color:       '#021920',
              cursor:      'pointer',
            }}
          >
            Actions
            <CaretDownIcon
              size={12}
              style={{ transition: 'transform 0.15s', transform: actionsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
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
          onClearAll={clearAllFilters}
          tagItems={tagRegistry}
          onNewTag={() => setShowAddTagModal(true)}
          onEditTag={key => setEditingTag(key)}
          onDeleteTag={key => setDeletingTag(key)}
        />

        {/* Table area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#ffffff' }}>

          {/* Bulk Actions Panel */}
          {bulkMode && (
            <div style={{
              display:     'flex',
              alignItems:  'center',
              gap:         8,
              padding:     8,
              margin:      '8px 12px',
              background:  '#eff1f3',
              borderRadius: 8,
              flexShrink:  0,
            }}>
              <span style={{
                fontSize:   14,
                fontWeight: 600,
                color:      '#021920',
                lineHeight: '20px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}>
                Bulk Actions: [{selectedRows.size}]
              </span>

              <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'space-between', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <BulkBtn icon={<StackPlusIcon size={16} />}  label="Add Tags"    onClick={openBulkAddTags} />
                  <BulkBtn icon={<StackMinusIcon size={16} />} label="Remove Tags" onClick={openBulkRemoveTags} />
                  <BulkBtn icon={<FolderOpenIcon size={16} />} label="Move to Folder" onClick={() => setShowBulkMove(true)} />
                  <BulkBtn icon={<FolderMinusIcon size={16} />} label="Remove Association" />
                  <BulkBtn icon={<TrashIcon size={16} />}      label="Delete" />
                </div>
                <BulkBtn icon={<XCircleIcon size={16} />} label="Clear" onClick={clearSelection} />
              </div>
            </div>
          )}

          {/* Table */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, tableLayout: 'auto' }}>
              <thead>
                <tr style={{ background: '#f8f9fb', borderBottom: '1px solid #eff1f3' }}>
                  <Th style={{ width: 40, paddingLeft: 16 }}>
                    <Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
                  </Th>
                  <ThSort label="Article Title"  col="title"      sortCol={sortCol} sortDir={sortDir} onSort={handleSort} style={{ minWidth: 200 }} />
                  <ThSort label="Knowledge Base" col="kb"         sortCol={sortCol} sortDir={sortDir} onSort={handleSort} style={{ width: 140 }} />
                  <ThSort label="Folder"         col="folder"     sortCol={sortCol} sortDir={sortDir} onSort={handleSort} style={{ width: 140 }} />
                  <ThSort label="Tags"           col="tags"       sortCol={sortCol} sortDir={sortDir} onSort={handleSort} style={{ minWidth: 160 }} />
                  <ThSort label="Last Updated"   col="modified"   sortCol={sortCol} sortDir={sortDir} onSort={handleSort} style={{ width: 130 }} />
                  <ThSort label="Modified By"    col="modifiedBy" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} style={{ width: 130 }} />
                  <Th style={{ width: 48 }} />
                </tr>
              </thead>
              <tbody>
                {filteredArticles.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '32px 0', color: '#7a828c', fontSize: 13 }}>
                      No articles match the active filters.
                    </td>
                  </tr>
                )}
                {pagedArticles.map((article, idx) => {
                  const isSelected = selectedRows.has(article.id)
                  return (
                    <tr
                      key={article.id}
                      style={{
                        background:   isSelected ? '#f0f5fe' : idx % 2 === 0 ? '#ffffff' : '#fafbfc',
                        borderBottom: '1px solid #eff1f3',
                      }}
                    >
                      <Td style={{ width: 40, paddingLeft: 16 }}>
                        <Checkbox checked={isSelected} onChange={() => toggleRow(article.id)} />
                      </Td>
                      <Td>
                        <button
                          onClick={() => setActiveArticle(article)}
                          style={{
                            background:     'none',
                            border:         'none',
                            padding:        0,
                            font:           'inherit',
                            color:          '#3264b8',
                            fontWeight:     500,
                            cursor:         'pointer',
                            textDecoration: 'none',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.textDecoration = 'underline' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.textDecoration = 'none' }}
                        >
                          {article.title}
                        </button>
                      </Td>
                      <Td style={{ color: '#4b535e' }}>{article.kb}</Td>
                      <Td style={{ color: '#7a828c' }}>{article.folder}</Td>
                      <td
                        ref={el => {
                          if (el) tagCellRefs.current.set(article.id, el)
                          else    tagCellRefs.current.delete(article.id)
                        }}
                        onClick={() => openTagDrop(article.id)}
                        style={{
                          padding:    '0 12px',
                          cursor:     'pointer',
                          background: tagDropId === article.id ? '#f0f5fe' : 'inherit',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'nowrap' }}>
                          {article.tags.slice(0, 2).map(tag => (
                            <span key={tag} style={{ fontSize: 12, color: '#4285f4', whiteSpace: 'nowrap' }}>
                              {tagLabel(tag)}
                            </span>
                          ))}
                          {article.tags.length > 2 && (
                            <span style={{ fontSize: 12, color: '#4285f4', whiteSpace: 'nowrap' }}>
                              +{article.tags.length - 2} more
                            </span>
                          )}
                          {article.tags.length === 0 && (
                            <span style={{ fontSize: 12, color: '#aab0b8' }}>Add tag…</span>
                          )}
                        </div>

                        {tagDropId === article.id && (
                          <TagAssignDropdown
                            articleTitle={article.title}
                            articleTags={article.tags}
                            tagRegistry={tagRegistry}
                            tagStyleMap={tagStyleMap}
                            anchorEl={tagCellRefs.current.get(article.id) ?? null}
                            view={tagDropView}
                            search={tagSearch}
                            newKey={newTagKey}
                            newValue={newTagValue}
                            newColor={newTagColor}
                            onSearch={setTagSearch}
                            onToggleTag={key => toggleArticleTag(article.id, key)}
                            onClear={() => clearArticleTags(article.id)}
                            onSwitchToAddNew={() => setTagDropView('addNew')}
                            onNewKeyChange={setNewTagKey}
                            onNewValueChange={setNewTagValue}
                            onNewColorChange={setNewTagColor}
                            onAddNewTag={() => commitNewTag(article.id)}
                            onCancel={() => setTagDropView('list')}
                            onClose={closeTagDrop}
                          />
                        )}
                      </td>
                      <Td style={{ color: '#7a828c', whiteSpace: 'nowrap' }}>{article.modified}</Td>
                      <Td style={{ color: '#7a828c', whiteSpace: 'nowrap' }}>{article.modifiedBy}</Td>
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
                            width:          28,
                            height:         28,
                            border:         'none',
                            borderRadius:   6,
                            background:     rowActionsId === article.id ? '#eff1f3' : 'transparent',
                            cursor:         'pointer',
                            color:          '#7a828c',
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
                          sections={buildRowActionSections(article)}
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

          <Pagination page={page} total={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
      {bulkTagModal && (
        <BulkTagModal
          mode={bulkTagModal}
          selectedCount={selectedRows.size}
          allTags={tagRegistry}
          commonTags={commonTagKeys}
          checkedTags={bulkModalTags}
          onToggleTag={toggleBulkModalTag}
          view={bulkModalView}
          search={bulkModalSearch}
          onSearch={setBulkModalSearch}
          createKey={bulkCreateKey}
          createValue={bulkCreateValue}
          createColor={bulkCreateColor}
          onCreateKeyChange={setBulkCreateKey}
          onCreateValueChange={setBulkCreateValue}
          onCreateColorChange={setBulkCreateColor}
          onSwitchToCreateNew={() => setBulkModalView('createNew')}
          onCommitNewTag={commitBulkNewTag}
          onCancelCreateNew={() => setBulkModalView('list')}
          onApply={bulkTagModal === 'add' ? applyBulkAddTags : applyBulkRemoveTags}
          onClose={closeBulkModal}
        />
      )}
      {activeArticle && (
        <DocumentView article={activeArticle} onBack={() => setActiveArticle(null)} />
      )}
      {showBulkMove && (
        <BulkMoveModal
          articles={articles.filter(a => selectedRows.has(a.id))}
          onClose={() => setShowBulkMove(false)}
          onConfirm={(folder, fullPath) => {
            setArticles(prev => prev.map(a =>
              selectedRows.has(a.id) ? { ...a, folder } : a
            ))
            clearSelection()
            setShowBulkMove(false)
            setTimeout(() => toast(`${selectedRows.size} article${selectedRows.size !== 1 ? 's' : ''} moved to ${folder}`, {
              description: fullPath,
            }), 1000)
          }}
        />
      )}
      {renamingArticle && (
        <RenameArticleModal
          article={renamingArticle}
          onClose={() => setRenamingArticle(null)}
          onSave={(newTitle) => handleRenameArticle(renamingArticle, newTitle)}
        />
      )}
      {deletingArticleId && (() => {
        const article = articles.find(a => a.id === deletingArticleId)
        return article ? (
          <DeleteArticleModal
            article={article}
            onClose={() => setDeletingArticleId(null)}
            onConfirm={() => handleDeleteArticle(deletingArticleId)}
          />
        ) : null
      })()}
      {showAddTagModal && (
        <AddTagModal
          existingKeys={tagRegistry.map(t => t.key)}
          onSave={handleAddNewTag}
          onClose={() => setShowAddTagModal(false)}
        />
      )}
      {editingTag && (
        <EditTagModal
          tagKey={editingTag}
          initialColor={(() => {
            const entry = tagRegistry.find(t => t.key === editingTag)
            return entry?.dotDashed ? 'dashed' : (entry?.dotBg ?? '#d6e2f5')
          })()}
          onSave={(newKey, newColor) => handleSaveEditTag(editingTag, newKey, newColor)}
          onClose={() => setEditingTag(null)}
        />
      )}
      {deletingTag && (
        <DeleteTagModal
          tagKey={deletingTag}
          onConfirm={() => handleConfirmDeleteTag(deletingTag)}
          onClose={() => setDeletingTag(null)}
        />
      )}
      <Toaster position="top-right" />
    </SandboxShell>
  )
}

// ── Small helpers ──────────────────────────────────────────────────────────────

// ── Add Tag Modal ──────────────────────────────────────────────────────────────

function AddTagModal({
  existingKeys,
  onSave,
  onClose,
}: {
  existingKeys: string[]
  onSave: (tagKey: string, color: string) => void
  onClose: () => void
}) {
  const [keyInput,   setKeyInput]   = useState('')
  const [valueInput, setValueInput] = useState('')
  const [color,      setColor]      = useState('#d6e2f5')
  const [mounted,    setMounted]    = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const newKey     = keyInput.trim() && valueInput.trim() ? `${keyInput.trim()}:${valueInput.trim()}` : null
  const isDuplicate = !!newKey && existingKeys.includes(newKey)
  const canSave     = !!newKey && !isDuplicate

  const FIELD_STYLE: React.CSSProperties = {
    width: '100%', padding: '10px 12px',
    border: '1px solid #d9dce0', borderRadius: 8,
    fontSize: 13, color: '#021920', background: '#fff',
    outline: 'none', boxSizing: 'border-box',
  }

  const LABEL_STYLE: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: '#021920',
    letterSpacing: '0.4px', textTransform: 'uppercase', marginBottom: 6, display: 'block',
  }

  if (!mounted) return null

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: 'rgba(5,3,38,0.32)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 12, width: 540,
          boxShadow: '0px 8px 32px rgba(5,3,38,0.16)', overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px' }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: '#021920' }}>Create Tag</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a828c', display: 'flex' }}>
            <XIcon size={18} />
          </button>
        </div>

        {/* Form */}
        <div style={{ margin: '0 24px 20px', background: '#f8f9fb', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={LABEL_STYLE}>* Key</label>
            <input
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              placeholder="e.g. Audience"
              style={FIELD_STYLE}
            />
          </div>
          <div>
            <label style={LABEL_STYLE}>* Value</label>
            <input
              value={valueInput}
              onChange={e => setValueInput(e.target.value)}
              placeholder="e.g. Global"
              style={FIELD_STYLE}
            />
          </div>
          {isDuplicate && (
            <p style={{ margin: 0, fontSize: 12, color: '#ef2056' }}>
              A tag with this key and value already exists.
            </p>
          )}
        </div>

        {/* Color picker */}
        <div style={{ padding: '0 24px 20px' }}>
          <span style={LABEL_STYLE}>Color</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TAG_COLORS.map(({ hex, dashed }) => {
              const val      = dashed ? 'dashed' : hex
              const selected = color === val
              return (
                <button
                  key={val}
                  onClick={() => setColor(val)}
                  style={{
                    width: 24, height: 24, borderRadius: '50%', cursor: 'pointer',
                    background: dashed ? 'transparent' : hex,
                    border: selected ? '2px solid #4285f4' : dashed ? '1px dashed #7a828c' : '2px solid transparent',
                    outline: selected ? '2px solid #4285f4' : 'none',
                    outlineOffset: 2, boxSizing: 'border-box',
                  }}
                />
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 1, borderTop: '1px solid #eff1f3', padding: '12px 24px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 8px', background: 'none', border: 'none',
              cursor: 'pointer', fontSize: 13, color: '#4b535e',
            }}
          >
            <XCircleIcon size={14} />Cancel
          </button>
          <span style={{ color: '#d9dce0', fontSize: 14 }}>|</span>
          <button
            onClick={canSave ? () => onSave(newKey!, color) : undefined}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 8px', background: 'none', border: 'none',
              cursor: canSave ? 'pointer' : 'not-allowed', fontSize: 13,
              color: canSave ? '#4285f4' : '#aab0b8', fontWeight: 500,
            }}
          >
            <PlusCircleIcon size={14} />Create Tag
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Edit Tag Modal ─────────────────────────────────────────────────────────────

function EditTagModal({
  tagKey,
  initialColor,
  onSave,
  onClose,
}: {
  tagKey: string
  initialColor: string
  onSave: (newKey: string, newColor: string) => void
  onClose: () => void
}) {
  const [keyParts] = tagKey.split(':')
  const valuePart  = tagKey.slice(keyParts.length + 1)

  const [keyInput,   setKeyInput]   = useState(keyParts)
  const [valueInput, setValueInput] = useState(valuePart)
  const [color,      setColor]      = useState(initialColor)
  const [mounted,    setMounted]    = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const newKey   = keyInput.trim() && valueInput.trim() ? `${keyInput.trim()}:${valueInput.trim()}` : null
  const canSave  = !!newKey

  function handleSave() {
    if (!newKey) return
    onSave(newKey, color)
  }

  const FIELD_STYLE: React.CSSProperties = {
    width: '100%', padding: '10px 12px',
    border: '1px solid #d9dce0', borderRadius: 8,
    fontSize: 13, color: '#021920', background: '#fff',
    outline: 'none', boxSizing: 'border-box',
  }

  const LABEL_STYLE: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: '#021920',
    letterSpacing: '0.4px', textTransform: 'uppercase', marginBottom: 6, display: 'block',
  }

  if (!mounted) return null

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: 'rgba(5,3,38,0.32)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 12, width: 540,
          boxShadow: '0px 8px 32px rgba(5,3,38,0.16)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px' }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: '#021920' }}>Edit Tag</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a828c', display: 'flex' }}>
            <XIcon size={18} />
          </button>
        </div>

        {/* Form */}
        <div style={{ margin: '0 24px 20px', background: '#f8f9fb', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={LABEL_STYLE}>* Key</label>
            <input
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              placeholder="e.g. audience"
              style={FIELD_STYLE}
            />
          </div>
          <div>
            <label style={LABEL_STYLE}>* Value</label>
            <input
              value={valueInput}
              onChange={e => setValueInput(e.target.value)}
              placeholder="e.g. External"
              style={FIELD_STYLE}
            />
          </div>
        </div>

        {/* Color picker */}
        <div style={{ padding: '0 24px 20px' }}>
          <span style={LABEL_STYLE}>Color</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TAG_COLORS.map(({ hex, dashed }) => {
              const val      = dashed ? 'dashed' : hex
              const selected = color === val
              return (
                <button
                  key={val}
                  onClick={() => setColor(val)}
                  style={{
                    width: 24, height: 24, borderRadius: '50%', cursor: 'pointer',
                    background: dashed ? 'transparent' : hex,
                    border: selected
                      ? '2px solid #4285f4'
                      : dashed ? '1px dashed #7a828c' : '2px solid transparent',
                    outline: selected ? '2px solid #4285f4' : 'none',
                    outlineOffset: 2,
                    boxSizing: 'border-box',
                  }}
                />
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', gap: 1, borderTop: '1px solid #eff1f3',
          padding: '12px 24px',
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 8px', background: 'none', border: 'none',
              cursor: 'pointer', fontSize: 13, color: '#4b535e',
            }}
          >
            <XCircleIcon size={14} />Cancel
          </button>
          <span style={{ color: '#d9dce0', fontSize: 14 }}>|</span>
          <button
            onClick={canSave ? handleSave : undefined}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 8px', background: 'none', border: 'none',
              cursor: canSave ? 'pointer' : 'not-allowed', fontSize: 13,
              color: canSave ? '#4285f4' : '#aab0b8', fontWeight: 500,
            }}
          >
            <PlusCircleIcon size={14} />Save Changes
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Delete Tag Modal ───────────────────────────────────────────────────────────

function DeleteTagModal({
  tagKey,
  onConfirm,
  onClose,
}: {
  tagKey: string
  onConfirm: () => void
  onClose: () => void
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!mounted) return null

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: 'rgba(5,3,38,0.32)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 12, width: 540,
          boxShadow: '0px 8px 32px rgba(5,3,38,0.16)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px' }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: '#021920' }}>Delete Tag</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a828c', display: 'flex' }}>
            <XIcon size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '0 24px 24px' }}>
          <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600, color: '#021920' }}>
            Are you sure you want to delete the tag &ldquo;{tagLabel(tagKey)}&rdquo;?
          </p>
          <p style={{ margin: 0, fontSize: 13, color: '#7a828c' }}>
            This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #eff1f3', display: 'flex', gap: 1, padding: '12px 24px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 8px', background: 'none', border: 'none',
              cursor: 'pointer', fontSize: 13, color: '#4b535e',
            }}
          >
            <XCircleIcon size={14} />Cancel
          </button>
          <span style={{ color: '#d9dce0', fontSize: 14 }}>|</span>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 8px', background: 'none', border: 'none',
              cursor: 'pointer', fontSize: 13, color: '#4285f4', fontWeight: 500,
            }}
          >
            <TrashIcon size={14} />Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ── Small table helpers ────────────────────────────────────────────────────────

function Th({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <th style={{
      padding:       '10px 12px',
      textAlign:     'left',
      fontSize:      11,
      fontWeight:    600,
      color:         '#7a828c',
      letterSpacing: '0.4px',
      textTransform: 'uppercase',
      whiteSpace:    'nowrap',
      ...style,
    }}>
      {children}
    </th>
  )
}

function ThSort({ label, col, sortCol, sortDir, onSort, style }: {
  label: string
  col: keyof Article
  sortCol: keyof Article | null
  sortDir: 'asc' | 'desc'
  onSort: (col: keyof Article) => void
  style?: React.CSSProperties
}) {
  const active = sortCol === col
  const Icon   = active ? (sortDir === 'asc' ? ArrowUpIcon : ArrowDownIcon) : ArrowsDownUpIcon
  return (
    <th
      onClick={() => onSort(col)}
      style={{
        padding:       '10px 12px',
        textAlign:     'left',
        fontSize:      11,
        fontWeight:    600,
        color:         active ? '#021920' : '#7a828c',
        letterSpacing: '0.4px',
        textTransform: 'uppercase',
        whiteSpace:    'nowrap',
        cursor:        'pointer',
        userSelect:    'none',
        ...style,
      }}
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {label}
        <Icon size={11} color={active ? '#4285f4' : '#aab0b8'} />
      </div>
    </th>
  )
}

function Td({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <td style={{
      padding:    '10px 12px',
      fontSize:   13,
      color:      '#4b535e',
      lineHeight: '20px',
      ...style,
    }}>
      {children}
    </td>
  )
}

function BulkBtn({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display:       'flex',
        alignItems:    'center',
        gap:           8,
        padding:       8,
        border:        'none',
        borderRadius:  8,
        background:    'transparent',
        cursor:        'pointer',
        fontSize:      12,
        fontWeight:    600,
        color:         '#3264b8',
        letterSpacing: '0.24px',
        lineHeight:    '20px',
        whiteSpace:    'nowrap',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(50,100,184,0.08)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
    >
      <span style={{ flexShrink: 0, color: '#3264b8', display: 'flex' }}>{icon}</span>
      {label}
    </button>
  )
}
