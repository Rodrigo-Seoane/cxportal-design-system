'use client'

import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

// Figma: node 3745-78981 (ROLE MANAGEMENT/Index - MODAL/Delete Role)

export interface DeleteRoleModalProps {
  open: boolean
  roleName: string | null
  onClose: () => void
  onConfirm: () => void
}

export function DeleteRoleModal({ open, roleName, onClose, onConfirm }: DeleteRoleModalProps) {
  return (
    <Modal open={open} onClose={onClose} size="medium" aria-labelledby="delete-role-title">
      <ModalHeader onClose={onClose}>
        <span id="delete-role-title">Delete Role</span>
      </ModalHeader>
      <ModalBody>
        <p style={{ margin: 0, fontSize: 14, lineHeight: '20px', color: '#021920' }}>
          Are you sure you want to delete {roleName ?? 'this role'}?
        </p>
      </ModalBody>
      <ModalFooter>
        <Button variant="text-central" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant="destructive" size="sm" onClick={onConfirm}>Delete Role</Button>
      </ModalFooter>
    </Modal>
  )
}
