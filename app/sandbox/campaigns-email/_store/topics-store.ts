import type { Topic } from '../_mock/topics'

const store: Topic[] = []

export function addTopic(t: Topic): void { store.push(t) }

export function getTopic(id: string): Topic | undefined {
  return store.find(t => t.id === id)
}
