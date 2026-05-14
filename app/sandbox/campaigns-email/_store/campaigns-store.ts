import type { Campaign } from '../_mock/campaigns'

const store: Campaign[] = []

export function addCampaign(c: Campaign): void { store.push(c) }

export function getCampaign(id: string): Campaign | undefined {
  return store.find(c => c.id === id)
}
