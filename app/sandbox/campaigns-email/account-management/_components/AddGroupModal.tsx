'use client'

import { useState } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'

interface AddGroupModalProps {
  open:    boolean
  onClose: () => void
  onAdd:   (name: string) => void
}

export function AddGroupModal({ open, onClose, onAdd }: AddGroupModalProps) {
  const [name, setName]   = useState('')
  const [error, setError] = useState('')

  function handleClose() { setName(''); setError(''); onClose() }

  function handleSave() {
    if (!name.trim()) { setError('Campaign group name is required'); return }
    onAdd(name.trim())
    setName('')
    setError('')
  }

  return (
    <Modal open={open} onClose={handleClose} size="medium" aria-labelledby="add-group-title">
      <ModalHeader onClose={handleClose}>
        <span id="add-group-title">Add Campaign Group</span>
      </ModalHeader>
      <ModalBody>
        <Input
          label="Campaign Group Name"
          required
          placeholder="e.g. RSC — Northeast Region"
          value={name}
          onChange={setName}
          error={error}
        />
      </ModalBody>
      <ModalFooter style={{ justifyContent: 'flex-end', gap: 8 }}>
        <Button variant="secondary" size="sm" onClick={handleClose}>Cancel</Button>
        <Button variant="primary"   size="sm" onClick={handleSave} disabled={!name.trim()}>
          Add Group
        </Button>
      </ModalFooter>
    </Modal>
  )
}
