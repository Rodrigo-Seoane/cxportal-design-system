'use client'

import { useState } from 'react'
import {
  ArrowLeftIcon,
  CaretRightIcon,
  FolderOpenIcon,
  FolderSimpleIcon,
  XIcon,
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

interface BulkMoveModalProps {
  articles: Article[]
  onClose: () => void
  onConfirm: (folder: string, fullPath: string) => void
}

type FolderNode = {
  id: string
  name: string
  children?: FolderNode[]
}

// ── Data ───────────────────────────────────────────────────────────────────────

const FOLDER_TREE: FolderNode = {
  id: 'my-docs',
  name: 'My Documents',
  children: [
    { id: 'ppm',      name: 'PPM TT Support' },
    { id: 'voicebot', name: 'VoiceBot Home' },
    {
      id: 'digital',
      name: 'Digital Humans',
      children: [
        { id: 'closure',      name: 'Project Closure' },
        { id: 'change-mgmt',  name: 'Change Management' },
        {
          id: 'planning',
          name: 'Planning',
          children: [
            { id: 'plan',   name: 'Plan' },
            { id: 'budget', name: 'Budget' },
          ],
        },
        { id: 'proj-init',    name: 'Project Initiation' },
        { id: 'dev',          name: 'Development' },
        { id: 'requirements', name: 'Requirements' },
        { id: 'comm',         name: 'Communication' },
        { id: 'invoices',     name: 'Invoices/Financials' },
      ],
    },
    { id: 'rag', name: 'Rag Workgroup - Site' },
  ],
}

const FOLDER_PATH: Record<string, string> = {
  'my-docs':      'My Documents',
  'ppm':          'My Documents/PPM TT Support',
  'voicebot':     'My Documents/VoiceBot Home',
  'digital':      'My Documents/Digital Humans',
  'closure':      'My Documents/Digital Humans/Project Closure',
  'change-mgmt':  'My Documents/Digital Humans/Change Management',
  'planning':     'My Documents/Digital Humans/Planning',
  'plan':         'My Documents/Digital Humans/Planning/Plan',
  'budget':       'My Documents/Digital Humans/Planning/Budget',
  'proj-init':    'My Documents/Digital Humans/Project Initiation',
  'dev':          'My Documents/Digital Humans/Development',
  'requirements': 'My Documents/Digital Humans/Requirements',
  'comm':         'My Documents/Digital Humans/Communication',
  'invoices':     'My Documents/Digital Humans/Invoices/Financials',
  'rag':          'My Documents/Rag Workgroup - Site',
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BulkMoveModal({ articles, onClose, onConfirm }: BulkMoveModalProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(['my-docs', 'digital'])
  )

  function toggleExpanded(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedFolder = selectedFolderId
    ? { name: FOLDER_PATH[selectedFolderId].split('/').pop()!, fullPath: FOLDER_PATH[selectedFolderId] }
    : null

  const canConfirm = selectedFolderId !== null

  return (
    <div style={{
      position:      'fixed',
      inset:         0,
      zIndex:        1001,
      background:    'var(--neutral-50)',
      display:       'flex',
      flexDirection: 'column',
      overflow:      'hidden',
    }}>
      {/* Page header */}
      <div style={{
        background:    'var(--neutral-0)',
        borderBottom:  '1px solid var(--neutral-100)',
        padding:       '16px 24px',
        flexShrink:    0,
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-body-primary)', margin: 0 }}>
          Move Files to Folder
        </h2>
        <p style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-body-secondary)', margin: '2px 0 0' }}>
          Manage your documents and folders
        </p>
      </div>

      {/* Content area */}
      <div style={{
        flex:      1,
        overflow:  'hidden',
        display:   'flex',
        padding:   '16px 24px',
        gap:       16,
      }}>
        {/* Left sidebar */}
        <div style={{
          width:         328,
          flexShrink:    0,
          background:    'var(--neutral-0)',
          borderRadius:  8,
          border:        '1px solid var(--neutral-100)',
          padding:       16,
          display:       'flex',
          flexDirection: 'column',
          gap:           12,
          overflowY:     'auto',
        }}>
          {/* Back button */}
          <button
            onClick={onClose}
            style={{
              display:        'flex',
              alignItems:     'center',
              gap:            6,
              background:     'transparent',
              border:         'none',
              cursor:         'pointer',
              padding:        0,
              color:          'var(--content-action-primary-default)',
              fontSize:       12,
              fontWeight:     600,
            }}
          >
            <ArrowLeftIcon size={14} />
            Back to Article List
          </button>

          <h2 style={{ fontSize: 24, fontWeight: 400, color: 'var(--text-body-primary)', margin: 0 }}>
            Select recipient folder
          </h2>

          <p style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-body-secondary)', margin: 0 }}>
            Click on a folder in the tree below to set it as the destination for all selected documents.
          </p>

          {/* Folder tree */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <TreeNode
              node={FOLDER_TREE}
              depth={0}
              selectedFolderId={selectedFolderId}
              expandedIds={expandedIds}
              onSelect={setSelectedFolderId}
              onToggle={toggleExpanded}
            />
          </div>
        </div>

        {/* Right main content */}
        <div style={{
          flex:          1,
          background:    'var(--neutral-0)',
          borderRadius:  8,
          border:        '1px solid var(--neutral-100)',
          display:       'flex',
          flexDirection: 'column',
          overflow:      'hidden',
        }}>
          {/* Right header */}
          <div style={{
            padding:      16,
            borderBottom: '1px solid var(--neutral-100)',
            flexShrink:   0,
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 400, color: 'var(--text-body-primary)', margin: '0 0 4px' }}>
              Affected Documents
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-body-primary)', margin: 0 }}>
              The <strong>{articles.length} article{articles.length !== 1 ? 's' : ''}</strong> below will have their location changed in bulk
            </p>
          </div>

          {/* Table */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ background: 'var(--neutral-100)', borderBottom: '1px solid var(--neutral-100)' }}>
                  <th style={thStyle(280)}>Article Name</th>
                  <th style={thStyle(263)}>Current Folder</th>
                  <th style={thStyle(263)}>Destination Folder</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article, i) => (
                  <tr
                    key={article.id}
                    style={{
                      background:   i % 2 === 0 ? 'var(--neutral-0)' : 'var(--neutral-50)',
                      borderBottom: '1px solid var(--neutral-100)',
                    }}
                  >
                    <td style={tdStyle(280)}>{article.title}</td>
                    <td style={tdStyle(263)}>/{article.folder}</td>
                    <td style={{ ...tdStyle(263), color: selectedFolder ? 'var(--text-body-primary)' : 'var(--neutral-300)' }}>
                      {selectedFolder ? selectedFolder.fullPath : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={{
            padding:    16,
            borderTop:  '1px solid var(--neutral-100)',
            flexShrink: 0,
            display:    'flex',
            gap:        8,
          }}>
            <button
              onClick={onClose}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          6,
                background:   'transparent',
                border:       '1px solid var(--content-action-primary-600)',
                color:        'var(--content-action-primary-default)',
                padding:      8,
                borderRadius: 8,
                fontSize:     12,
                cursor:       'pointer',
              }}
            >
              <XIcon size={14} />
              Cancel
            </button>

            <button
              onClick={() => {
                if (selectedFolder) {
                  onConfirm(selectedFolder.name, selectedFolder.fullPath)
                }
              }}
              disabled={!canConfirm}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          6,
                background:   'var(--content-action-primary-600)',
                border:       '1px solid var(--content-action-primary-600)',
                color:        'var(--neutral-100)',
                padding:      8,
                borderRadius: 8,
                fontSize:     12,
                cursor:       canConfirm ? 'pointer' : 'not-allowed',
                opacity:      canConfirm ? 1 : 0.5,
              }}
            >
              <FolderOpenIcon size={14} />
              Move Files
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface TreeNodeProps {
  node:              FolderNode
  depth:             number
  selectedFolderId:  string | null
  expandedIds:       Set<string>
  onSelect:          (id: string) => void
  onToggle:          (id: string) => void
}

