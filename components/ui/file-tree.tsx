'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import {
  CaretDownIcon,
  CaretRightIcon,
  FileTextIcon,
} from '@phosphor-icons/react'

// ── Design tokens (Figma nodes 2244-2713 "Treeview Controler" / 2244-2732
// "Tree Foldertitle" / 2244-2676 "Doc Tree - Bulk") ───────────────────────────
//
// Figma's own Principles/Usage docs (2501-54188 / 2501-54091) describe the
// selected state as "primary blue (#4285f4)" / "light blue (#d9e7fd)" and
// even give a formal Token Reference table with those exact blue hex
// values -- but the live, real pulled component is GREEN throughout (the
// Token Reference table's own colour SWATCH for the title-cell row even
// renders #d0ecc1, contradicting the blue hex text right next to it). Same
// pre-rebrand-blue-leftover pattern found repeatedly elsewhere in this
// audit (Metric Tiles, Collapsible Filters, Colors foundation) -- built
// from the live component's real green values, not the stale doc hexes.
const T = {
  surface:        'var(--surface-section-bg)',
  surfaceSelected: 'var(--surface-table-active-row)',
  surfaceHover:   'var(--surface-action-secondary-hover)',
  controllerActive: 'var(--surface-action-primary-default)',
  controllerBorder: 'var(--border-color-surface-active-primary-default)',
  hoverBorder:    'var(--border-color-surface-active-secondary-hover)',
  connectorLine:  'var(--neutral-100)',
  borderBottom:   'var(--neutral-100)',
  // Figma names this text/on-action/secondary, but that alias resolves to
  // the wrong ramp step (--neutral-700, #373737) in this codebase --
  // bypassed to --neutral-800 directly, the same recurring bug found
  // throughout this whole audit.
  text:           'var(--neutral-800)',
  iconWhite:      'var(--neutral-0)',
  selectAccent:   'var(--text-on-action-transparent)',
} as const

const INDENT  = 24  // px per depth level
const ROW_H   = 24  // px row height
const CTRL_W  = 24  // px controller cell width

// ── Types ─────────────────────────────────────────────────────────────────────

export type FileTreeNodeType = 'account' | 'group' | 'topic'

export interface FileTreeNode {
  id:        string
  label:     string
  type:      FileTreeNodeType
  children?: FileTreeNode[]
}

export interface FileTreeProps {
  nodes:       FileTreeNode[]
  selectedId?: string
  onSelect?:   (node: FileTreeNode) => void
  /** Ids that should start expanded. Defaults to all root-level group nodes. */
  defaultExpanded?: string[]
  className?:  string
}

// ── Flattening helpers (for keyboard roving-tabindex navigation) ─────────────

interface FlatEntry {
  node:      FileTreeNode
  depth:     number
  isLast:    boolean
  parentId:  string | null
  parentPath: boolean[]
}

function flatten(nodes: FileTreeNode[], expandedIds: Set<string>): FlatEntry[] {
  const out: FlatEntry[] = []
  function walk(list: FileTreeNode[], depth: number, parentId: string | null, parentPath: boolean[]) {
    list.forEach((node, index) => {
      const isLast = index === list.length - 1
      out.push({ node, depth, isLast, parentId, parentPath })
      if (node.children?.length && expandedIds.has(node.id)) {
        walk(node.children, depth + 1, node.id, [...parentPath, isLast])
      }
    })
  }
  walk(nodes, 0, null, [])
  return out
}

// ── Internal: single row ──────────────────────────────────────────────────────

