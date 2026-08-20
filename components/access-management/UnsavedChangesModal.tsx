'use client'

import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

// Figma: node 3745-79444 — guards against silently losing pending permission
// changes when the admin clicks a different instance in the left selector.

export interface UnsavedChangesModalProps {
  open: boolean
  targetInstance: string | null
  onDismissChanges: () => void
  onSaveChanges: () => void
  onClose: () => void
}

export function UnsavedChangesModal({
  open,
  targetInstance,
  onDismissChanges,
  onSaveChanges,
  onClose,
}: UnsavedChangesModalProps) {
  return (
    <Modal open={open} onClose={onClose} size="medium" aria-labelledby="unsaved-changes-title">
      <ModalHeader onClose={onClose}>
        <span id="unsaved-changes-title">Unsaved Changes</span>
      </ModalHeader>
      <ModalBody>
        <p style={{ margin: 0, fontSize: 14, lineHeight: '20px', color: '#021920' }}>
          You have unsaved changes for {targetInstance ?? 'this instance'}. Save, discard, or stay?
        </p>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary-central" size="sm" onClick={onDismissChanges}>Dismiss Changes</Button>
        <Button variant="primary-central" size="sm" onClick={onSaveChanges}>Save Changes</Button>
      </ModalFooter>
    </Modal>
  )
}
