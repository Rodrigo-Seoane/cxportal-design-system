'use client'

import { useState } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { CompanyRole } from '@/mocks/access-management/companies'

// Figma: node 3817-50546 (Company Details/Users - Modal/Add New User)

export interface NewCompanyUserInput {
  email: string
  name: string
  userId: string
  roleId: string
}

export interface AddCompanyUserModalProps {
  open: boolean
  roles: CompanyRole[]
  onClose: () => void
  onCreate: (input: NewCompanyUserInput) => void
}

export function AddCompanyUserModal({ open, roles, onClose, onCreate }: AddCompanyUserModalProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [userId, setUserId] = useState('')
  const [roleId, setRoleId] = useState('')

  const canSave = email.trim() && roleId

  const reset = () => { setEmail(''); setName(''); setUserId(''); setRoleId('') }

  const handleCreate = () => {
    if (!canSave) return
    onCreate({ email: email.trim(), name: name.trim(), userId: userId.trim(), roleId })
    reset()
  }

  return (
    <Modal open={open} onClose={onClose} size="medium" aria-labelledby="add-company-user-title">
      <ModalHeader onClose={onClose}>
        <span id="add-company-user-title">Add New User</span>
      </ModalHeader>
      <ModalBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input label="Email Address" size="small" required placeholder="Enter email address" value={email} onChange={setEmail} />
          <Input label="Name" size="small" placeholder="Enter full name (optional)" value={name} onChange={setName} />
          <Input label="User ID" size="small" placeholder="Enter user ID (optional)" value={userId} onChange={setUserId} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-body-primary)' }}>Role</span>
            <select
              value={roleId}
              onChange={e => setRoleId(e.target.value)}
              style={{ height: 24, padding: '0 8px', border: '1px solid var(--neutral-200)', borderRadius: 4, fontSize: 12, color: 'var(--text-body-primary)', fontFamily: 'var(--font-sans)', background: 'var(--neutral-0)' }}
            >
              <option value="" disabled>Select a role</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary-central" size="xs" onClick={onClose}>Cancel</Button>
        <Button variant="primary-central" size="xs" disabled={!canSave} onClick={handleCreate}>Save User</Button>
      </ModalFooter>
    </Modal>
  )
}
