'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

// Figma: node 3154-50238 (Modal Dialogs/Bulk Remove from Group)

export interface RemoveFromGroupModalProps {
  open: boolean
  entityLabel: string
  selectedCount: number
  currentGroups: string[]
  onClose: () => void
  onRemove: (groups: string[]) => void
}

export function RemoveFromGroupModal({ open, entityLabel, selectedCount, currentGroups, onClose, onRemove }: RemoveFromGroupModalProps) {
  const [checked, setChecked] = useState<string[]>(currentGroups)

  useEffect(() => { if (open) setChecked(currentGroups) }, [open, currentGroups])

  const toggle = (group: string) => {
    setChecked(prev => prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group])
  }

  return (
    <Modal open={open} onClose={onClose} size="medium" aria-labelledby="remove-from-group-title">
      <ModalHeader onClose={onClose}>
        <span id="remove-from-group-title">Bulk Remove from Group</span>
      </ModalHeader>
      <ModalBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 400, lineHeight: '28px', color: 'var(--text-body-primary)' }}>
            Remove selected {entityLabel} from groups.
          </p>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-body-primary)' }}>
            <strong>{selectedCount} Selected {entityLabel[0].toUpperCase() + entityLabel.slice(1)}</strong> will be removed from the selected group.
          </p>

          <div style={{ background: 'var(--neutral-50)', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column' }}>
            {currentGroups.map(group => (
              <div key={group} style={{ display: 'flex', alignItems: 'center', height: 32, padding: '0 8px', background: checked.includes(group) ? 'var(--content-action-primary-100)' : 'transparent', borderBottom: '1px solid var(--neutral-100)' }}>
                <Checkbox label={group} size="small" checked={checked.includes(group)} onChange={() => toggle(group)} />
              </div>
            ))}
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary-central" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant="primary-central" size="sm" disabled={checked.length === 0} onClick={() => onRemove(checked)}>Remove from Group</Button>
      </ModalFooter>
    </Modal>
  )
}
