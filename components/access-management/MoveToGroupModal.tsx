'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

// Figma: node 3154-50199 (Modal Dialogs/Bulk Move to Group)

export interface MoveToGroupModalProps {
  open: boolean
  entityLabel: string
  selectedCount: number
  existingGroups: string[]
  onClose: () => void
  onMove: (groupName: string) => void
}

export function MoveToGroupModal({ open, entityLabel, selectedCount, existingGroups, onClose, onMove }: MoveToGroupModalProps) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const matches = existingGroups.filter(g => g.toLowerCase().includes(search.toLowerCase()))
  const canMove = selected !== null || (search.trim() && matches.length === 0)

  const handleMove = () => {
    const groupName = selected ?? search.trim()
    if (!groupName) return
    onMove(groupName)
    setSearch(''); setSelected(null)
  }

  return (
    <Modal open={open} onClose={onClose} size="medium" aria-labelledby="move-to-group-title">
      <ModalHeader onClose={onClose}>
        <span id="move-to-group-title">Bulk Move to Group</span>
      </ModalHeader>
      <ModalBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 400, lineHeight: '28px', color: 'var(--text-body-primary)' }}>
            Move selected {entityLabel} to a group.
          </p>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-body-primary)' }}>
            <strong>{selectedCount} Selected {entityLabel[0].toUpperCase() + entityLabel.slice(1)}</strong> will be moved to the selected group.
          </p>

          <div style={{ background: 'var(--neutral-50)', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 8px', background: 'var(--neutral-0)', borderBottom: '1px solid var(--neutral-100)' }}>
              <input
                type="search"
                value={search}
                onChange={e => { setSearch(e.target.value); setSelected(null) }}
                placeholder="Search existing groups"
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: 'var(--text-body-primary)', fontFamily: 'var(--font-sans)' }}
              />
              <MagnifyingGlassIcon size={18} color="var(--text-body-secondary)" weight="regular" aria-hidden="true" />
            </div>

            {matches.length > 0 ? (
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                {matches.map(group => (
                  <div key={group} style={{ display: 'flex', alignItems: 'center', height: 32, padding: '0 8px', borderBottom: '1px solid var(--neutral-100)' }}>
                    <Checkbox label={group} size="small" checked={selected === group} onChange={() => setSelected(group)} />
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--text-body-secondary)' }}>
                {search.trim()
                  ? `No matching group. Create "${search.trim()}" as a new group.`
                  : 'No groups yet — search to create one.'}
              </p>
            )}
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary-central" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant="primary-central" size="sm" disabled={!canMove} onClick={handleMove}>Move to Group</Button>
      </ModalFooter>
    </Modal>
  )
}
