'use client'

import { useState } from 'react'
import {
  CaretDownIcon,
  CaretRightIcon,
  FileTextIcon,
} from '@phosphor-icons/react'

// ── Design tokens ─────────────────────────────────────────────────────────────

const T = {
  surface:          'var(--color-surface-section, #ffffff)',
  surfaceSelected:  'var(--content-action-primary-100)',
  controllerActive: 'var(--color-primary, var(--content-action-primary-600))', // --surface/action/primary
  controllerBorder: 'var(--content-action-primary-600)', // --border-color/surface-active/primary
  connectorLine:    'var(--neutral-100)',
  borderBottom:     'var(--neutral-100)',
  text:             'var(--text-body-primary)',          // --text/on-action/secondary
  iconWhite:        'var(--neutral-0)',
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

// ── Internal: single row ──────────────────────────────────────────────────────

function TreeRow({
  node,
  depth,
  isSelected,
  isExpanded,
  isLast,
  parentPath,
  onToggle,
  onSelect,
}: {
  node:       FileTreeNode
  depth:      number
  isSelected: boolean
  isExpanded: boolean
  isLast:     boolean
  parentPath: boolean[]
  onToggle:   () => void
  onSelect:   () => void
}) {
  const isTopic = node.type === 'topic'
  const isGroup = !isTopic

  const ctrlBg    = isSelected ? T.controllerActive : T.surface
  const titleBg   = isSelected ? T.surfaceSelected  : T.surface
  const iconColor = isSelected ? T.iconWhite        : T.text

  const currentPath = [...parentPath, isLast]

  function handleClick() {
    if (isGroup) onToggle()
    else         onSelect()
  }

  return (
    <button
      onClick={handleClick}
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
            // Skip lines for the root level (pathIndex 0 corresponds to depth 0)
            if (pathIndex >= currentPath.length) return null

            // Continuation line: hide if this ancestor was the last child
            const isCurrentLevel = pathIndex === currentPath.length - 1

            if (!isCurrentLevel) {
              // Ancestor continuation line — only show if ancestor was NOT the last child
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

            // Current level connector — sits at the PARENT's controller center, half-height if last child
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
        borderRight:   isSelected && isTopic ? `1px solid ${T.controllerBorder}` : 'none',
        display:       'flex',
        alignItems:    'center',
        justifyContent:'center',
      }}>
        {isGroup && (
          isExpanded
            ? <CaretDownIcon  size={12} color={iconColor} />
            : <CaretRightIcon size={12} color={iconColor} />
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
  onToggleExpand,
  onSelect,
}: {
  node:           FileTreeNode
  depth:          number
  isLast:         boolean
  parentPath:     boolean[]
  selectedId?:    string
  expandedIds:    Set<string>
  onToggleExpand: (id: string) => void
  onSelect:       (node: FileTreeNode) => void
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
        onToggle={() => onToggleExpand(node.id)}
        onSelect={() => onSelect(node)}
      />

      {/* Children */}
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
            onToggleExpand={onToggleExpand}
            onSelect={onSelect}
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
    // Default: expand all root-level nodes
    return new Set(nodes.map(n => n.id))
  })

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else               next.add(id)
      return next
    })
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
          onToggleExpand={toggleExpand}
          onSelect={onSelect ?? (() => {})}
        />
      ))}
    </div>
  )
}
