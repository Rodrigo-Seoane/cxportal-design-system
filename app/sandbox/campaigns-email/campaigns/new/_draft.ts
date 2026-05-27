import type { CampaignType } from '../../_mock/campaigns'

export interface Draft {
  // Step 1: Type
  groupId:      string
  type:         CampaignType | ''
  // Step 2: Message
  name:         string
  subject:      string        // email-campaign only
  senderId:     string
  listId:       string
  templateId:   string        // email-campaign only
  bodyHtml:     string        // email-campaign only, editable
  // Step 3: Schedule
  scheduleMode: 'now' | 'scheduled'
  scheduleDate: string        // YYYY-MM-DD
  scheduleTime: string        // HH:MM
}

export const DRAFT_INIT: Draft = {
  groupId: '', type: '', name: '', subject: '', senderId: '',
  listId: '', templateId: '', bodyHtml: '',
  scheduleMode: 'now', scheduleDate: '', scheduleTime: '',
}

export function canProceed(step: number, draft: Draft): boolean {
  if (step === 0) return draft.groupId !== '' && draft.type !== ''
  if (step === 1) {
    const base = draft.name.trim() !== '' && draft.senderId !== '' && draft.listId !== ''
    return draft.type === 'email-campaign' ? base && draft.subject.trim() !== '' : base
  }
  if (step === 2) return draft.scheduleMode === 'now' || (draft.scheduleDate !== '' && draft.scheduleTime !== '')
  return true
}
