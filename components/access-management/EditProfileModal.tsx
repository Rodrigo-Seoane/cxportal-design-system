'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Figma: node 3745-80891 (USER MANAGEMENT/User Details - MODAL/Edit Profile)

export interface EditProfileModalProps {
  open: boolean
  email: string
  fullName: string
  onClose: () => void
  onSave: (fullName: string) => void
}

export function EditProfileModal({ open, email, fullName, onClose, onSave }: EditProfileModalProps) {
  const [name, setName] = useState(fullName)

  useEffect(() => { if (open) setName(fullName) }, [open, fullName])

  return (
    <Modal open={open} onClose={onClose} size="medium" aria-labelledby="edit-profile-title">
      <ModalHeader onClose={onClose}>
        <span id="edit-profile-title">Edit Profile</span>
      </ModalHeader>
      <ModalBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Email Address" required value={email} disabled onChange={() => {}} />
          <Input label="Full Name" placeholder="Enter full name" value={name} onChange={setName} />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary-central" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant="primary-central" size="sm" onClick={() => onSave(name.trim())}>Update Profile</Button>
      </ModalFooter>
    </Modal>
  )
}