function TreeRow({
  node,
  depth,
  isSelected,
  isExpanded,
  isLast,
  parentPath,
  tabIndex,
  buttonRef,
  onToggle,
  onSelect,
  onKeyDown,
}: {
  node:       FileTreeNode
  depth:      number
  isSelected: boolean
  isExpanded: boolean
  isLast:     boolean
  parentPath: boolean[]
  tabIndex:   number
  buttonRef:  (el: HTMLButtonElement | null) => void
  onToggle:   () => void
  onSelect:   () => void
  onKeyDown:  (e: React.KeyboardEvent<HTMLButtonElement>) => void
}) {
  const [hovered, setHovered] = useState(false)
  const isTopic = node.type === 'topic'
  const isGroup = !isTopic

  const ctrlBg    = isSelected ? T.controllerActive : hovered ? T.surfaceHover : T.surface
  const titleBg   = isSelected ? T.surfaceSelected  : hovered ? T.surfaceHover : T.surface
  const iconColor = isSelected ? T.iconWhite        : T.text
  const ctrlBorder = isSelected
    ? `1px solid ${T.controllerBorder}`
    : hovered
    ? `1px solid ${T.hoverBorder}`
    : 'none'

  const currentPath = [...parentPath, isLast]

  function handleRowClick() {
    if (isGroup) onToggle()
    else         onSelect()
  }

  return (
    <button
      ref={buttonRef}
      role="treeitem"
      aria-level={depth + 1}
      aria-expanded={isGroup ? isExpanded : undefined}
      aria-selected={isSelected}
      tabIndex={tabIndex}
      onClick={handleRowClick}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={node.label}
      style={{
        display:      'flex',
        alignItems:   'center',
        width:        '100%',
        height:       ROW_H,
        background:   'transparent',
        border:       'none',
        borderBottom: `1px solid ${T.borderBottom}`,
        cursor:       'pointer',
        padding:      0,
        textAlign:    'left',
        flexShrink:   0,
        position:     'relative',
      }}
    >
      {/* Connector lines — one vertical bar per ancestor level */}
      {depth > 0 && (
        <div
          aria-hidden="true"
          style={{
            position:      'absolute',
            left:          0,
            top:           0,
            bottom:        0,
            pointerEvents: 'none',
          }}
        >
          {currentPath.map((isLastInPath, pathIndex) => {
            if (pathIndex >= currentPath.length) return null

            const isCurrentLevel = pathIndex === currentPath.length - 1

            if (!isCurrentLevel) {
              if (isLastInPath) return null
              return (
                <div
                  key={pathIndex}
                  style={{
                    position:   'absolute',
                    top:        0,
                    bottom:     0,
                    left:       pathIndex * INDENT + CTRL_W / 2,
                    width:      1,
                    background: T.connectorLine,
                  }}
                />
              )
            }

            return (
              <div
                key={pathIndex}
                style={{
                  position:   'absolute',
                  top:        0,
                  height:     isLast ? '50%' : '100%',
                  left:       (pathIndex - 1) * INDENT + CTRL_W / 2,
                  width:      1,
                  background: T.connectorLine,
                }}
              />
            )
          })}
        </div>
      )}

      {/* Indent spacer */}
      {depth > 0 && (
        <div style={{ width: depth * INDENT, flexShrink: 0 }} />
      )}

      {/* Controller cell — 24×24 */}
      <div style={{
        width:         CTRL_W,
        height:        ROW_H,
        flexShrink:    0,
        overflow:      'hidden',
        background:    ctrlBg,
        borderRight:   ctrlBorder,
        display:       'flex',
        alignItems:    'center',
        justifyContent:'center',
      }}>
        {isGroup && (
          isExpanded
            ? <CaretDownIcon  size={12} weight="regular" color={iconColor} />
            : <CaretRightIcon size={12} weight="regular" color={iconColor} />
        )}
        {isTopic && (
          <FileTextIcon size={12} color={iconColor} weight="fill" />
        )}
      </div>

      {/* Title cell */}
      <div style={{
        flex:       1,
        height:     ROW_H,
        minWidth:   0,
        background: titleBg,
        display:    'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding:    '0 8px',
        overflow:   'hidden',
      }}>
        <span style={{
          fontSize:     10,
          fontWeight:   400,
          lineHeight:   '16px',
          color:        T.text,
          whiteSpace:   'nowrap',
          overflow:     'hidden',
          textOverflow: 'ellipsis',
          userSelect:   'none',
        }}>
          {node.label}
        </span>

        {/* Explicit "Select" affordance — the only way to mark a Group/Account
            as selected, since clicking the row itself only toggles expand. */}
        {hovered && !isSelected && (
          <span
            role="button"
            tabIndex={-1}
            onClick={e => { e.stopPropagation(); onSelect() }}
            style={{
              flexShrink: 0,
              marginLeft: 8,
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 600,
              lineHeight: '16px',
              color: T.selectAccent,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            Select
          </span>
        )}
      </div>
    </button>
  )
}

// ── Internal: recursive node ──────────────────────────────────────────────────

function TreeNodeItem({
  node,
  depth,
  isLast,
  parentPath,
  selectedId,
  expandedIds,
  focusedId,
  registerRef,
  onToggleExpand,
  onSelect,
  onKeyDown,
}: {
  node:           FileTreeNode
  depth:          number
  isLast:         boolean
  parentPath:     boolean[]
  selectedId?:    string
  expandedIds:    Set<string>
  focusedId:      string
  registerRef:    (id: string, el: HTMLButtonElement | null) => void
  onToggleExpand: (id: string) => void
  onSelect:       (node: FileTreeNode) => void
  onKeyDown:      (e: React.KeyboardEvent<HTMLButtonElement>) => void
}) {
  const isSelected  = node.id === selectedId
  const isExpanded  = expandedIds.has(node.id)
  const hasChildren = !!node.children?.length
  const currentPath = [...parentPath, isLast]

  return (
    <div>
      <TreeRow
        node={node}
        depth={depth}
        isSelected={isSelected}
        isExpanded={isExpanded}
        isLast={isLast}
        parentPath={parentPath}
        tabIndex={node.id === focusedId ? 0 : -1}
        buttonRef={el => registerRef(node.id, el)}
        onToggle={() => onToggleExpand(node.id)}
        onSelect={() => onSelect(node)}
        onKeyDown={onKeyDown}
      />

      {hasChildren && isExpanded &&
        node.children!.map((child, index) => (
          <TreeNodeItem
            key={child.id}
            node={child}
            depth={depth + 1}
            isLast={index === node.children!.length - 1}
            parentPath={currentPath}
            selectedId={selectedId}
            expandedIds={expandedIds}
            focusedId={focusedId}
            registerRef={registerRef}
            onToggleExpand={onToggleExpand}
            onSelect={onSelect}
            onKeyDown={onKeyDown}
          />
        ))
      }
    </div>
  )
}

// ── FileTree ──────────────────────────────────────────────────────────────────

export function FileTree({
  nodes,
  selectedId,
  onSelect,
  defaultExpanded,
  className,
}: FileTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    if (defaultExpanded) return new Set(defaultExpanded)
    return new Set(nodes.map(n => n.id))
  })

  const flat = useMemo(() => flatten(nodes, expandedIds), [nodes, expandedIds])
  const [focusedId, setFocusedId] = useState<string>(() => selectedId ?? nodes[0]?.id ?? '')

  const refs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const registerRef = useCallback((id: string, el: HTMLButtonElement | null) => {
    if (el) refs.current.set(id, el)
    else refs.current.delete(id)
  }, [])

  function focusRow(id: string) {
    setFocusedId(id)
    refs.current.get(id)?.focus()
  }

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else               next.add(id)
      return next
    })
  }

  const handleSelect = onSelect ?? (() => {})

  // WAI-ARIA TreeView keyboard pattern (per Usage doc 2501-54091's Accessibility section)
  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    const index = flat.findIndex(f => f.node.id === focusedId)
    if (index === -1) return
    const entry = flat[index]
    const isGroup = entry.node.type !== 'topic'
    const isExpanded = expandedIds.has(entry.node.id)

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (index < flat.length - 1) focusRow(flat[index + 1].node.id)
        break
      case 'ArrowUp':
        e.preventDefault()
        if (index > 0) focusRow(flat[index - 1].node.id)
        break
      case 'ArrowRight':
        e.preventDefault()
        if (isGroup && !isExpanded) toggleExpand(entry.node.id)
        else if (isGroup && isExpanded && index < flat.length - 1) focusRow(flat[index + 1].node.id)
        break
      case 'ArrowLeft':
        e.preventDefault()
        if (isGroup && isExpanded) toggleExpand(entry.node.id)
        else if (entry.parentId) focusRow(entry.parentId)
        break
      case 'Home':
        e.preventDefault()
        if (flat.length) focusRow(flat[0].node.id)
        break
      case 'End':
        e.preventDefault()
        if (flat.length) focusRow(flat[flat.length - 1].node.id)
        break
      case ' ':
        e.preventDefault()
        if (isGroup) toggleExpand(entry.node.id)
        else handleSelect(entry.node)
        break
    }
  }

  return (
    <div
      className={className}
      role="tree"
      aria-label="Navigation tree"
      style={{ width: '100%', overflow: 'hidden' }}
    >
      {nodes.map((node, index) => (
        <TreeNodeItem
          key={node.id}
          node={node}
          depth={0}
          isLast={index === nodes.length - 1}
          parentPath={[]}
          selectedId={selectedId}
          expandedIds={expandedIds}
          focusedId={focusedId}
          registerRef={registerRef}
          onToggleExpand={toggleExpand}
          onSelect={handleSelect}
          onKeyDown={handleKeyDown}
        />
      ))}
    </div>
  )
}
