'use client'

import { useState, useRef, useEffect } from 'react'
import {
  ArrowLeftIcon,
  DownloadSimpleIcon,
  TrashIcon,
  FloppyDiskIcon,
  UploadSimpleIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  XIcon,
  XCircleIcon,
  ArrowsLeftRightIcon,
  UserIcon,
  CalendarIcon,
} from '@phosphor-icons/react'
import { MarkdownEditor } from './MarkdownEditor'
import { TagPanel } from './TagPanel'
import { toast } from '@/components/ui/toast'

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

interface DocumentViewProps {
  article: Article
  onBack: () => void
}

// ── Data ───────────────────────────────────────────────────────────────────────

const FOLDER_LIST = [
  'Development', 'Security', 'Architecture', 'HR & People', 'Strategy',
  'Support', 'Campaigns', 'Brand Assets', 'Reports', 'Compliance', 'Procurement',
]

const TAG_STYLE: Record<string, { bg: string; text: string }> = {
  'access:Public':       { bg: '#f792ac', text: '#8b1a2a' },
  'access:Confidential': { bg: '#fbc6d4', text: '#8b1a2a' },
  'dep:Product':         { bg: '#d6e2f5', text: '#1a3d6b' },
  'dep:Marketing':       { bg: '#d6e2f5', text: '#1a3d6b' },
  'dep:Finance':         { bg: '#d6e2f5', text: '#1a3d6b' },
  'dep:Engineering':     { bg: '#d6e2f5', text: '#1a3d6b' },
  'dep:Legal':           { bg: '#d6e2f5', text: '#1a3d6b' },
  'status:Deprecated':   { bg: '#a4beea', text: '#1a3d6b' },
  'status:Archived':     { bg: '#d6e2f5', text: '#1a3d6b' },
  'priority:High':       { bg: '#ddf4d2', text: '#1a6b1a' },
  'priority:Urgent':     { bg: '#b5e89c', text: '#1a6b1a' },
  'audience:Internal':   { bg: '#fbeed8', text: '#7a4a00' },
  'audience:External':   { bg: '#f1c780', text: '#7a4a00' },
}

const DEFAULT_TAG_STYLE = { bg: '#d6e2f5', text: '#1a3d6b' }

const INITIAL_MARKDOWN = `# DC Net Service Satisfaction Campaign

**Campaign Name:** DC Net Service Satisfaction Survey
**Type:** SMS Campaign
**Start Date:** November 5, 2025
**Schedule:**
- Message 1: Sent immediately at 09:00 AM
- Message 2: Sent 2 hours later (11:00 AM)
- Message 3: Sent 24 hours after Message 2 (November 6, 11:00 AM)

---

## ✅ Messages

**Message 1:**
Hello! DC Net values your feedback. Please take a quick survey about our services: [Survey Link]

**Message 2:**
Reminder: Your opinion matters! Complete the DC Net survey here: [Survey Link]

**Message 3:**
Last chance to share your thoughts! Survey closes soon: [Survey Link]. Thank you for helping us improve.`

const VERSIONS = [
  { id: 'v5', label: 'v.5', active: true,  date: '11/05/2025 10:15 AM', action: 'Rename' },
  { id: 'v4', label: 'v.4', active: false, date: '11/04/2025 12:15 PM', action: 'Tags changed' },
  { id: 'v3', label: 'v.3', active: false, date: '11/02/2025 3:37 PM',  action: 'Content edit' },
  { id: 'v2', label: 'v.2', active: false, date: '11/02/2025 10:15 AM', action: 'Content edit' },
  { id: 'v1', label: 'v.1', active: false, date: '11/01/2025 10:15 AM', action: 'Created' },
]

// ── Sidebar card wrapper ───────────────────────────────────────────────────────

function SideCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background:     '#fff',
      borderRadius:   8,
      border:         '1px solid #eff1f3',
      padding:        16,
      display:        'flex',
      flexDirection:  'column',
      gap:            12,
    }}>
      {children}
    </div>
  )
}

