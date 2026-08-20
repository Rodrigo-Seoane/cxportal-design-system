'use client'

import { StackIcon, TagIcon, TrashIcon, XCircleIcon } from '@phosphor-icons/react'

export interface BulkActionBarProps {
  count: number
  onMoveToGroup: () => void
  onRemoveFromGroup: () => void
  onDelete: () => void
  onClear: () => void
}

export function BulkActionBar({ count, onMoveToGroup, onRemoveFromGroup, onDelete, onClear }: BulkActionBarProps) {
  if (count === 0) return null

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#021920' }}>Bulk Actions: [{count}]</span>
      <button onClick={onMoveToGroup} style={actionStyle}>
        <StackIcon size={14} weight="regular" aria-hidden="true" /> Move to Group
      </button>
      <button onClick={onRemoveFromGroup} style={actionStyle}>
        <TagIcon size={14} weight="regular" aria-hidden="true" /> Remove from Group
      </button>
      <button onClick={onDelete} style={{ ...actionStyle, color: '#ab0c36' }}>
        <TrashIcon size={14} weight="regular" aria-hidden="true" /> Delete
      </button>
      <button onClick={onClear} style={{ ...actionStyle, color: '#7a828c' }}>
        <XCircleIcon size={14} weight="regular" aria-hidden="true" /> Clear
      </button>
    </div>
  )
}

const actionStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'none',
  cursor: 'pointer', padding: 0, fontSize: 12, fontWeight: 600, color: '#0b8286',
}
