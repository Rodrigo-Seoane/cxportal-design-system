'use client'

import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

export interface ConfirmActionModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  destructive?: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ConfirmActionModal({
  open, title, message, confirmLabel, destructive = false, onClose, onConfirm,
}: ConfirmActionModalProps) {
  return (
    <Modal open={open} onClose={onClose} size="medium" aria-labelledby="confirm-action-title">
      <ModalHeader onClose={onClose}>
        <span id="confirm-action-title">{title}</span>
      </ModalHeader>
      <ModalBody>
        <p style={{ margin: 0, fontSize: 14, lineHeight: '20px', color: 'var(--text-body-primary)' }}>{message}</p>
      </ModalBody>
      <ModalFooter>
        <Button variant="text-central" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant={destructive ? 'destructive' : 'primary'} size="sm" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
