'use client'

import { useState } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { SENDERS }    from '../../_mock/senders'
import { TEMPLATES }  from '../../_mock/templates'
import { LISTS }      from '../../_mock/lists'
import { CAMPAIGN_GROUPS } from '../../_mock/groups'
import type { Topic } from '../../_mock/topics'

interface AddTopicModalProps {
  open:             boolean
  onClose:          () => void
  onAdd:            (topic: Topic) => void
  accountGroupIds:  string[]
}

const SENDER_OPTIONS = [
  { value: '', label: 'No default' },
  ...SENDERS.filter(s => s.status === 'verified').map(s => ({ value: s.id, label: s.displayName })),
]

const TEMPLATE_OPTIONS = [
  { value: '', label: 'No default' },
  ...TEMPLATES.filter(t => t.status === 'published').map(t => ({ value: t.id, label: t.name })),
]

const LIST_OPTIONS = [
  { value: '', label: 'No default' },
  ...LISTS.map(l => ({ value: l.id, label: l.name })),
]

export function AddTopicModal({ open, onClose, onAdd, accountGroupIds }: AddTopicModalProps) {
  const [name,        setName]        = useState('')
  const [description, setDescription] = useState('')
  const [senderId,    setSenderId]    = useState('')
  const [templateId,  setTemplateId]  = useState('')
  const [listId,      setListId]      = useState('')
  const [enabled,     setEnabled]     = useState(true)
  const [nameError,   setNameError]   = useState('')

  const groupOptions = [
    { value: '', label: 'No group' },
    ...CAMPAIGN_GROUPS.filter(g => accountGroupIds.includes(g.id)).map(g => ({ value: g.id, label: g.name })),
  ]
  const [groupId, setGroupId] = useState(accountGroupIds[0] ?? '')

  function handleClose() {
    setName(''); setDescription(''); setSenderId(''); setTemplateId('')
    setListId(''); setEnabled(true); setNameError('')
    setGroupId(accountGroupIds[0] ?? '')
    onClose()
  }

  function handleSave() {
    if (!name.trim()) { setNameError('Topic name is required'); return }
    const group = CAMPAIGN_GROUPS.find(g => g.id === groupId)
    const newTopic: Topic = {
      id:                `topic-new-${Date.now()}`,
      name:              name.trim(),
      componentId:       group?.componentId ?? 'rsc',
      groupId:           groupId || (accountGroupIds[0] ?? 'rsc-g1'),
      subscriberCount:   0,
      defaultTemplateId: templateId || null,
      defaultSenderId:   senderId   || null,
      defaultListId:     listId     || null,
      openRate:          0,
      lastSentAt:        null,
      createdAt:         new Date().toISOString(),
    }
    onAdd(newTopic)
    handleClose()
  }

  return (
    <Modal open={open} onClose={handleClose} size="medium" aria-labelledby="add-topic-title">
      <ModalHeader onClose={handleClose}>
        <span id="add-topic-title">Create Topic</span>
      </ModalHeader>
      <ModalBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Topic Name" required placeholder="e.g. Annual COLA Notification"
            value={name} onChange={setName} error={nameError} />
          <Input label="Description" placeholder="Brief description of this topic"
            value={description} onChange={setDescription} />
          <Select label="Campaign Group" options={groupOptions} value={groupId}
            onChange={v => setGroupId(v as string)} />
          <Select label="Default Sender" options={SENDER_OPTIONS} value={senderId}
            onChange={v => setSenderId(v as string)} />
          <Select label="Default Template" options={TEMPLATE_OPTIONS} value={templateId}
            onChange={v => setTemplateId(v as string)} />
          <Select label="Default Recipient List" options={LIST_OPTIONS} value={listId}
            onChange={v => setListId(v as string)} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 500 }}>Enabled</span>
            <Switch checked={enabled} onChange={setEnabled} />
          </div>
        </div>
      </ModalBody>
      <ModalFooter style={{ justifyContent: 'flex-end', gap: 8 }}>
        <Button variant="secondary" size="sm" onClick={handleClose}>Cancel</Button>
        <Button variant="primary"   size="sm" onClick={handleSave} disabled={!name.trim()}>
          Create Topic
        </Button>
      </ModalFooter>
    </Modal>
  )
}
