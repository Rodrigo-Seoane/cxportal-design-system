'use client'

import { useState } from 'react'
import {
  MagnifyingGlassIcon,
  PlusCircleIcon,
  CheckIcon,
  XIcon,
} from '@phosphor-icons/react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface TagPanelProps {
  existingTags: string[]
  onApply: (newTags: string[]) => void
  onClose: () => void
  // floating dropdown mode: no internal search input — uses externalSearch for filtering
  floating?: boolean
  externalSearch?: string
  onCreateNew?: () => void  // called when "Create New Tag" clicked in floating mode
  // inline create mode
  initialView?: TagView
  onBack?: () => void       // called by "← Back to tags" in createNew view
}

type TagView = 'list' | 'createNew'

// ── Data ──────────────────────────────────────────────────────────────────────

const INITIAL_TAG_ITEMS: { key: string; dotBg: string; dotDashed?: boolean }[] = [
  { key: 'status:Archived',     dotBg: '#d6e2f5' },
  { key: 'status:Deprecated',   dotBg: '#a4beea' },
  { key: 'priority:High',       dotBg: '#ddf4d2' },
  { key: 'priority:Urgent',     dotBg: '#b5e89c' },
  { key: 'audience:Internal',   dotBg: '#fbeed8' },
  { key: 'audience:External',   dotBg: '#f1c780' },
  { key: 'access:Confidential', dotBg: '#fbc6d4' },
  { key: 'access:Public',       dotBg: '#f792ac' },
  { key: 'dep:Engineering',     dotBg: 'transparent', dotDashed: true },
  { key: 'dep:Product',         dotBg: 'transparent', dotDashed: true },
  { key: 'dep:Marketing',       dotBg: 'transparent', dotDashed: true },
  { key: 'dep:Finance',         dotBg: 'transparent', dotDashed: true },
  { key: 'dep:Legal',           dotBg: 'transparent', dotDashed: true },
]

const TAG_COLORS: { hex: string; dashed?: boolean }[] = [
  { hex: '#d6e2f5' }, { hex: '#a4beea' }, { hex: '#ddf4d2' }, { hex: '#b5e89c' },
  { hex: '#fbeed8' }, { hex: '#f7ddb1' }, { hex: '#fbc6d4' }, { hex: '#f792ac' },
  { hex: 'dashed', dashed: true },
]

// ── Component ─────────────────────────────────────────────────────────────────

