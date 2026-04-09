import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Checkbox, Radio } from '@/components/ui/checkbox'
import { Plus } from 'lucide-react'

// ─── Prop schema types ──────────────────────────────────────────────────────

export type SelectControl = {
  type: 'select'
  label: string
  options: readonly string[]
  default: string
}
/** Renders as a row of clickable pill buttons — good for small option sets */
export type ChipSelectControl = {
  type: 'chip-select'
  label: string
  options: readonly string[]
  default: string
}
export type BooleanControl = {
  type: 'boolean'
  label: string
  default: boolean
}
export type TextControl = {
  type: 'text'
  label: string
  default: string
}
export type PropControl = SelectControl | ChipSelectControl | BooleanControl | TextControl
export type PropSchema = Record<string, PropControl>
export type PropValues = Record<string, string | boolean>

// ─── Registry entry ─────────────────────────────────────────────────────────

export type ComponentEntry = {
  slug: string
  title: string
  description: string
  status: 'stable' | 'wip' | 'deprecated'
  scope: Record<string, unknown>
  propSchema: PropSchema
  generateCode: (values: PropValues) => string
}

// ─── Icon size map (for icon-only mode) ─────────────────────────────────────

const ICON_SIZE_MAP: Record<string, string> = {
  regular: 'icon-regular',
  sm: 'icon-sm',
  xs: 'icon-xs',
}

// ─── Registry ───────────────────────────────────────────────────────────────

