'use client'

import { useState } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Radio } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'

// Figma: node 3817-48196 (COMPANY MANAGEMENT/Index - MODAL/Add New Company)

export interface NewCompanyInput {
  name: string
  companyId: string
  enableLoginReport: boolean
  description: string
  authenticationType: 'password' | 'azure-sso'
}

export interface AddCompanyModalProps {
  open: boolean
  onClose: () => void
  onCreate: (input: NewCompanyInput) => void
}

export function AddCompanyModal({ open, onClose, onCreate }: AddCompanyModalProps) {
  const [name, setName] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [enableLoginReport, setEnableLoginReport] = useState(false)
  const [description, setDescription] = useState('')
  const [authType, setAuthType] = useState<'password' | 'azure-sso'>('password')

  const canSave = name.trim() && companyId.trim() && description.trim()

  const reset = () => {
    setName(''); setCompanyId(''); setEnableLoginReport(false); setDescription(''); setAuthType('password')
  }

  const handleCreate = () => {
    if (!canSave) return
    onCreate({ name: name.trim(), companyId: companyId.trim(), enableLoginReport, description: description.trim(), authenticationType: authType })
    reset()
  }

  return (
    <Modal open={open} onClose={onClose} size="medium" aria-labelledby="add-company-title">
      <ModalHeader onClose={onClose}>
        <span id="add-company-title">Add New Company</span>
      </ModalHeader>
      <ModalBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Company Name" required placeholder="Enter Company Name" value={name} onChange={setName} />
          <Input label="Company ID" required placeholder="e.g. Acme-corp" value={companyId} onChange={setCompanyId} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.24px', color: '#021920' }}>Enable Login Report</span>
            <Switch checked={enableLoginReport} onChange={setEnableLoginReport} showLabel={false} onSurface="light" />
          </div>

          <Input label="Description" required placeholder="Enter company description" value={description} onChange={setDescription} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.24px', color: '#021920' }}>Authentication Type *</span>
            <div style={{ display: 'flex', gap: 24 }}>
              <Radio label="Password" name="auth-type" value="password" checked={authType === 'password'} onChange={() => setAuthType('password')} size="small" accentColor="#0b8286" />
              <Radio label="Azure SSO (Entra ID)" name="auth-type" value="azure-sso" checked={authType === 'azure-sso'} onChange={() => setAuthType('azure-sso')} size="small" accentColor="#0b8286" />
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary-central" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant="primary-central" size="sm" disabled={!canSave} onClick={handleCreate}>Create Company</Button>
      </ModalFooter>
    </Modal>
  )
}
