'use client'

import { Select } from '@/components/ui/select'
import { KB_TEMPLATES } from './template-data'
import type { KBTemplate } from './template-data'

// ── Types ──────────────────────────────────────────────────────────────────────

interface TemplateDropdownProps {
  onBlank:          () => void
  onSelectTemplate: (template: KBTemplate) => void
}

// ── Options ────────────────────────────────────────────────────────────────────

const OPTIONS = [
  { value: 'blank', label: 'Start Blank' },
  ...KB_TEMPLATES.map(t => ({ value: t.id, label: t.name })),
]

// ── Component ──────────────────────────────────────────────────────────────────

export function TemplateDropdown({ onBlank, onSelectTemplate }: TemplateDropdownProps) {
  function handleChange(val: string | string[]) {
    const v = String(val)
    if (v === 'blank') {
      onBlank()
    } else {
      const template = KB_TEMPLATES.find(t => t.id === v)
      if (template) onSelectTemplate(template)
    }
  }

  return (
    <div style={{ padding: '16px 16px 0', width: 200 }}>
      <Select
        value=""
        placeholder="Use Template"
        size="small"
        options={OPTIONS}
        onChange={handleChange}
      />
    </div>
  )
}