export const registry: Record<string, ComponentEntry> = {
  button: {
    slug: 'button',
    title: 'Button',
    description:
      'Triggers an action or navigation. Four visual variants aligned to usage context, three sizes, and icon support.',
    status: 'stable',
    scope: { Button, Plus },
    propSchema: {
      variant: {
        type: 'chip-select',
        label: 'Variant',
        options: ['primary', 'secondary', 'form-controls', 'text'],
        default: 'primary',
      },
      size: {
        type: 'chip-select',
        label: 'Size',
        options: ['regular', 'sm', 'xs'],
        default: 'regular',
      },
      iconPosition: {
        type: 'chip-select',
        label: 'Icon',
        options: ['none', 'left', 'right', 'only'],
        default: 'none',
      },
      disabled: {
        type: 'boolean',
        label: 'Disabled',
        default: false,
      },
      children: {
        type: 'text',
        label: 'Label',
        default: 'Button label',
      },
    },
    generateCode: ({ variant, size, disabled, children, iconPosition }) => {
      const v = String(variant)
      const s = String(size)
      const pos = String(iconPosition)
      const label = String(children)
      const disabledAttr = disabled ? ' disabled' : ''

      // Icon-only: swap size to icon-* variant, no label
      if (pos === 'only') {
        const iconSize = ICON_SIZE_MAP[s] ?? 'icon-regular'
        return `<Button variant="${v}" size="${iconSize}"${disabledAttr} aria-label="Action">\n  <Plus />\n</Button>`
      }

      // Label only
      if (pos === 'none') {
        return `<Button variant="${v}" size="${s}"${disabledAttr}>\n  ${label}\n</Button>`
      }

      // Icon left
      if (pos === 'left') {
        return `<Button variant="${v}" size="${s}"${disabledAttr}>\n  <Plus />\n  ${label}\n</Button>`
      }

      // Icon right
      return `<Button variant="${v}" size="${s}"${disabledAttr}>\n  ${label}\n  <Plus />\n</Button>`
    },
  },

  // ─── Input ────────────────────────────────────────────────────────────────
  input: {
    slug: 'input',
    title: 'Input',
    description:
      'Text entry fields for forms. Combines a Label and a Field — supports text, email, number, date, password, and textarea variants with hint and error states.',
    status: 'stable',
    scope: { Input },
    propSchema: {
      variant: {
        type: 'chip-select',
        label: 'Variant',
        options: ['text', 'email', 'number', 'date', 'password', 'textarea'],
        default: 'text',
      },
      labelVisible: {
        type: 'boolean',
        label: 'Label visible',
        default: true,
      },
      required: {
        type: 'boolean',
        label: 'Required',
        default: false,
      },
      disabled: {
        type: 'boolean',
        label: 'Disabled',
        default: false,
      },
      showError: {
        type: 'boolean',
        label: 'Error state',
        default: false,
      },
      showHint: {
        type: 'boolean',
        label: 'Hint text',
        default: false,
      },
    },
    generateCode: ({ variant, labelVisible, required, disabled, showError, showHint }) => {
      const v   = String(variant)
      const lv  = labelVisible === true || labelVisible === 'true'
      const req = required    === true || required    === 'true'
      const dis = disabled    === true || disabled    === 'true'
      const err = showError   === true || showError   === 'true'
      const hnt = showHint    === true || showHint    === 'true'

      const labelMap: Record<string, string> = {
        text:     'Full Name',
        email:    'Email',
        number:   'Amount',
        date:     'Date',
        password: 'Password',
        textarea: 'Message',
      }

      const lines: string[] = [`<Input`]
      lines.push(`  variant="${v}"`)
      lines.push(`  label="${labelMap[v] ?? 'Label'}"`)
      if (!lv)  lines.push(`  labelVisible={false}`)
      if (req)  lines.push(`  required`)
      if (dis)  lines.push(`  disabled`)
      if (err)  lines.push(`  error="This field is required."`)
      if (hnt && !err) lines.push(`  hint="Enter your ${labelMap[v]?.toLowerCase() ?? 'value'}."`)
      lines.push(`/>`)

      return lines.join('\n')
    },
  },

  // ─── Select ───────────────────────────────────────────────────────────────
  select: {
    slug: 'select',
    title: 'Select',
    description:
      'A dropdown field for choosing one or multiple options from a list. Supports single and multi-select, optional search, two sizes, and a contextual-icon variant.',
    status: 'stable',
    scope: {
      Select,
      SELECT_OPTIONS: [
        { label: 'Option one',   value: 'opt-1' },
        { label: 'Option two',   value: 'opt-2' },
        { label: 'Option three', value: 'opt-3' },
        { label: 'Option four',  value: 'opt-4' },
        { label: 'Option five',  value: 'opt-5' },
      ],
    },
    propSchema: {
      size: {
        type: 'chip-select',
        label: 'Size',
        options: ['regular', 'small'],
        default: 'regular',
      },
      type: {
        type: 'chip-select',
        label: 'Type',
        options: ['simple', 'complex'],
        default: 'simple',
      },
      multiSelect: {
        type: 'boolean',
        label: 'Multi-select',
        default: false,
      },
      searchable: {
        type: 'boolean',
        label: 'Searchable',
        default: false,
      },
      disabled: {
        type: 'boolean',
        label: 'Disabled',
        default: false,
      },
      showError: {
        type: 'boolean',
        label: 'Error state',
        default: false,
      },
    },
    generateCode: ({ size, type, multiSelect, searchable, disabled, showError }) => {
      const s   = String(size)
      const t   = String(type)
      const ms  = multiSelect  === true || multiSelect  === 'true'
      const srch = searchable  === true || searchable   === 'true'
      const dis  = disabled    === true || disabled     === 'true'
      const err  = showError   === true || showError    === 'true'

      const lines: string[] = ['<Select']
      lines.push(`  options={SELECT_OPTIONS}`)
      if (s !== 'regular') lines.push(`  size="${s}"`)
      if (t !== 'simple')  lines.push(`  type="${t}"`)
      if (ms)              lines.push(`  multiSelect`)
      if (srch)            lines.push(`  searchable`)
      if (dis)             lines.push(`  disabled`)
      if (err)             lines.push(`  error="Please select an option."`)
      lines.push(`/>`)
      return lines.join('\n')
    },
  },

  // ─── Navigation ──────────────────────────────────────────────────────────────
  navigation: {
    slug: 'navigation',
    title: 'Navigation',
    description:
      'Vertical side navigation with collapsible groups, icon-labelled headers, and two-level hierarchy. Dark-mode-first with Light/SemiBold typography and blue interactive states.',
    status: 'stable',
    scope: {},
    propSchema: {
      type: {
        type: 'chip-select',
        label: 'Type',
        options: ['Menu Item', 'Sub Menu Item'],
        default: 'Menu Item',
      },
      state: {
        type: 'chip-select',
        label: 'State',
        options: ['Default', 'Hover', 'Active', 'Disabled'],
        default: 'Default',
      },
    },
    generateCode: ({ type, state }) => {
      const t = String(type)
      const s = String(state)
      if (t === 'Sub Menu Item') {
        const bg = s === 'Active' ? '#3264b8' : s === 'Hover' ? '#4285f4' : 'transparent'
        const fw = s === 'Active' ? 600 : 300
        return [
          `<div style={{`,
          `  display: 'flex',`,
          `  alignItems: 'center',`,
          `  height: 40,`,
          `  paddingLeft: 48,`,
          `  paddingRight: 24,`,
          `  background: '${bg}',`,
          `}}>`,
          `  <span style={{ fontSize: 14, fontWeight: ${fw}, color: '#eff1f3' }}>`,
          `    Sub Menu Label`,
          `  </span>`,
          `</div>`,
        ].join('\n')
      }
      const bg = s === 'Active' ? '#3264b8' : s === 'Hover' ? '#4285f4' : 'transparent'
      return [
        `<div style={{`,
        `  display: 'flex',`,
        `  alignItems: 'center',`,
        `  height: 48,`,
        `  padding: '0 12px',`,
        `  gap: 8,`,
        `  background: '${bg}',`,
        `}}>`,
        `  {/* icon */}`,
        `  <span style={{ fontSize: 14, fontWeight: 300, color: '${s === 'Disabled' ? '#808080' : '#eff1f3'}', flex: 1 }}>`,
        `    Menu Label`,
        `  </span>`,
        `  {/* caret */}`,
        `</div>`,
      ].join('\n')
    },
  },

  // ─── Checkbox & Radio ────────────────────────────────────────────────────────
  checkbox: {
    slug: 'checkbox',
    title: 'Checkbox & Radio',
    description:
      'Binary selection controls for forms. Checkbox allows multiple selections; Radio restricts to one choice within a group. Both support Regular and Small sizes.',
    status: 'stable',
    scope: { Checkbox, Radio },
    propSchema: {
      type: {
        type: 'chip-select',
        label: 'Type',
        options: ['checkbox', 'radio'],
        default: 'checkbox',
      },
      size: {
        type: 'chip-select',
        label: 'Size',
        options: ['regular', 'small'],
        default: 'regular',
      },
      checked: {
        type: 'boolean',
        label: 'Checked',
        default: false,
      },
      disabled: {
        type: 'boolean',
        label: 'Disabled',
        default: false,
      },
      label: {
        type: 'text',
        label: 'Label',
        default: 'Option label',
      },
    },
    generateCode: ({ type, size, checked, disabled, label }) => {
      const t   = String(type)
      const s   = String(size)
      const lbl = String(label)
      const chk = checked  === true || checked  === 'true'
      const dis = disabled === true || disabled === 'true'

      const lines: string[] = []
      if (t === 'radio') {
        lines.push(`<Radio`)
        lines.push(`  label="${lbl}"`)
        if (s !== 'regular') lines.push(`  size="${s}"`)
        if (chk) lines.push(`  checked`)
        if (dis) lines.push(`  disabled`)
        lines.push(`/>`)
      } else {
        lines.push(`<Checkbox`)
        lines.push(`  label="${lbl}"`)
        if (s !== 'regular') lines.push(`  size="${s}"`)
        if (chk) lines.push(`  defaultChecked`)
        if (dis) lines.push(`  disabled`)
        lines.push(`/>`)
      }
      return lines.join('\n')
    },
  },
}

export function getEntryMeta(slug: string) {
  const entry = registry[slug]
  if (!entry) return null
  return {
    slug: entry.slug,
    title: entry.title,
    description: entry.description,
    status: entry.status,
  }
}