function CardHeading({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontSize:       11,
      fontWeight:     600,
      letterSpacing:  '0.48px',
      textTransform:  'uppercase',
      color:          '#021920',
    }}>
      {children}
    </span>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function DocumentView({ article, onBack }: DocumentViewProps) {
  const [activeTab,        setActiveTab]        = useState<'markdown' | 'upload'>('markdown')
  const [docName,          setDocName]          = useState(article.title)
  const [docFolder,        setDocFolder]        = useState(article.folder)
  const [markdown,         setMarkdown]         = useState(INITIAL_MARKDOWN)
  const [tags,             setTags]             = useState<string[]>(article.tags)
  const [tagSearch,        setTagSearch]        = useState('')
  const [tagDropdownOpen,  setTagDropdownOpen]  = useState(false)
  const [tagCreateOpen,    setTagCreateOpen]    = useState(false)
  const searchWrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!tagDropdownOpen) return
    function handleMouseDown(e: MouseEvent) {
      if (!searchWrapperRef.current?.contains(e.target as Node)) {
        setTagDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [tagDropdownOpen])
  const [selectedVersions, setSelectedVersions] = useState<Set<string>>(new Set(['v5']))

  function removeTag(tag: string) {
    setTags(prev => prev.filter(t => t !== tag))
  }

  function toggleVersion(id: string) {
    setSelectedVersions(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div style={{
      position:       'fixed',
      inset:          0,
      zIndex:         1000,
      background:     '#f8f9fb',
      display:        'flex',
      flexDirection:  'column',
      overflow:       'hidden',
    }}>

      {/* ── A. Page header ── */}
      <div style={{
        background:   '#fff',
        borderBottom: '1px solid #eff1f3',
        padding:      '16px 24px',
        flexShrink:   0,
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'space-between',
      }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#021920' }}>
          {article.title}
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          6,
              padding:      '8px 12px',
              border:       '1px solid #3264b8',
              borderRadius: 8,
              background:   'transparent',
              color:        '#3264b8',
              fontSize:     13,
              cursor:       'pointer',
            }}
          >
            <DownloadSimpleIcon size={16} />
            Download Article
          </button>
          <button
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          6,
              padding:      '8px 12px',
              border:       '1px solid #ef2056',
              borderRadius: 8,
              background:   'transparent',
              color:        '#ef2056',
              fontSize:     13,
              cursor:       'pointer',
            }}
          >
            <TrashIcon size={16} />
            Delete Article
          </button>
        </div>
      </div>

      {/* ── B. Content area ── */}
      <div style={{
        flex:      1,
        overflow:  'hidden',
        display:   'flex',
        gap:       16,
        padding:   '16px 24px',
      }}>

        {/* ── Left panel ── */}
        <div style={{
          flex:           1,
          display:        'flex',
          flexDirection:  'column',
          gap:            0,
          overflow:       'hidden',
          background:     '#fff',
          borderRadius:   8,
          border:         '1px solid #eff1f3',
        }}>

          {/* 1. Breadcrumb */}
          <div style={{
            padding:      '12px 16px',
            borderBottom: '1px solid #eff1f3',
            flexShrink:   0,
          }}>
            <button
              onClick={onBack}
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:        6,
                background: 'none',
                border:     'none',
                cursor:     'pointer',
                padding:    0,
                color:      '#3264b8',
                fontSize:   12,
                fontWeight: 600,
              }}
            >
              <ArrowLeftIcon size={14} color="#3264b8" />
              Back to Article List
            </button>
          </div>

          {/* 2. Form row */}
          <div style={{
            padding:    16,
            background: '#eff1f3',
            flexShrink: 0,
            display:    'flex',
            gap:        16,
          }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#4b535e', marginBottom: 4 }}>
                Document Name <span style={{ color: '#ef2056' }}>*</span>
              </label>
              <input
                value={docName}
                onChange={e => setDocName(e.target.value)}
                style={{
                  width:        '100%',
                  padding:      '7px 10px',
                  border:       '1px solid #d9dce0',
                  borderRadius: 6,
                  fontSize:     13,
                  color:        '#021920',
                  background:   '#fff',
                  outline:      'none',
                  boxSizing:    'border-box',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#4285f4' }}
                onBlur={e => { e.currentTarget.style.borderColor = '#d9dce0' }}
              />
            </div>
            <div style={{ width: 200 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#4b535e', marginBottom: 4 }}>
                Folder
              </label>
              <select
                value={docFolder}
                onChange={e => setDocFolder(e.target.value)}
                style={{
                  width:        '100%',
                  padding:      '7px 10px',
                  border:       '1px solid #d9dce0',
                  borderRadius: 6,
                  fontSize:     13,
                  color:        '#021920',
                  background:   '#fff',
                  outline:      'none',
                }}
              >
                {FOLDER_LIST.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Tab bar */}
          <div style={{
            padding:      '0 16px',
            borderBottom: '1px solid #eff1f3',
            flexShrink:   0,
            display:      'flex',
            gap:          0,
          }}>
            {(['markdown', 'upload'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  display:       'flex',
                  alignItems:    'center',
                  gap:           6,
                  padding:       '10px 14px',
                  border:        'none',
                  borderBottom:  activeTab === tab ? '2px solid #4285f4' : '2px solid transparent',
                  background:    'transparent',
                  cursor:        'pointer',
                  fontSize:      13,
                  fontWeight:    activeTab === tab ? 600 : 400,
                  color:         activeTab === tab ? '#021920' : '#7a828c',
                  marginBottom:  -1,
                }}
              >
                {tab === 'upload' && <UploadSimpleIcon size={13} />}
                {tab === 'markdown' ? 'Markdown' : 'Upload File'}
              </button>
            ))}
          </div>

          {/* 4. Content */}
          {activeTab === 'markdown' ? (
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <MarkdownEditor value={markdown} onChange={setMarkdown} />
            </div>
          ) : (
            <div style={{
              flex:           1,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
            }}>
              <div style={{
                border:       '2px dashed #d9dce0',
                borderRadius: 8,
                padding:      '32px 48px',
                color:        '#7a828c',
                fontSize:     13,
              }}>
                File upload coming soon
              </div>
            </div>
          )}

          {/* 5. Footer */}
          <div style={{
            padding:      '12px 16px',
            borderTop:    '1px solid #eff1f3',
            flexShrink:   0,
            display:      'flex',
            gap:          8,
            justifyContent: 'flex-start',
          }}>
            <button
              onClick={onBack}
              style={{
                padding:      '8px 16px',
                border:       '1px solid #d9dce0',
                borderRadius: 8,
                background:   'transparent',
                color:        '#4b535e',
                fontSize:     13,
                cursor:       'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => setTimeout(() => toast.success('Changes saved', { description: docName }), 1000)}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          6,
                padding:      '8px 16px',
                border:       'none',
                borderRadius: 8,
                background:   '#4285f4',
                color:        '#fff',
                fontSize:     13,
                fontWeight:   600,
                cursor:       'pointer',
              }}
            >
              <FloppyDiskIcon size={14} />
              Save Changes
            </button>
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div style={{
          width:      328,
          flexShrink: 0,
          display:    'flex',
          flexDirection: 'column',
          gap:        16,
          overflowY:  'auto',
        }}>

          {/* Card 1 — Document Details */}
          <SideCard>
            <CardHeading>Document Details</CardHeading>
            <DetailsRow icon={<UserIcon size={16} color="#7a828c" />} label="Author" value={article.modifiedBy} />
            <DetailsRow icon={<CalendarIcon size={16} color="#7a828c" />} label="Date Created" value={article.modified} />
            <DetailsRow icon={<CalendarIcon size={16} color="#7a828c" />} label="Last Modified" value={article.modified} />
          </SideCard>

          {/* Card 2 — Tags */}
          <SideCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <CardHeading>Tags</CardHeading>
              <button
                onClick={() => { setTagDropdownOpen(false); setTagCreateOpen(true) }}
                style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        4,
                  background: 'none',
                  border:     'none',
                  cursor:     'pointer',
                  color:      '#3264b8',
                  fontSize:   10,
                  padding:    0,
                }}
              >
                <PlusCircleIcon size={12} />
                Add New Tag
              </button>
            </div>

            {/* Search input — always visible; focus opens the floating dropdown */}
            <div ref={searchWrapperRef} style={{ position: 'relative' }}>
              <input
                value={tagSearch}
                onChange={e => setTagSearch(e.target.value)}
                onFocus={() => { setTagCreateOpen(false); setTagDropdownOpen(true) }}
                placeholder="Search existing tags"
                style={{
                  width:        '100%',
                  padding:      '7px 32px 7px 10px',
                  border:       `1px solid ${tagDropdownOpen ? '#4285f4' : '#d9dce0'}`,
                  borderRadius: 8,
                  fontSize:     13,
                  color:        '#021920',
                  background:   '#fff',
                  outline:      'none',
                  boxSizing:    'border-box',
                }}
              />
              <MagnifyingGlassIcon
                size={14}
                color="#aab0b8"
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}
              />

              {/* Floating dropdown — opens on search focus */}
              {tagDropdownOpen && (
                <div style={{
                  position:     'absolute',
                  top:          'calc(100% + 4px)',
                  left:         0,
                  right:        0,
                  zIndex:       200,
                  background:   '#fff',
                  border:       '1px solid #d9dce0',
                  borderRadius: 8,
                  boxShadow:    '0 4px 16px rgba(5,3,38,0.10)',
                  padding:      '8px 0 4px',
                }}>
                  <TagPanel
                    floating
                    externalSearch={tagSearch}
                    existingTags={tags}
                    onApply={(newTags) => {
                      setTags(prev => [...new Set([...prev, ...newTags])])
                      setTagSearch('')
                      setTagDropdownOpen(false)
                    }}
                    onClose={() => setTagDropdownOpen(false)}
                    onCreateNew={() => { setTagDropdownOpen(false); setTagCreateOpen(true) }}
                  />
                </div>
              )}
            </div>

            {/* Inline create form — shown when "Add New Tag" clicked */}
            {tagCreateOpen && (
              <TagPanel
                initialView="createNew"
                existingTags={tags}
                onApply={(newTags) => {
                  setTags(prev => [...new Set([...prev, ...newTags])])
                  setTagCreateOpen(false)
                }}
                onClose={() => setTagCreateOpen(false)}
                onBack={() => { setTagCreateOpen(false); setTagDropdownOpen(true) }}
              />
            )}

            {/* Tag chips — always visible */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {tags.map(tag => {
                const style = TAG_STYLE[tag] ?? DEFAULT_TAG_STYLE
                return (
                  <span
                    key={tag}
                    style={{
                      display:      'inline-flex',
                      alignItems:   'center',
                      gap:          4,
                      padding:      '2px 8px',
                      borderRadius: 99,
                      background:   style.bg,
                      color:        style.text,
                      fontSize:     11,
                      fontWeight:   500,
                    }}
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      style={{
                        display:    'flex',
                        background: 'none',
                        border:     'none',
                        cursor:     'pointer',
                        padding:    0,
                        color:      style.text,
                        lineHeight: 1,
                      }}
                    >
                      <XIcon size={10} />
                    </button>
                  </span>
                )
              })}
              {tags.length === 0 && (
                <span style={{ fontSize: 12, color: '#aab0b8' }}>No tags</span>
              )}
            </div>
          </SideCard>

          {/* Card 3 — Versions */}
          <SideCard>
            <CardHeading>Versions (5)</CardHeading>

            <div style={{ border: '1px solid #eff1f3', borderRadius: 8, overflow: 'hidden' }}>
              {VERSIONS.map((v, idx) => (
                <div
                  key={v.id}
                  style={{
                    display:      'flex',
                    alignItems:   'center',
                    background:   v.active ? '#d9e7fd' : '#fff',
                    borderBottom: idx < VERSIONS.length - 1 ? '1px solid #eff1f3' : 'none',
                    minHeight:    48,
                  }}
                >
                  {/* Checkbox col */}
                  <div style={{
                    width:          34,
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    flexShrink:     0,
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedVersions.has(v.id)}
                      onChange={() => toggleVersion(v.id)}
                      style={{ cursor: 'pointer', width: 14, height: 14 }}
                    />
                  </div>

                  {/* Info col */}
                  <div style={{ flex: 1, padding: '8px 8px 8px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#021920' }}>{v.label}</span>
                      {v.active && (
                        <span style={{
                          fontSize:     10,
                          fontWeight:   600,
                          padding:      '1px 6px',
                          borderRadius: 99,
                          background:   '#4285f4',
                          color:        '#fff',
                        }}>
                          active
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: '#7a828c', marginTop: 2 }}>{v.date}</div>
                  </div>

                  {/* Action col */}
                  <div style={{ fontSize: 10, color: '#7a828c', textAlign: 'right', padding: '0 12px 0 8px', flexShrink: 0 }}>
                    {v.action}
                  </div>
                </div>
              ))}
            </div>

            {/* Versions footer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => setSelectedVersions(new Set())}
                style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        4,
                  background: 'none',
                  border:     'none',
                  cursor:     'pointer',
                  color:      '#4b535e',
                  fontSize:   10,
                  padding:    0,
                }}
              >
                <XCircleIcon size={12} />
                Clear Selection
              </button>
              <button
                disabled={selectedVersions.size < 2}
                style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        4,
                  background: 'none',
                  border:     'none',
                  cursor:     selectedVersions.size >= 2 ? 'pointer' : 'not-allowed',
                  color:      '#3264b8',
                  fontSize:   10,
                  fontWeight: 700,
                  padding:    0,
                  opacity:    selectedVersions.size >= 2 ? 1 : 0.4,
                }}
              >
                <ArrowsLeftRightIcon size={12} />
                Compare Versions
              </button>
            </div>
          </SideCard>
        </div>
      </div>
    </div>
  )
}

// ── Details row helper ─────────────────────────────────────────────────────────

function DetailsRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 10, fontWeight: 600, color: '#7a828c', minWidth: 80 }}>{label}</span>
      <span style={{ fontSize: 10, color: '#aab0b8' }}>{value}</span>
    </div>
  )
}