function TreeNode({ node, depth, selectedFolderId, expandedIds, onSelect, onToggle }: TreeNodeProps) {
  const [hovered, setHovered] = useState(false)

  const hasChildren = (node.children?.length ?? 0) > 0
  const isExpanded  = expandedIds.has(node.id)
  const isSelected  = selectedFolderId === node.id

  const bg        = isSelected ? 'var(--content-action-primary-600)' : hovered ? 'var(--content-action-primary-100)' : 'transparent'
  const textColor = isSelected ? 'var(--neutral-0)' : 'var(--text-body-primary)'
  const iconColor = isSelected ? 'var(--neutral-0)' : 'var(--text-body-secondary)'

  return (
    <div>
      <div
        onClick={() => {
          if (hasChildren) onToggle(node.id)
          onSelect(node.id)
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          height:       28,
          display:      'flex',
          alignItems:   'center',
          cursor:       'pointer',
          paddingLeft:  depth * 16 + 4,
          paddingRight: 8,
          borderRadius: 4,
          background:   bg,
          gap:          2,
          userSelect:   'none',
        }}
      >
        {/* Rotating caret — hidden (visibility hidden) for leaf nodes to preserve alignment */}
        <span style={{
          display:    'flex',
          alignItems: 'center',
          width:      16,
          flexShrink: 0,
          transform:  isExpanded ? 'rotate(90deg)' : 'none',
          transition: 'transform 0.15s ease',
          visibility: hasChildren ? 'visible' : 'hidden',
        }}>
          <CaretRightIcon size={12} color={iconColor} />
        </span>
        {/* Folder icon — open when expanded or selected */}
        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {(isExpanded || isSelected)
            ? <FolderOpenIcon   size={14} color={isSelected ? 'var(--neutral-0)' : 'var(--content-action-primary-600)'} />
            : <FolderSimpleIcon size={14} color={iconColor} />
          }
        </span>
        {/* Label */}
        <span style={{
          fontSize:   12,
          fontWeight: isSelected ? 600 : 400,
          color:      textColor,
          paddingLeft: 6,
          whiteSpace: 'nowrap',
          overflow:   'hidden',
          textOverflow: 'ellipsis',
        }}>
          {node.name}
        </span>
      </div>

      {/* Children — only rendered when expanded */}
      {hasChildren && isExpanded && (
        <div style={{ position: 'relative' }}>
          {/* Vertical guide line */}
          <div style={{
            position:   'absolute',
            left:       depth * 16 + 4 + 11,
            top:        0,
            bottom:     4,
            width:      1,
            background: 'var(--neutral-200)',
          }} />
          {node.children!.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedFolderId={selectedFolderId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Style helpers ─────────────────────────────────────────────────────────────

function thStyle(width: number): React.CSSProperties {
  return {
    width,
    height:     40,
    padding:    8,
    fontSize:   12,
    fontWeight: 600,
    color:      'var(--text-body-primary)',
    textAlign:  'left',
  }
}

function tdStyle(width: number): React.CSSProperties {
  return {
    width,
    padding:  8,
    fontSize: 12,
    color:    'var(--text-body-primary)',
  }
}
