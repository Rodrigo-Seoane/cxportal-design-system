'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ROLE_SUMMARIES } from '@/mocks/access-management/roles'

// Figma: node 3745-80896 / 3745-80912 (USER MANAGEMENT/User Details - MODAL/Change Role)
// The "New Role" field is a searchable role combobox — Figma's label said
// "Full Name" (a copy-paste leftover from the Add User modal); relabeled here.

export interface ChangeRoleModalProps {
  open: boolean
  email: string
  currentRoleName: string
  onClose: () => void
  onSave: (newRoleId: string) => void
}

export function ChangeRoleModal({ open, email, currentRoleName, onClose, onSave }: ChangeRoleModalProps) {
  const [search, setSearch] = useState('')
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (!open) { setSearch(''); setSelectedRoleId(null) }
  }, [open])

  const matches = search
    ? ROLE_SUMMARIES.filter(r => r.name.toLowerCase().includes(search.toLowerCase())).slice(0, 6)
    : []

  return (
    <Modal open={open} onClose={onClose} size="medium" aria-labelledby="change-role-title">
      <ModalHeader onClose={onClose}>
        <span id="change-role-title">Change Role</span>
      </ModalHeader>
      <ModalBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ flex: 1 }}>
              <Input label="Email Address" required value={email} disabled onChange={() => {}} />
            </div>
            <div style={{ flex: 1 }}>
              <Input label="Current Role" required value={currentRoleName} disabled onChange={() => {}} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.24px', color: 'var(--text-body-primary)' }}>New Role</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px', border: `1px solid ${focused ? 'var(--content-action-primary-600)' : 'var(--neutral-200)'}`, borderRadius: 8 }}>
              <input
                type="search"
                value={selectedRoleId ? ROLE_SUMMARIES.find(r => r.id === selectedRoleId)?.name ?? '' : search}
                onChange={e => { setSelectedRoleId(null); setSearch(e.target.value) }}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 120)}
                placeholder="Search roles"
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: 'var(--text-body-primary)', fontFamily: 'var(--font-sans)' }}
              />
              <MagnifyingGlassIcon size={16} color="var(--text-body-secondary)" weight="regular" aria-hidden="true" />
            </div>

            {focused && matches.length > 0 && !selectedRoleId && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: 'var(--neutral-0)', border: '1px solid var(--neutral-200)', borderRadius: 8, boxShadow: '0 4px 16px rgba(2,25,32,0.14)', zIndex: 10, overflow: 'hidden' }}>
                {matches.map(role => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => { setSelectedRoleId(role.id); setSearch('') }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer', borderBottom: '1px solid var(--neutral-100)' }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-body-primary)' }}>{role.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-body-secondary)' }}>{role.permissionLevel}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary-central" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant="primary-central" size="sm" disabled={!selectedRoleId} onClick={() => selectedRoleId && onSave(selectedRoleId)}>
          Save Changes
        </Button>
      </ModalFooter>
    </Modal>
  )
}
