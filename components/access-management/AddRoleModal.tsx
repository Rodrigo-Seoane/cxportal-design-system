'use client'

import { useState } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Figma: node 3745-78985 (ROLE MANAGEMENT/Index - MODAL/Add New Role)

export interface AddRoleModalProps {
  open: boolean
  onClose: () => void
  onCreate: (name: string, description: string) => void
}

export function AddRoleModal({ open, onClose, onCreate }: AddRoleModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleCreate = () => {
    if (!name.trim() || !description.trim()) return
    onCreate(name.trim(), description.trim())
    setName('')
    setDescription('')
  }

  return (
    <Modal open={open} onClose={onClose} size="medium" aria-labelledby="add-role-title">
      <ModalHeader onClose={onClose}>
        <span id="add-role-title">Add New Role</span>
      </ModalHeader>
      <ModalBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Role Name"
            required
            placeholder="Enter Role Name"
            value={name}
            onChange={setName}
          />
          <Input
            label="Description"
            required
            placeholder="Enter role description"
            value={description}
            onChange={setDescription}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary-central" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant="primary-central" size="sm" disabled={!name.trim() || !description.trim()} onClick={handleCreate}>
          Create Role
        </Button>
      </ModalFooter>
    </Modal>
  )
}
