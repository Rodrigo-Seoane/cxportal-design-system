'use client'

import { useState } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Figma: node 3817-50553 (Company Details/Roles - Modal/Add New Role)

export interface NewCompanyRoleInput {
  name: string
  description: string
}

export interface AddCompanyRoleModalProps {
  open: boolean
  onClose: () => void
  onCreate: (input: NewCompanyRoleInput) => void
}

export function AddCompanyRoleModal({ open, onClose, onCreate }: AddCompanyRoleModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const canSave = name.trim() && description.trim()

  const handleCreate = () => {
    if (!canSave) return
    onCreate({ name: name.trim(), description: description.trim() })
    setName(''); setDescription('')
  }

  return (
    <Modal open={open} onClose={onClose} size="medium" aria-labelledby="add-company-role-title">
      <ModalHeader onClose={onClose}>
        <span id="add-company-role-title">Add New Role</span>
      </ModalHeader>
      <ModalBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input label="Role Name" size="small" required placeholder="Enter role name" value={name} onChange={setName} />
          <Input label="Description" size="small" required placeholder="Enter role description" value={description} onChange={setDescription} />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary-central" size="xs" onClick={onClose}>Cancel</Button>
        <Button variant="primary-central" size="xs" disabled={!canSave} onClick={handleCreate}>Save Role</Button>
      </ModalFooter>
    </Modal>
  )
}
