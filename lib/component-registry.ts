import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Checkbox, Radio } from '@/components/ui/checkbox'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCheckboxHead,
  TableCheckboxCell,
} from '@/components/ui/table'
import { Chip, Tag } from '@/components/ui/chip'
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs'
import { Modal, ModalHeader, ModalBody, ModalFooter, XIcon, FloppyDisk } from '@/components/ui/modal'
import { Switch, BooleanIcon } from '@/components/ui/switch'
import { MessageBox } from '@/components/ui/message-box'
import { Pagination } from '@/components/ui/pagination'
import { VerticalTab, VerticalTabGroup, VerticalTabIcon } from '@/components/ui/vertical-tabs'
import { Skeleton, Spinner } from '@/components/ui/loading'
import { Plus, Grid } from 'lucide-react'
import { DistributionControls } from '@/components/ui/distribution-controls'
import { Toast } from '@/components/ui/toast'

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

  // ─── Table ───────────────────────────────────────────────────────────────────
  table: {
    slug: 'table',
    title: 'Table',
    description:
      'Data table with sortable columns, row selection, multiple cell types, and two density modes. Supports striped rows, batch operations, and accessible keyboard navigation.',
    status: 'stable',
    scope: {
      Table,
      TableHeader,
      TableBody,
      TableRow,
      TableHead,
      TableCell,
      TableCheckboxHead,
      TableCheckboxCell,
      Button,
    },
    propSchema: {
      size: {
        type: 'chip-select',
        label: 'Density',
        options: ['wide', 'compact'],
        default: 'wide',
      },
      striped: {
        type: 'boolean',
        label: 'Striped rows',
        default: false,
      },
      sortable: {
        type: 'boolean',
        label: 'Sortable headers',
        default: false,
      },
      selectable: {
        type: 'boolean',
        label: 'Selectable rows',
        default: false,
      },
      cellType: {
        type: 'chip-select',
        label: 'Cell type',
        options: ['text', 'chip', 'tag', 'switch', 'actions', 'filter'],
        default: 'text',
      },
    },
    generateCode: ({ size, striped, sortable, selectable, cellType }) => {
      const s    = String(size)
      const ct   = String(cellType)
      const strp = striped    === true || striped    === 'true'
      const sort = sortable   === true || sortable   === 'true'
      const sel  = selectable === true || selectable === 'true'

      const sortProp = sort ? ` sortDirection="none" onSort={() => {}}` : ''
      const chkHead  = sel  ? `\n        <TableCheckboxHead />` : ''
      const chkCell  = (row: string) => sel ? `\n          <TableCheckboxCell ariaLabel="Select ${row}" />` : ''

      // ── Inline cell content per type (tokens from Figma node 69-1408) ──────
      const chipCell = [
        `          <TableCell>`,
        `            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8,`,
        `              background: '#d6e2f5', borderRadius: 8, padding: '4px 12px',`,
        `              fontSize: 10, fontWeight: 600, color: '#021920', whiteSpace: 'nowrap' }}>`,
        `              Current`,
        `            </span>`,
        `          </TableCell>`,
      ].join('\n')

      const tagCell = [
        `          <TableCell>`,
        `            <span style={{ display: 'inline-flex', alignItems: 'center',`,
        `              background: '#d9dce0', borderRadius: 16, padding: '4px 12px',`,
        `              fontSize: 10, fontWeight: 600, color: '#021920', whiteSpace: 'nowrap' }}>`,
        `              Audience`,
        `            </span>`,
        `          </TableCell>`,
      ].join('\n')

      const switchCell = [
        `          <TableCell>`,
        `            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>`,
        `              <div style={{ width: 41, height: 22, background: '#4285f4',`,
        `                borderRadius: 11, position: 'relative', flexShrink: 0 }}>`,
        `                <div style={{ position: 'absolute', right: 3, top: 3,`,
        `                  width: 16, height: 16, background: 'white', borderRadius: '50%' }} />`,
        `              </div>`,
        `              <span style={{ fontSize: 12, color: '#021920' }}>Yes</span>`,
        `            </div>`,
        `          </TableCell>`,
      ].join('\n')

      const filterCell = [
        `          <TableCell>`,
        `            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,`,
        `              border: '1px solid #eff1f3', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}>`,
        `              <span style={{ background: '#4285f4', color: 'white', borderRadius: 48,`,
        `                padding: '2px 6px', fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap' }}>2</span>`,
        `              <span style={{ fontSize: 12, color: '#021920' }}>Select Option</span>`,
        `            </div>`,
        `          </TableCell>`,
      ].join('\n')

      const actionsCell = [
        `          <TableCell align="right">`,
        `            <div style={{ display: 'inline-flex', gap: 8 }}>`,
        `              <Button variant="secondary" size="icon-sm" aria-label="Edit" />`,
        `              <Button variant="secondary" size="icon-sm" aria-label="Delete" />`,
        `            </div>`,
        `          </TableCell>`,
      ].join('\n')

      const firstCell = (name: string) => {
        switch (ct) {
          case 'chip':    return chipCell
          case 'tag':     return tagCell
          case 'switch':  return switchCell
          case 'filter':  return filterCell
          case 'actions': return `          <TableCell>${name}</TableCell>`
          default:        return `          <TableCell>${name}</TableCell>`
        }
      }

      const lastCell = (date: string) =>
        ct === 'actions' ? actionsCell : `          <TableCell align="right">${date}</TableCell>`

      const rows = [
        { name: 'Dianne Russell',   status: 'Active',   date: '12 Jan 2026', zebra: false },
        { name: 'Wade Warren',      status: 'Draft',     date: '9 Feb 2026',  zebra: true  },
        { name: 'Brooklyn Simmons', status: 'Synched',   date: '3 Mar 2026',  zebra: false },
      ]

      const rowLines = rows
        .map(({ name, status, date, zebra }) => {
          const stripedProp = strp && zebra ? ' striped' : ''
          return [
            `        <TableRow${stripedProp}>`,
            chkCell(name),
            firstCell(name),
            `          <TableCell variant="secondary">${status}</TableCell>`,
            lastCell(date),
            `        </TableRow>`,
          ].filter(Boolean).join('\n')
        })
        .join('\n')

      return [
        `<Table size="${s}">`,
        `      <TableHeader>`,
        `        <tr>`,
        chkHead,
        `          <TableHead${sortProp}>Name</TableHead>`,
        `          <TableHead>Status</TableHead>`,
        ct === 'actions'
          ? `          <TableHead align="right">Actions</TableHead>`
          : `          <TableHead align="right">Created</TableHead>`,
        `        </tr>`,
        `      </TableHeader>`,
        `      <TableBody>`,
        rowLines,
        `      </TableBody>`,
        `    </Table>`,
      ].filter(l => l !== '').join('\n')
    },
  },

  // ─── Tabs ────────────────────────────────────────────────────────────────────
  tabs: {
    slug: 'tabs',
    title: 'Tabs',
    description:
      'Compact tab strip for switching between sibling views. Supports 2–4 tabs, optional icons, disabled states, and full keyboard navigation.',
    status: 'stable',
    scope: { Tabs, TabList, Tab, TabPanel, Grid },
    propSchema: {
      count: {
        type: 'chip-select',
        label: 'Tab count',
        options: ['2', '3', '4'],
        default: '3',
      },
      showIcons: {
        type: 'boolean',
        label: 'Show icons',
        default: false,
      },
      disabled: {
        type: 'boolean',
        label: 'Disabled last tab',
        default: false,
      },
    },
    generateCode: ({ count, showIcons, disabled }) => {
      const n     = Math.min(4, Math.max(2, parseInt(String(count)) || 3))
      const icons = showIcons === true || showIcons === 'true'
      const dis   = disabled  === true || disabled  === 'true'

      const defs = [
        { value: 'all',      label: 'All Users' },
        { value: 'active',   label: 'Active'    },
        { value: 'inactive', label: 'Inactive'  },
        { value: 'archived', label: 'Archived'  },
      ].slice(0, n)

      const iconProp = icons
        ? ` icon={<Grid size={16} strokeWidth={1.5} />}`
        : ''

      const tabLines = defs
        .map(({ value, label }, i) => {
          const dp = dis && i === n - 1 ? ' disabled' : ''
          return `    <Tab value="${value}"${iconProp}${dp}>${label}</Tab>`
        })
        .join('\n')

      return [
        `<Tabs defaultValue="all">`,
        `  <TabList aria-label="Filter users">`,
        tabLines,
        `  </TabList>`,
        `</Tabs>`,
      ].join('\n')
    },
  },

  // ─── Chips & Tags ────────────────────────────────────────────────────────────
  chips: {
    slug: 'chips',
    title: 'Chips & Tags',
    description:
      'Compact inline labels for status, categorisation, and user input. Chips are interactive; Tags are primarily informational.',
    status: 'stable',
    scope: { Chip, Tag },
    propSchema: {
      // ── Chip controls ──
      chipType: {
        type: 'chip-select',
        label: 'Chip type',
        options: ['info', 'success', 'warning', 'error'],
        default: 'info',
      },
      chipShade: {
        type: 'chip-select',
        label: 'Chip shade',
        options: ['100', '200', '400', '500'],
        default: '100',
      },
      iconLeft: {
        type: 'boolean',
        label: 'Left icon',
        default: true,
      },
      iconRight: {
        type: 'boolean',
        label: 'Dismiss icon',
        default: true,
      },
      // ── Tag controls ──
      tagState: {
        type: 'chip-select',
        label: 'Tag state',
        options: ['default', 'active', 'viewed', 'disabled'],
        default: 'default',
      },
      tagType: {
        type: 'chip-select',
        label: 'Tag type',
        options: ['simple', 'with-value', 'value-update'],
        default: 'simple',
      },
    },
    generateCode: ({ chipType, chipShade, iconLeft, iconRight, tagState, tagType }) => {
      const type  = String(chipType)
      const shade = String(chipShade)
      const left  = iconLeft  === true || iconLeft  === 'true'
      const right = iconRight === true || iconRight === 'true'
      const state = String(tagState)
      const ttype = String(tagType)

      const chipLines = [
        `<Chip`,
        `  label="Current"`,
        `  type="${type}"`,
        `  shade={${shade}}`,
        !left  ? `  iconLeft={false}`  : null,
        !right ? `  iconRight={false}` : null,
        `/>`,
      ].filter(Boolean).join('\n')

      const tagLines = [
        `<Tag`,
        `  label="Audience"`,
        `  state="${state}"`,
        `  type="${ttype}"`,
        ttype !== 'simple'       ? `  value="v1.2"`   : null,
        ttype === 'value-update' ? `  newValue="v1.3"` : null,
        `/>`,
      ].filter(Boolean).join('\n')

      const indent = (s: string) => s.split('\n').map(l => `  ${l}`).join('\n')

      return [
        `<div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>`,
        indent(chipLines),
        indent(tagLines),
        `</div>`,
      ].join('\n')
    },
  },

  // ─── Modal ───────────────────────────────────────────────────────────────────
  modal: {
    slug: 'modal',
    title: 'Modal',
    description:
      'A focused overlay dialog that interrupts the current workflow to request input, confirm an action, or display contextual information.',
    status: 'stable',
    scope: { Modal, ModalHeader, ModalBody, ModalFooter, Button, XIcon, FloppyDisk },
    propSchema: {
      size: {
        type: 'chip-select',
        label: 'Size',
        options: ['large', 'medium'],
        default: 'large',
      },
      title: {
        type: 'text',
        label: 'Title',
        default: 'Upload Progress',
      },
      showClose: {
        type: 'boolean',
        label: 'Close button',
        default: true,
      },
      confirmLabel: {
        type: 'text',
        label: 'Confirm label',
        default: 'Save to Knowledge Base',
      },
    },
    generateCode: ({ size, title, showClose, confirmLabel }) => {
      const s    = String(size)
      const t    = String(title)
      const cl   = String(confirmLabel)
      const close = showClose === true || showClose === 'true'

      const btnSize  = s === 'large' ? 'regular' : 'sm'
      const closeAttr = close ? ` onClose={() => {}}` : ''

      const iconSize = s === 'large' ? 24 : 16

      return [
        `<Modal size="${s}" preview>`,
        `  <ModalHeader${closeAttr}>${t}</ModalHeader>`,
        `  <ModalBody>`,
        `    <p style={{ fontSize: 14, color: '#7a828c', lineHeight: '20px' }}>`,
        `      Configure your settings before proceeding with this action.`,
        `    </p>`,
        `  </ModalBody>`,
        `  <ModalFooter>`,
        `    <Button variant="text" size="${btnSize}">`,
        `      <XIcon size={${iconSize}} weight="thin" />`,
        `      Cancel`,
        `    </Button>`,
        `    <Button variant="primary" size="${btnSize}">`,
        `      <FloppyDisk size={${iconSize}} weight="thin" />`,
        `      ${cl}`,
        `    </Button>`,
        `  </ModalFooter>`,
        `</Modal>`,
      ].join('\n')
    },
  },

  // ─── Message Box ─────────────────────────────────────────────────────────────
  'message-box': {
    slug: 'message-box',
    title: 'Message Box',
    description:
      'Contextual feedback banners for outcomes, guidance, and system state. Four semantic types × two layout sizes.',
    status: 'stable',
    scope: { MessageBox },
    propSchema: {
      type: {
        type: 'chip-select',
        label: 'Type',
        options: ['info', 'success', 'warning', 'error'],
        default: 'info',
      },
      size: {
        type: 'chip-select',
        label: 'Size',
        options: ['line', 'block'],
        default: 'line',
      },
      dismissible: {
        type: 'boolean',
        label: 'Dismissible',
        default: true,
      },
      message: {
        type: 'text',
        label: 'Message',
        default: 'This campaign is currently paused. Resume to continue sending.',
      },
    },
    generateCode: ({ type, size, dismissible, message }) => {
      const t   = String(type)
      const s   = String(size)
      const dis = dismissible === true || dismissible === 'true'
      const msg = String(message)
      const isBlock = s === 'block'

      const titleMap: Record<string, string> = {
        info:    'File Guidelines',
        success: 'Import Complete',
        warning: 'Confirm Before Proceeding',
        error:   'Action Failed',
      }
      const bodyMap: Record<string, string> = {
        info:    'Your CSV file should include only two columns: Name and Phone. Make sure column headers match these names exactly.',
        success: '15 contacts were added to the Quarterly Outreach segment.',
        warning: 'Editing an active campaign will pause message delivery to all recipients until you re-activate it.',
        error:   'Unable to save changes. Please check your connection and try again.',
      }

      const lines: string[] = ['<MessageBox']
      lines.push(`  type="${t}"`)
      if (s !== 'line') lines.push(`  size="${s}"`)
      if (isBlock) lines.push(`  title="${titleMap[t]}"`)
      if (!dis) lines.push(`  dismissible={false}`)
      if (isBlock) {
        lines.push(`  message="${bodyMap[t]}"`)
        lines.push('/>')
      } else {
        lines.push(`  message="${msg}"`)
        lines.push('/>')
      }
      return lines.join('\n')
    },
  },

  // ─── Switch & Boolean Icon ───────────────────────────────────────────────────
  switch: {
    slug: 'switch',
    title: 'Switch & Boolean Icon',
    description:
      'Immediate-effect toggle for binary settings, and a compact read-only status badge for true/false values in tables and detail panels.',
    status: 'stable',
    scope: { Switch, BooleanIcon },
    propSchema: {
      component: {
        type: 'chip-select',
        label: 'Component',
        options: ['switch', 'boolean-icon'],
        default: 'switch',
      },
      checked: {
        type: 'boolean',
        label: 'Checked / Value',
        default: true,
      },
      labelPosition: {
        type: 'chip-select',
        label: 'Label position',
        options: ['right', 'left'],
        default: 'right',
      },
      size: {
        type: 'chip-select',
        label: 'Icon size',
        options: ['regular', 'small'],
        default: 'regular',
      },
      disabled: {
        type: 'boolean',
        label: 'Disabled',
        default: false,
      },
      label: {
        type: 'text',
        label: 'Label',
        default: 'Auto Accept Calls',
      },
    },
    generateCode: ({ component, checked, labelPosition, size, disabled, label }) => {
      const comp = String(component)
      const val  = checked   === true || checked   === 'true'
      const dis  = disabled  === true || disabled  === 'true'
      const lp   = String(labelPosition)
      const sz   = String(size)
      const lbl  = String(label)

      if (comp === 'boolean-icon') {
        const lines = ['<BooleanIcon']
        lines.push(`  value={${val}}`)
        if (sz !== 'regular') lines.push(`  size="${sz}"`)
        lines.push('/>')
        return lines.join('\n')
      }

      // switch
      const lines = ['<Switch']
      lines.push(`  label="${lbl}"`)
      if (val)          lines.push(`  defaultChecked`)
      if (lp !== 'right') lines.push(`  labelPosition="${lp}"`)
      if (dis)          lines.push(`  disabled`)
      lines.push('/>')
      return lines.join('\n')
    },
  },

  // ─── Pagination ──────────────────────────────────────────────────────────────
  pagination: {
    slug: 'pagination',
    title: 'Pagination',
    description:
      'Divides large datasets into discrete pages. Four variants from minimal directional arrows to numbered pages with automatic ellipsis truncation.',
    status: 'stable',
    scope: { Pagination },
    propSchema: {
      variant: {
        type: 'chip-select',
        label: 'Variant',
        options: ['directional', 'directional-counter', 'back-next', 'numbered'],
        default: 'numbered',
      },
      page: {
        type: 'text',
        label: 'Current page',
        default: '4',
      },
      totalPages: {
        type: 'text',
        label: 'Total pages',
        default: '10',
      },
      disabled: {
        type: 'boolean',
        label: 'Disabled',
        default: false,
      },
    },
    generateCode: ({ variant, page, totalPages, disabled }) => {
      const v    = String(variant)
      const p    = parseInt(String(page))    || 4
      const tp   = parseInt(String(totalPages)) || 10
      const dis  = disabled === true || disabled === 'true'

      const lines = ['<Pagination']
      lines.push(`  variant="${v}"`)
      lines.push(`  page={${p}}`)
      lines.push(`  totalPages={${tp}}`)
      lines.push(`  onChange={() => {}}`)
      if (dis) lines.push(`  disabled`)
      lines.push('/>')
      return lines.join('\n')
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

  // ─── Loading Indicators ──────────────────────────────────────────────────────
  loading: {
    slug: 'loading',
    title: 'Loading Indicators',
    description:
      'Skeleton loaders and spinners that communicate system activity and reduce perceived latency.',
    status: 'stable',
    scope: { Skeleton, Spinner },
    propSchema: {
      component: {
        type: 'chip-select',
        label: 'Component',
        options: ['spinner', 'skeleton-text', 'skeleton-card', 'skeleton-table'],
        default: 'spinner',
      },
      spinnerSize: {
        type: 'chip-select',
        label: 'Spinner size',
        options: ['xs', 'sm', 'md', 'lg', 'xl'],
        default: 'md',
      },
    },
    generateCode: ({ component, spinnerSize }) => {
      const comp = String(component)
      const sz   = String(spinnerSize)

      if (comp === 'spinner') {
        const sizeAttr = sz !== 'md' ? `\n  size="${sz}"` : ''
        return `<Spinner${sizeAttr} />`
      }

      if (comp === 'skeleton-text') {
        return [
          '<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>',
          '  <Skeleton variant="text" textSize="body" />',
          '  <Skeleton variant="text" textSize="body" />',
          '  <Skeleton variant="text" textSize="body" width="70%" />',
          '</div>',
        ].join('\n')
      }

      if (comp === 'skeleton-card') {
        return [
          '<div style={{',
          '  padding: 16,',
          '  border: "1px solid #eff1f3",',
          '  borderRadius: 8,',
          '  display: "flex",',
          '  flexDirection: "column",',
          '  gap: 8,',
          '}}>',
          '  <div style={{ display: "flex", justifyContent: "space-between" }}>',
          '    <Skeleton variant="text" textSize="body" width={120} />',
          '    <Skeleton variant="rect" width={48} height={20} radius={10} />',
          '  </div>',
          '  <Skeleton variant="text" textSize="body-sm" width="100%" />',
          '  <Skeleton variant="text" textSize="body-sm" width="70%" />',
          '</div>',
        ].join('\n')
      }

      // skeleton-table
      return [
        '<div style={{ display: "flex", flexDirection: "column", gap: 0 }}>',
        '  {Array.from({ length: 4 }).map((_, i) => (',
        '    <div',
        '      key={i}',
        '      style={{',
        '        display: "flex",',
        '        gap: 16,',
        '        padding: "10px 12px",',
        '        alignItems: "center",',
        '        borderTop: i > 0 ? "1px solid #eff1f3" : "none",',
        '      }}',
        '    >',
        '      <Skeleton variant="rect" width={16} height={16} radius={3} />',
        '      <Skeleton variant="text" textSize="body-sm" width={120} />',
        '      <Skeleton variant="text" textSize="body-sm" width={90} />',
        '      <Skeleton variant="rect" width={60} height={20} radius={10} />',
        '      <Skeleton variant="circle" width={24} height={24} />',
        '    </div>',
        '  ))}',
        '</div>',
      ].join('\n')
    },
  },

  // ─── Distribution Controls ───────────────────────────────────────────────────
  'distribution-controls': {
    slug: 'distribution-controls',
    title: 'Distribution Controls',
    description:
      'Traffic distribution slider for AWS failover scenarios. Splits traffic between two regions (0–100% in steps of 10) via a draggable handle or synchronized input fields.',
    status: 'wip',
    scope: { DistributionControls },
    propSchema: {
      defaultValue: {
        type: 'chip-select',
        label: 'Initial split (Region A %)',
        options: ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100'],
        default: '0',
      },
      regionA: {
        type: 'text',
        label: 'Region A',
        default: 'us-west-2',
      },
      regionB: {
        type: 'text',
        label: 'Region B',
        default: 'us-east-1',
      },
    },
    generateCode: ({ defaultValue, regionA, regionB }) => {
      const val = parseInt(String(defaultValue)) || 0
      const a = String(regionA || 'us-west-2')
      const b = String(regionB || 'us-east-1')
      return `<DistributionControls\n  defaultValue={${val}}\n  regionA="${a}"\n  regionB="${b}"\n  onChange={(a, b) => console.log(a, b)}\n/>`
    },
  },

  // ─── Toast ───────────────────────────────────────────────────────────────────
  toast: {
    slug: 'toast',
    title: 'Toast',
    description:
      'Brief non-blocking feedback messages for action confirmations, errors, warnings and async operations. Auto-dismiss after a configurable duration.',
    status: 'stable',
    scope: { Toast },
    propSchema: {
      type: {
        type: 'chip-select',
        label: 'Type',
        options: ['default', 'success', 'error', 'warning', 'info', 'loading'],
        default: 'success',
      },
      title: {
        type: 'text',
        label: 'Title',
        default: 'Event has been created',
      },
      description: {
        type: 'text',
        label: 'Description',
        default: 'Sunday, December 03, 2023 at 9:00 AM',
      },
      showAction: {
        type: 'boolean',
        label: 'Show action button',
        default: false,
      },
    },
    generateCode: ({ type, title, description, showAction }) => {
      const t     = String(type)
      const lbl   = String(title)
      const desc  = String(description)
      const sa    = showAction === true || showAction === 'true'

      const lines: string[] = [`<Toast`]
      if (t !== 'default') lines.push(`  type="${t}"`)
      lines.push(`  title="${lbl}"`)
      if (desc) lines.push(`  description="${desc}"`)
      if (sa)   lines.push(`  action={{ label: 'Undo', onClick: () => {} }}`)
      lines.push(`/>`)
      return lines.join('\n')
    },
  },

  // ─── Vertical Tabs ───────────────────────────────────────────────────────────
  'vertical-tabs': {
    slug: 'vertical-tabs',
    title: 'Vertical Tabs',
    description:
      'Stacked navigation tabs for switching between sections within a panel or settings page. Supports icons, active/disabled states, and right-side badge slots.',
    status: 'stable',
    scope: { VerticalTab, VerticalTabGroup, VerticalTabIcon },
    propSchema: {
      showIcons: {
        type: 'boolean',
        label: 'Show icons',
        default: true,
      },
      activeIndex: {
        type: 'chip-select',
        label: 'Active tab',
        options: ['0', '1', '2', '3', '4'],
        default: '2',
      },
      count: {
        type: 'chip-select',
        label: 'Tab count',
        options: ['3', '4', '5'],
        default: '5',
      },
    },
    generateCode: ({ showIcons, activeIndex, count }) => {
      const icons = showIcons === true || showIcons === 'true'
      const active = parseInt(String(activeIndex)) || 2
      const total  = parseInt(String(count)) || 5

      const items = [
        'Global Permissions',
        'Instances',
        'Production',
        'Development',
        'Q&A',
      ].slice(0, total)

      const iconAttr = icons ? `\n    icon={<VerticalTabIcon size={16} />}` : ''

      const tabs = items.map((label, i) => {
        const activeAttr = i === active ? `\n    active` : ''
        return `  <VerticalTab\n    label="${label}"${iconAttr}${activeAttr}\n    onClick={() => {}}\n  />`
      }).join('\n')

      return `<VerticalTabGroup>\n${tabs}\n</VerticalTabGroup>`
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
