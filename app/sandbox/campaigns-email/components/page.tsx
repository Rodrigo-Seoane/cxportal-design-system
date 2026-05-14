'use client'

import { useState, useMemo } from 'react'
import { CaretRightIcon, CaretDownIcon, FolderOpenIcon, FolderIcon, BuildingsIcon, TagIcon } from '@phosphor-icons/react'
import { Toaster } from '@/components/ui/toast'
import { GROUP_HIERARCHY, CAMPAIGN_GROUPS } from '../_mock/groups'
import { TOPICS } from '../_mock/topics'
import { DetailPane } from './DetailPane'
import type { Selection } from './DetailPane'

const FIXED_LABELS = { level1: 'Organization', level2: 'Component', level3: 'Campaign Group' } as const

function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

// ── Tree node ─────────────────────────────────────────────────────────────────

function TreeNode({
  id, label, count, topicCount, badge, depth, expanded, active,
  onToggle, onSelect, hasChildren,
}: {
  id:           string
  label:        string
  count?:       number
  topicCount?:  number
  badge?:       string
  depth:        number
  expanded?:    boolean
  active:       boolean
  onToggle?:    () => void
  onSelect:     () => void
  hasChildren:  boolean
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={hasChildren ? expanded : undefined}
      aria-selected={active}
      onClick={() => { onToggle?.(); onSelect() }}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { onToggle?.(); onSelect() } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:         'flex',
        alignItems:      'center',
        gap:              6,
        height:           36,
        paddingLeft:      depth * 16 + 12,
        paddingRight:     10,
        cursor:          'pointer',
        borderRadius:     6,
        margin:          '1px 6px',
        background:       active  ? 'var(--color-info-100)' :
                          hovered ? 'var(--color-surface-display)' : 'transparent',
        transition:      'background 100ms ease',
        userSelect:      'none',
      }}
    >
      <span style={{ width: 14, flexShrink: 0, display: 'flex', alignItems: 'center', color: 'var(--color-text-secondary)' }}>
        {hasChildren
          ? expanded
            ? <CaretDownIcon  size={12} />
            : <CaretRightIcon size={12} />
          : null
        }
      </span>

      {depth === 1 && (
        expanded
          ? <FolderOpenIcon size={14} color={active ? 'var(--color-primary)' : 'var(--color-text-secondary)'} weight="fill" />
          : <FolderIcon     size={14} color={active ? 'var(--color-primary)' : 'var(--color-text-secondary)'} weight="regular" />
      )}
      {depth === 2 && (
        <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginLeft: 2,
          background: active ? 'var(--color-primary)' : 'var(--color-border)' }} />
      )}
      {depth === 3 && (
        <TagIcon size={11} color={active ? 'var(--color-primary)' : 'var(--color-text-secondary)'} />
      )}

      <span style={{
        flex: 1, minWidth: 0,
        fontSize:   depth === 1 ? 13 : 12,
        fontWeight: active ? 600 : depth === 1 ? 500 : 400,
        color:      active ? 'var(--color-primary)' : 'var(--color-text-primary)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        lineHeight: '20px',
      }}>
        {label}
      </span>

      {count !== undefined && count > 0 && (
        <span style={{
          fontSize: 10, fontWeight: 600, lineHeight: '14px',
          padding: '1px 5px', borderRadius: 8, flexShrink: 0,
          background: 'var(--color-surface-display)', color: 'var(--color-text-secondary)',
        }}>
          {count}
        </span>
      )}

      {!expanded && topicCount !== undefined && topicCount > 0 && (
        <span style={{
          fontSize: 10, fontWeight: 600, lineHeight: '14px',
          padding: '1px 5px', borderRadius: 8, flexShrink: 0,
          background: 'var(--color-info-100)',
          color: 'var(--color-primary)',
        }}>
          {topicCount} topics
        </span>
      )}
      {badge && (
        <span style={{
          fontSize: 10, fontWeight: 600, lineHeight: '14px',
          padding: '1px 5px', borderRadius: 8, flexShrink: 0,
          background: 'var(--color-surface-display)', color: 'var(--color-text-secondary)',
        }}>
          {badge}
        </span>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ComponentsPage() {
  const [expanded,       setExpanded]       = useState<Set<string>>(() => new Set([GROUP_HIERARCHY[0].id]))
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [selection,      setSelection]      = useState<Selection>({ type: 'component', id: GROUP_HIERARCHY[0].id })

  const topicCountByGroup = useMemo(() =>
    Object.fromEntries(
      CAMPAIGN_GROUPS.map(g => [g.id, TOPICS.filter(t => t.groupId === g.id).length])
    ),
    []
  )

  function toggleComponent(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleGroup(id: string) {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleSelectGroup(groupId: string) {
    const componentId = CAMPAIGN_GROUPS.find(g => g.id === groupId)?.componentId
    if (componentId) setExpanded(prev => new Set([...prev, componentId]))
    setSelection({ type: 'group', id: groupId })
  }

  function handleSelectTopic(topicId: string) {
    const topic = TOPICS.find(t => t.id === topicId)
    if (!topic) return
    const componentId = CAMPAIGN_GROUPS.find(g => g.id === topic.groupId)?.componentId
    if (componentId) setExpanded(prev => new Set([...prev, componentId]))
    setExpandedGroups(prev => new Set([...prev, topic.groupId]))
    setSelection({ type: 'topic', id: topicId })
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)' }}>
      <Toaster position="top-right" />

      {/* ── Left tree rail ─────────────────────────────────────────── */}
      <div style={{
        width: 280, flexShrink: 0,
        borderRight: '1px solid var(--color-border)',
        overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '8px 0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 18px', marginBottom: 2 }}>
            <BuildingsIcon size={14} color="var(--color-text-secondary)" weight="fill" />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)',
              textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              SSA · Organization
            </span>
          </div>

          {GROUP_HIERARCHY.map(component => (
            <div key={component.id}>
              <TreeNode
                id={component.id}
                label={component.name}
                count={component.groups.length}
                depth={1}
                expanded={expanded.has(component.id)}
                active={selection?.type === 'component' && selection.id === component.id}
                hasChildren={component.groups.length > 0}
                onToggle={() => toggleComponent(component.id)}
                onSelect={() => setSelection({ type: 'component', id: component.id })}
              />

              {expanded.has(component.id) && component.groups.map(group => (
                <div key={group.id}>
                  <TreeNode
                    id={group.id}
                    label={group.name}
                    depth={2}
                    topicCount={topicCountByGroup[group.id]}
                    expanded={expandedGroups.has(group.id)}
                    active={selection?.type === 'group' && selection.id === group.id}
                    hasChildren={topicCountByGroup[group.id] > 0}
                    onToggle={() => toggleGroup(group.id)}
                    onSelect={() => handleSelectGroup(group.id)}
                  />
                  {expandedGroups.has(group.id) && TOPICS
                    .filter(t => t.groupId === group.id)
                    .map(topic => (
                      <TreeNode
                        key={topic.id}
                        id={topic.id}
                        label={topic.name}
                        depth={3}
                        badge={fmtCount(topic.subscriberCount)}
                        active={selection?.type === 'topic' && selection.id === topic.id}
                        hasChildren={false}
                        onSelect={() => handleSelectTopic(topic.id)}
                      />
                    ))
                  }
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Detail pane ────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 36px' }}>
        <DetailPane
          selection={selection}
          labels={FIXED_LABELS}
          onSelectGroup={handleSelectGroup}
          onSelectTopic={handleSelectTopic}
        />
      </div>

    </div>
  )
}
