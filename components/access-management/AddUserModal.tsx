'use client'

import { useState } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Radio } from '@/components/ui/checkbox'
import { ROLE_SUMMARIES } from '@/mocks/access-management/roles'

// Figma: node 3745-80111 / 3745-80123 (USER MANAGEMENT/Index - MODAL/Add New User)
// Two hand-off states (Password / SSO) merged into one interactive modal here.

export interface NewUserInput {
  email: string
  fullName: string
  userId: string
  loginMethod: 'password' | 'sso'
  roleId: string
}

export interface AddUserModalProps {
  open: boolean
  onClose: () => void
  onCreate: (input: NewUserInput) => void
}

export function AddUserModal({ open, onClose, onCreate }: AddUserModalProps) {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [userId, setUserId] = useState('')
  const [loginMethod, setLoginMethod] = useState<'password' | 'sso'>('password')
  const [roleId, setRoleId] = useState('')

  const canSave = email.trim() && roleId

  const reset = () => {
    setEmail(''); setFullName(''); setUserId(''); setLoginMethod('password'); setRoleId('')
  }

  const handleCreate = () => {
    if (!canSave) return
    onCreate({ email: email.trim(), fullName: fullName.trim(), userId: userId.trim(), loginMethod, roleId })
    reset()
  }

  return (
    <Modal open={open} onClose={onClose} size="medium" aria-labelledby="add-user-title">
      <ModalHeader onClose={onClose}>
        <span id="add-user-title">Add New User</span>
      </ModalHeader>
      <ModalBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Email Address" required placeholder="Enter email address" value={email} onChange={setEmail} />
          <Input label="Full Name" placeholder="Enter full name" value={fullName} onChange={setFullName} />
          <Input label="User ID" placeholder="Enter user ID" value={userId} onChange={setUserId} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.24px', color: 'var(--text-body-primary)' }}>Login Method</span>
            <div style={{ display: 'flex', gap: 24 }}>
              <Radio label="Password" name="login-method" value="password" checked={loginMethod === 'password'} onChange={() => setLoginMethod('password')} size="small" accentColor="var(--content-action-primary-600)" />
              <Radio label="SSO" name="login-method" value="sso" checked={loginMethod === 'sso'} onChange={() => setLoginMethod('sso')} size="small" accentColor="var(--content-action-primary-600)" />
            </div>
            {loginMethod === 'sso' && (
              <p style={{ margin: 0, fontSize: 10, lineHeight: '16px', color: 'var(--text-body-secondary)' }}>
                SSO users will be able to log in once they authenticate through their identity provider. No invitation email will be sent.
              </p>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.24px', color: 'var(--text-body-primary)' }}>Role *</span>
            <select
              value={roleId}
              onChange={e => setRoleId(e.target.value)}
              style={{
                height: 36, padding: '0 8px', border: '1px solid var(--neutral-200)', borderRadius: 8,
                fontSize: 14, color: roleId ? 'var(--text-body-primary)' : 'var(--text-body-secondary)', fontFamily: 'var(--font-sans)', background: 'var(--neutral-0)',
              }}
            >
              <option value="" disabled>Select a role</option>
              {ROLE_SUMMARIES.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary-central" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant="primary-central" size="sm" disabled={!canSave} onClick={handleCreate}>Save New User</Button>
      </ModalFooter>
    </Modal>
  )
}