export function TagPanel({
  existingTags,
  onApply,
  onClose,
  floating = false,
  externalSearch = '',
  onCreateNew,
  initialView = 'list',
  onBack,
}: TagPanelProps) {
  const [view,        setView]        = useState<TagView>(initialView)
  const [search,      setSearch]      = useState('')
  const [checkedTags, setCheckedTags] = useState<Set<string>>(new Set())
  const [localTags,   setLocalTags]   = useState(INITIAL_TAG_ITEMS)
  const [createKey,   setCreateKey]   = useState('')
  const [createValue, setCreateValue] = useState('')
  const [createColor, setCreateColor] = useState('#d6e2f5')

  const available    = localTags.filter(t => !existingTags.includes(t.key))
  const activeSearch = floating ? externalSearch : search
  const filtered     = available.filter(t =>
    !activeSearch || t.key.toLowerCase().includes(activeSearch.toLowerCase())
  )

  const candidateKey = createKey.trim() + ':' + createValue.trim()
  const isDuplicate  = createKey.trim() !== '' &&
    createValue.trim() !== '' &&
    localTags.some(t => t.key === candidateKey)

  function toggleTag(key: string) {
    setCheckedTags(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function commitNewTag() {
    const key = candidateKey
    const isDashed = createColor === 'dashed'
    setLocalTags(prev => [
      ...prev,
      { key, dotBg: isDashed ? 'transparent' : createColor, dotDashed: isDashed },
    ])
    setCheckedTags(prev => new Set([...prev, key]))
    setCreateKey('')
    setCreateValue('')
    setCreateColor('#d6e2f5')
    setView('list')
  }

  if (view === 'createNew') {
    const canCreate = createKey.trim() !== '' && createValue.trim() !== '' && !isDuplicate
    return (
      <div>
        {/* Back link */}
        <button
          onClick={() => onBack ? onBack() : setView('list')}
          style={{
            background:   'none',
            border:       'none',
            cursor:       'pointer',
            padding:      0,
            fontSize:     12,
            fontWeight:   600,
            color:        '#3264b8',
            marginBottom: 8,
          }}
        >
          ← Back to tags
        </button>

        <p style={{ fontSize: 12, color: '#7a828c', marginBottom: 12, marginTop: 0 }}>
          Create a new tag and add it to this article.
        </p>

        {/* Key field */}
        <div style={{ marginBottom: 10 }}>
          <label style={{
            display:       'block',
            fontSize:      11,
            fontWeight:    600,
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
            color:         '#021920',
            marginBottom:  4,
          }}>
            Key
          </label>
          <input
            value={createKey}
            onChange={e => setCreateKey(e.target.value)}
            placeholder="e.g.: audience"
            style={{
              width:        '100%',
              padding:      8,
              border:       `1px solid ${createKey.trim() ? '#4285f4' : '#d9dce0'}`,
              borderRadius: 8,
              fontSize:     13,
              outline:      'none',
              boxSizing:    'border-box',
            }}
          />
        </div>

        {/* Value field */}
        <div style={{ marginBottom: 10 }}>
          <label style={{
            display:       'block',
            fontSize:      11,
            fontWeight:    600,
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
            color:         '#021920',
            marginBottom:  4,
          }}>
            Value
          </label>
          <input
            value={createValue}
            onChange={e => setCreateValue(e.target.value)}
            placeholder="e.g.: Internal"
            style={{
              width:        '100%',
              padding:      8,
              border:       `1px solid ${createValue.trim() ? '#4285f4' : '#d9dce0'}`,
              borderRadius: 8,
              fontSize:     13,
              outline:      'none',
              boxSizing:    'border-box',
            }}
          />
        </div>

        {isDuplicate && (
          <p style={{ fontSize: 12, color: '#ef2056', margin: '0 0 10px' }}>
            This tag already exists.
          </p>
        )}

        {/* Color picker */}
        <div style={{ marginBottom: 14 }}>
          <label style={{
            display:       'block',
            fontSize:      10,
            fontWeight:    600,
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
            color:         '#021920',
            marginBottom:  6,
          }}>
            Tag Color
          </label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TAG_COLORS.map(c => {
              const isSelected = createColor === c.hex
              return (
                <button
                  key={c.hex}
                  onClick={() => setCreateColor(c.hex)}
                  style={{
                    width:           22,
                    height:          22,
                    borderRadius:    '50%',
                    background:      c.dashed ? 'transparent' : c.hex,
                    border:          isSelected
                      ? '2px solid #4285f4'
                      : c.dashed
                        ? '1.5px dashed #323840'
                        : '2px solid transparent',
                    cursor:          'pointer',
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                    padding:         0,
                    flexShrink:      0,
                  }}
                >
                  {isSelected && <XIcon size={9} weight="bold" color="#4285f4" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
          <button
            onClick={onClose}
            style={{
              border:       '1px solid #d9dce0',
              color:        '#4b535e',
              background:   '#fff',
              padding:      '6px 12px',
              borderRadius: 8,
              fontSize:     12,
              cursor:       'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={commitNewTag}
            disabled={!canCreate}
            style={{
              background:   '#4285f4',
              color:        '#eff1f3',
              border:       '1px solid #689df6',
              padding:      '6px 12px',
              borderRadius: 8,
              fontSize:     12,
              cursor:       canCreate ? 'pointer' : 'not-allowed',
              opacity:      canCreate ? 1 : 0.45,
            }}
          >
            Create Tag
          </button>
        </div>
      </div>
    )
  }

  // ── List view ────────────────────────────────────────────────────────────────

  const showEmpty      = filtered.length === 0 && !!activeSearch
  const showAllApplied = filtered.length === 0 && !activeSearch

  function handleCreateNew() {
    if (floating && onCreateNew) onCreateNew()
    else setView('createNew')
  }

  return (
    <div>
      {/* Internal search — hidden in floating mode (external search drives filtering) */}
      {!floating && (
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tags…"
            style={{
              width:        '100%',
              padding:      '6px 32px 6px 10px',
              background:   '#f5f7fa',
              border:       'none',
              borderRadius: 6,
              fontSize:     13,
              outline:      'none',
              boxSizing:    'border-box',
            }}
          />
          <MagnifyingGlassIcon
            size={14}
            color="#aab0b8"
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}
          />
        </div>
      )}

      {/* Tag list */}
      <div style={{
        border:       '1px solid #eff1f3',
        borderRadius: 8,
        overflow:     'hidden',
        maxHeight:    200,
        overflowY:    'auto',
      }}>
        {showEmpty && (
          <div style={{ padding: '10px 10px 0', fontSize: 12, color: '#7a828c' }}>
            No matches.
          </div>
        )}
        {showEmpty && (
          <button
            onClick={handleCreateNew}
            style={{
              display:     'block',
              width:       '100%',
              textAlign:   'left',
              background:  'none',
              border:      'none',
              cursor:      'pointer',
              padding:     '6px 10px 10px',
              fontSize:    12,
              fontWeight:  600,
              color:       '#3264b8',
            }}
          >
            Create New Tag
          </button>
        )}
        {showAllApplied && (
          <div style={{ padding: '10px', fontSize: 12, color: '#7a828c' }}>
            All tags already applied.
          </div>
        )}
        {filtered.map((tag, idx) => {
          const checked = checkedTags.has(tag.key)
          return (
            <label
              key={tag.key}
              style={{
                height:       36,
                display:      'flex',
                alignItems:   'center',
                gap:          10,
                padding:      '0 10px',
                cursor:       'pointer',
                background:   checked ? '#f0f5fe' : '#ffffff',
                borderBottom: idx < filtered.length - 1 ? '1px solid #f5f7fa' : 'none',
              }}
              onMouseEnter={e => {
                if (!checked) (e.currentTarget as HTMLElement).style.background = '#f5f7fa'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = checked ? '#f0f5fe' : '#ffffff'
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleTag(tag.key)}
                style={{ accentColor: '#4285f4', flexShrink: 0 }}
              />
              <span style={{
                width:        10,
                height:       10,
                borderRadius: '50%',
                background:   tag.dotBg,
                border:       tag.dotDashed ? '1.5px dashed #323840' : 'none',
                flexShrink:   0,
              }} />
              <span style={{ fontSize: 12, color: '#4b535e', flex: 1, userSelect: 'none' }}>
                {tag.key}
              </span>
              {checked && <CheckIcon size={12} color="#4285f4" />}
            </label>
          )
        })}
      </div>

      {/* Create New Tag footer link */}
      {filtered.length > 0 && (
        <button
          onClick={handleCreateNew}
          style={{
            display:     'flex',
            alignItems:  'center',
            gap:         5,
            width:       '100%',
            background:  'none',
            border:      'none',
            borderTop:   '1px solid #eff1f3',
            cursor:      'pointer',
            padding:     '8px 10px 6px',
            fontSize:    12,
            fontWeight:  600,
            color:       '#3264b8',
          }}
        >
          <PlusCircleIcon size={13} />
          Create New Tag
        </button>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '8px 10px 4px', borderTop: '1px solid #eff1f3', marginTop: 4 }}>
        <button
          onClick={onClose}
          style={{
            border:       '1px solid #d9dce0',
            color:        '#4b535e',
            background:   '#fff',
            padding:      '6px 12px',
            borderRadius: 8,
            fontSize:     12,
            cursor:       'pointer',
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => onApply([...checkedTags])}
          disabled={checkedTags.size === 0}
          style={{
            background:   '#4285f4',
            color:        '#eff1f3',
            border:       '1px solid #689df6',
            padding:      '6px 12px',
            borderRadius: 8,
            fontSize:     12,
            cursor:       checkedTags.size === 0 ? 'not-allowed' : 'pointer',
            opacity:      checkedTags.size === 0 ? 0.45 : 1,
          }}
        >
          {checkedTags.size === 0
            ? 'Add Tags'
            : `Add ${checkedTags.size} Tag${checkedTags.size !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  )
}
