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
import { TableFilter } from '@/components/ui/table-filter'
import { CollapsibleFilters, FilterTagItem } from '@/components/ui/collapsible-filters'
import { Chip, Tag } from '@/components/ui/chip'
import { Counter } from '@/components/ui/counter'
import { Tabs, TabList, Tab, TabPanel, TableIcon } from '@/components/ui/tabs'
import { Modal, ModalHeader, ModalBody, ModalFooter, XCircleIcon, FloppyDisk } from '@/components/ui/modal'
import { Switch, BooleanIcon } from '@/components/ui/switch'
import { MessageBox } from '@/components/ui/message-box'
import { Pagination } from '@/components/ui/pagination'
import { VerticalTab, VerticalTabGroup, VerticalTabIcon } from '@/components/ui/vertical-tabs'
import { Skeleton, Spinner } from '@/components/ui/loading'
import { Plus } from 'lucide-react'
import { DistributionControls } from '@/components/ui/distribution-controls'
import { Toast } from '@/components/ui/toast'
import { Tooltip } from '@/components/ui/tooltip'
import { DismissibleTip } from '@/components/ui/dismissible-tip'
import { StatCard, MetricTileAcgr } from '@/components/ui/stats-cards'
import { InlineStatTile, InlineStatsRow } from '@/components/ui/inline-stats'
import { ClickableCard, ClickableHorizontalCard } from '@/components/ui/clickable-card'
import { InlineContextData } from '@/components/ui/inline-context-data'
import { InstanceCard } from '@/components/ui/instance-card'
import { AddressBookIcon, CalendarIcon, TagIcon, UserListIcon, SquaresFourIcon } from '@/components/ui/playground-icons'
import { Stepper } from '@/components/ui/stepper'
import { DatePicker } from '@/components/ui/date-picker'
import { NavMenuItem, NavSubItem, NavMenuItemCollapsed } from '@/components/ui/nav-item'
import {
  NTMenuHomeItem,
  NTMenuModuleItem,
  NTMenuSubItem,
  NTMenuGroup,
  NTMenuItemCollapsed,
} from '@/components/ui/nt-menu'
import { PageTitle } from '@/components/ui/page-title'
import { Breadcrumb } from '@/components/ui/breadcrumbs'
import { TopBar } from '@/components/ui/top-bar'
import { FileTree } from '@/components/ui/file-tree'
import type { FileTreeNode } from '@/components/ui/file-tree'

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

const FILE_TREE_DATA: FileTreeNode[] = [
  {
    id: 'account-1',
    label: 'Social Security Admin',
    type: 'account',
    children: [
      {
        id: 'group-1',
        label: 'Benefit Status Updates',
        type: 'group',
        children: [
          { id: 'topic-1', label: 'Retirement Planning Reminders', type: 'topic' },
          { id: 'topic-2', label: 'Disability Claim Follow-ups',   type: 'topic' },
          { id: 'topic-3', label: 'Medicare Enrollment Alerts',    type: 'topic' },
        ],
      },
      {
        id: 'group-2',
        label: 'Outreach Campaigns',
        type: 'group',
        children: [
          { id: 'topic-4', label: 'Q1 Benefits Reminder',  type: 'topic' },
          { id: 'topic-5', label: 'Annual Review Notices', type: 'topic' },
        ],
      },
    ],
  },
]

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
      'Triggers an action or navigation. Eight visual variants aligned to usage context, three sizes, and icon support.',
    status: 'stable',
    scope: { Button, Plus },
    propSchema: {
      variant: {
        type: 'chip-select',
        label: 'Variant',
        options: ['primary', 'secondary', 'form-controls', 'text', 'destructive', 'secondary-destructive', 'text-destructive', 'colored-bg'],
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
        options: ['none', 'left', 'only'],
        default: 'none',
      },
      noPadding: {
        type: 'boolean',
        label: 'No padding (text variants)',
        default: false,
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
    generateCode: ({ variant, size, disabled, children, iconPosition, noPadding }) => {
      const v = String(variant)
      const s = String(size)
      const pos = String(iconPosition)
      const label = String(children)
      const disabledAttr = disabled ? ' disabled' : ''
      const isText = v === 'text' || v === 'text-destructive'
      const padAttr = isText && (noPadding === true || noPadding === 'true') ? ' noPadding' : ''

      // Build button snippet first, then wrap for colored-bg
      let btn: string
      if (pos === 'only') {
        btn = `<Button variant="${v}" size="${ICON_SIZE_MAP[s] ?? 'icon-regular'}"${padAttr}${disabledAttr} aria-label="Action">\n  <Plus />\n</Button>`
      } else if (pos === 'left') {
        btn = `<Button variant="${v}" size="${s}"${padAttr}${disabledAttr}>\n  <Plus />\n  ${label}\n</Button>`
      } else {
        btn = `<Button variant="${v}" size="${s}"${padAttr}${disabledAttr}>\n  ${label}\n</Button>`
      }

      // colored-bg must be shown inside a surface div to render correctly
      if (v === 'colored-bg') {
        const indented = btn.split('\n').map(l => `  ${l}`).join('\n')
        return `<div className="bg-[var(--content-action-primary-default)] p-6 rounded-lg">\n${indented}\n</div>`
      }

      return btn
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
      size: {
        type: 'chip-select',
        label: 'Size',
        options: ['regular', 'small'],
        default: 'regular',
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
    generateCode: ({ variant, size, labelVisible, required, disabled, showError, showHint }) => {
      const v   = String(variant)
      const sm  = size === 'small'
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
      if (sm)   lines.push(`  size="small"`)
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
      'Vertical side navigation with collapsible groups, icon-labelled headers, and two-level hierarchy. Dark-mode-first with Light/SemiBold typography and green interactive states.',
    status: 'stable',
    scope: { NavMenuItem, NavSubItem, NavMenuItemCollapsed, SquaresFourIcon },
    propSchema: {
      type: {
        type: 'chip-select',
        label: 'Type',
        options: ['Menu Item', 'Sub Menu Item', 'Collapsed'],
        default: 'Menu Item',
      },
      state: {
        type: 'chip-select',
        label: 'State',
        options: ['default', 'hover', 'active', 'disabled'],
        default: 'default',
      },
      darkMode: {
        type: 'boolean',
        label: 'Dark (CxPortal)',
        default: true,
      },
    },
    generateCode: ({ type, state, darkMode }) => {
      const t    = String(type)
      const s    = String(state)
      const dark = darkMode === true || darkMode === 'true'
      const darkAttr = dark ? '' : `\n  darkMode={false}`

      if (t === 'Sub Menu Item') {
        return [
          `<NavSubItem`,
          `  label="Sub Menu Label"`,
          s !== 'default' ? `  state="${s}"` : null,
          darkAttr || null,
          `/>`,
        ].filter(Boolean).join('\n')
      }
      if (t === 'Collapsed') {
        return [
          `<NavMenuItemCollapsed`,
          `  icon={<SquaresFourIcon size={18} weight="thin" />}`,
          s !== 'default' ? `  state="${s}"` : null,
          darkAttr || null,
          `/>`,
        ].filter(Boolean).join('\n')
      }
      return [
        `<NavMenuItem`,
        `  label="Menu Label"`,
        `  icon={<SquaresFourIcon size={18} weight="thin" />}`,
        s !== 'default' ? `  state="${s}"` : null,
        s === 'active' ? `  isOpen` : null,
        darkAttr || null,
        `/>`,
      ].filter(Boolean).join('\n')
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
      TableFilter,
      Chip,
      Tag,
      Switch,
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

      // ── Inline cell content per type — reuses the DS's real Chip/Tag/
      // Switch/TableFilter components rather than hand-rolled markup, per
      // Figma node 69-1408 "Table Fields Wide" / 422-7991 "Table Fields
      // Compact" (Chip/Tag/Switch types) and 71-16179 "Table Filter" ──────
      const chipCell = [
        `          <TableCell>`,
        `            <Chip label="Current" />`,
        `          </TableCell>`,
      ].join('\n')

      const tagCell = [
        `          <TableCell>`,
        `            <Tag label="Audience" value="2" type="with-value" />`,
        `          </TableCell>`,
      ].join('\n')

      const switchCell = [
        `          <TableCell>`,
        `            <Switch size="small" checked />`,
        `          </TableCell>`,
      ].join('\n')

      const filterCell = [
        `          <TableCell>`,
        `            <TableFilter label="Select Option" active count={2} />`,
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

  // ─── Table Filter ────────────────────────────────────────────────────────────
  'table-filter': {
    slug: 'table-filter',
    title: 'Table Filter',
    description:
      'Filter trigger placed above a Table — shows a count badge and green border once at least one filter is applied, plus an inline "select all" shortcut.',
    status: 'stable',
    scope: { TableFilter },
    propSchema: {
      label: {
        type: 'text',
        label: 'Label',
        default: 'Select Option',
      },
      active: {
        type: 'boolean',
        label: 'Active',
        default: false,
      },
      count: {
        type: 'select',
        label: 'Count',
        options: ['1', '2', '3'],
        default: '1',
      },
      showSelectAll: {
        type: 'boolean',
        label: 'Show "All"',
        default: true,
      },
    },
    generateCode: ({ label, active, count, showSelectAll }) => {
      const l   = String(label)
      const a   = active === true || active === 'true'
      const c   = Number(count)
      const sel = showSelectAll === true || showSelectAll === 'true'

      const lines: string[] = ['<TableFilter']
      if (l !== 'Select Option') lines.push(`  label="${l}"`)
      if (a) lines.push('  active')
      if (a) lines.push(`  count={${c}}`)
      if (!sel) lines.push('  showSelectAll={false}')
      lines.push('/>')
      return lines.join('\n')
    },
  },

  // ─── Collapsible Filters ────────────────────────────────────────────────────
  'collapsible-filters': {
    slug: 'collapsible-filters',
    title: 'Collapsible Filters',
    description:
      'A persistent side panel that collapses to a 48px icon rail or expands to a 240px filter panel, composing Table Filter rows and FilterTagItem rows in its content area.',
    status: 'stable',
    scope: { CollapsibleFilters, FilterTagItem, TableFilter },
    propSchema: {
      collapsed: {
        type: 'boolean',
        label: 'Collapsed',
        default: false,
      },
      activeCount: {
        type: 'select',
        label: 'Active count badge',
        options: ['0', '1', '2', '3'],
        default: '2',
      },
      showClearFilters: {
        type: 'boolean',
        label: '"Clear Filters" link',
        default: true,
      },
      showTagsSection: {
        type: 'boolean',
        label: 'Tags section',
        default: true,
      },
    },
    generateCode: ({ collapsed, activeCount, showClearFilters, showTagsSection }) => {
      const c      = collapsed === true || collapsed === 'true'
      const count  = Number(activeCount)
      const clear  = showClearFilters === true || showClearFilters === 'true'
      const tags   = showTagsSection === true || showTagsSection === 'true'

      const lines = [`<CollapsibleFilters`]
      lines.push(`  collapsed={${c}}`)
      lines.push(`  onToggleCollapsed={() => {}}`)
      if (count > 0) lines.push(`  activeCount={${count}}`)
      if (clear) lines.push(`  onClearFilters={() => {}}`)
      lines.push(`>`)
      lines.push(`  <TableFilter label="Knowledge Base" size="compact" active count={2} onClick={() => {}} />`)
      if (tags) {
        lines.push(`  <div>`)
        lines.push(`    <div style={{ fontSize: 18, color: 'var(--neutral-800)', marginBottom: 8 }}>Tags</div>`)
        lines.push(`    <FilterTagItem label="status: Archived" dotColor="var(--info-100)" onEdit={() => {}} onDelete={() => {}} />`)
        lines.push(`    <FilterTagItem label="priority: High" dotColor="var(--success-100)" checked onEdit={() => {}} onDelete={() => {}} />`)
        lines.push(`  </div>`)
      }
      lines.push(`</CollapsibleFilters>`)
      return lines.join('\n')
    },
  },

  // ─── Tabs ────────────────────────────────────────────────────────────────────
  tabs: {
    slug: 'tabs',
    title: 'Tabs',
    description:
      'Compact tab strip for switching between sibling views. Supports 2–5 tabs, optional icons, disabled states, and full keyboard navigation.',
    status: 'stable',
    scope: { Tabs, TabList, Tab, TabPanel, TableIcon },
    propSchema: {
      type: {
        type: 'chip-select',
        label: 'Type',
        options: ['button', 'minimal'],
        default: 'button',
      },
      count: {
        type: 'chip-select',
        label: 'Tab count',
        options: ['2', '3', '4', '5'],
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
    generateCode: ({ type, count, showIcons, disabled }) => {
      const tabType = type === 'minimal' ? 'minimal' : 'button'
      const n     = Math.min(5, Math.max(2, parseInt(String(count)) || 3))
      const icons = showIcons === true || showIcons === 'true'
      const dis   = disabled  === true || disabled  === 'true'

      const defs = [
        { value: 'all',      label: 'All Users' },
        { value: 'active',   label: 'Active'    },
        { value: 'inactive', label: 'Inactive'  },
        { value: 'archived', label: 'Archived'  },
        { value: 'deleted',  label: 'Deleted'   },
      ].slice(0, n)

      // Figma sizes the icon per type: 12px (Button) / 9px (Minimal).
      const iconSize = tabType === 'minimal' ? 9 : 12
      const iconProp = icons
        ? ` icon={<TableIcon size={${iconSize}} weight="regular" />}`
        : ''

      const typeProp = tabType === 'minimal' ? ' type="minimal"' : ''

      const tabLines = defs
        .map(({ value, label }, i) => {
          const dp = dis && i === n - 1 ? ' disabled' : ''
          return `    <Tab value="${value}"${iconProp}${dp}>${label}</Tab>`
        })
        .join('\n')

      return [
        `<Tabs defaultValue="all"${typeProp}>`,
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
        options: ['grey', 'info', 'success', 'warning', 'error'],
        default: 'info',
      },
      chipShade: {
        type: 'chip-select',
        label: 'Chip shade',
        options: ['100', '200', '300', '400', '500', '600'],
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
  counter: {
    slug: 'counter',
    title: 'Counter',
    description:
      'A fully-rounded count badge shown inline beside the label it counts. Height is fixed at 18px; width grows with digit count.',
    status: 'wip',
    scope: { Counter },
    propSchema: {
      value: {
        type: 'text',
        label: 'Value',
        default: '8',
      },
      tone: {
        type: 'chip-select',
        label: 'Tone',
        options: ['default', 'muted', 'attention'],
        default: 'default',
      },
    },
    generateCode: ({ value, tone }) => {
      const v = Math.max(0, Math.trunc(Number(value) || 0))
      const t = String(tone)
      const toneAttr = t !== 'default' ? ` tone="${t}"` : ''
      return `<Counter value={${v}}${toneAttr} />`
    },
  },

  // ─── Modal ───────────────────────────────────────────────────────────────────
  modal: {
    slug: 'modal',
    title: 'Modal',
    description:
      'A focused overlay dialog that interrupts the current workflow to request input, confirm an action, or display contextual information.',
    status: 'stable',
    scope: { Modal, ModalHeader, ModalBody, ModalFooter, Button, XCircleIcon, FloppyDisk },
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
        `    <p style={{ fontSize: 14, color: '#8d8d8d', lineHeight: '20px' }}>`,
        `      Configure your settings before proceeding with this action.`,
        `    </p>`,
        `  </ModalBody>`,
        `  <ModalFooter>`,
        `    <Button variant="text" size="${btnSize}">`,
        `      <XCircleIcon size={${iconSize}} weight="thin" />`,
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
      'Contextual feedback banners for outcomes, guidance, and system state. Four semantic types × two themes × two layout sizes.',
    status: 'stable',
    scope: { MessageBox },
    propSchema: {
      type: {
        type: 'chip-select',
        label: 'Type',
        options: ['info', 'success', 'warning', 'error'],
        default: 'info',
      },
      theme: {
        type: 'chip-select',
        label: 'Theme',
        options: ['light', 'dark'],
        default: 'light',
      },
      size: {
        type: 'chip-select',
        label: 'Size',
        options: ['line', 'block'],
        default: 'line',
      },
      rounded: {
        type: 'boolean',
        label: 'Rounded',
        default: false,
      },
      dismissible: {
        type: 'boolean',
        label: 'Dismissible',
        default: false,
      },
      message: {
        type: 'text',
        label: 'Message',
        default: 'This campaign is currently paused. Resume to continue sending.',
      },
      cta: {
        type: 'text',
        label: 'CTA (block only)',
        default: '',
      },
    },
    generateCode: ({ type, theme, size, rounded, dismissible, message, cta }) => {
      const t   = String(type)
      const th  = String(theme)
      const s   = String(size)
      const rnd = rounded === true || rounded === 'true'
      const dis = dismissible === true || dismissible === 'true'
      const msg = String(message)
      const ctaText = String(cta ?? '')
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
      if (th !== 'light') lines.push(`  theme="${th}"`)
      if (s !== 'line') lines.push(`  size="${s}"`)
      if (rnd) lines.push(`  rounded`)
      if (isBlock) lines.push(`  title="${titleMap[t]}"`)
      if (dis) lines.push(`  dismissible`)
      if (isBlock) {
        lines.push(`  message="${bodyMap[t]}"`)
        if (ctaText) lines.push(`  cta="${ctaText}"`)
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

  // ─── Date Picker ─────────────────────────────────────────────────────────────
  'date-picker': {
    slug: 'date-picker',
    title: 'Date Picker',
    description:
      'A DS-styled calendar input for selecting a single date. Portal-based calendar popup built on react-day-picker, with label, required, disabled, and error states — consistent with Select and Input field styling.',
    status: 'stable',
    scope: { DatePicker },
    propSchema: {
      label: {
        type: 'text',
        label: 'Label',
        default: 'Date',
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
    },
    generateCode: ({ label, required, disabled, showError }) => {
      const lbl = String(label || 'Date')
      const req = required  === true || required  === 'true'
      const dis = disabled  === true || disabled  === 'true'
      const err = showError === true || showError === 'true'

      const lines: string[] = [`<DatePicker`]
      lines.push(`  label="${lbl}"`)
      if (req) lines.push(`  required`)
      if (dis) lines.push(`  disabled`)
      if (err) lines.push(`  error="Please select a date."`)
      lines.push(`/>`)
      return lines.join('\n')
    },
  },

  // ─── Distribution Controls ───────────────────────────────────────────────────
  'distribution-controls': {
    slug: 'distribution-controls',
    title: 'Distribution Controls',
    description:
      'Traffic distribution slider for AWS failover scenarios. Splits traffic between two regions (0–100% in steps of 10) via a draggable handle or synchronized input fields.',
    status: 'stable',
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
        options: ['0', '1', '2', '3', '4', '5', '6'],
        default: '2',
      },
      count: {
        type: 'chip-select',
        label: 'Tab count',
        options: ['2', '3', '4', '5', '6', '7'],
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
        'Reporting',
        'Audit Log',
      ].slice(0, total)

      const iconAttr = icons ? `\n    icon={<VerticalTabIcon size={16} />}` : ''

      const tabs = items.map((label, i) => {
        const activeAttr = i === active ? `\n    active` : ''
        return `  <VerticalTab\n    label="${label}"${iconAttr}${activeAttr}\n    onClick={() => {}}\n  />`
      }).join('\n')

      return `<VerticalTabGroup>\n${tabs}\n</VerticalTabGroup>`
    },
  },

  // ─── Stats Cards ─────────────────────────────────────────────────────────────
  'stats-cards': {
    slug: 'stats-cards',
    title: 'Stats Cards',
    description:
      'Compact KPI cards for executive dashboards. Combine a metric value, category icon, and color-coded trend indicator so stakeholders can assess performance at a glance.',
    status: 'stable',
    scope: { StatCard },
    propSchema: {
      icon: {
        type: 'select',
        label: 'Icon',
        options: [
          'sms-sent',
          'delivery-rate',
          'open-rate',
          'response-rate',
          'opt-out',
          'voice-duration',
          'voice-survey',
          'voice-notification',
          'sms-survey',
          'sms-notification',
        ],
        default: 'sms-sent',
      },
      size: {
        type: 'chip-select',
        label: 'Size',
        options: ['regular', 'small'],
        default: 'regular',
      },
      surface: {
        type: 'chip-select',
        label: 'Surface',
        options: ['white', 'blue'],
        default: 'white',
      },
      trendType: {
        type: 'chip-select',
        label: 'Trend',
        options: ['increase', 'decrease', 'neutral'],
        default: 'increase',
      },
      showTrend: {
        type: 'boolean',
        label: 'Show trend',
        default: true,
      },
      title: {
        type: 'text',
        label: 'Title',
        default: 'SMS Sent',
      },
      value: {
        type: 'text',
        label: 'Value',
        default: '6,893',
      },
      trend: {
        type: 'text',
        label: 'Trend label',
        default: '5.2% vs last week',
      },
    },
    generateCode: ({ icon, size, surface, trendType, showTrend, title, value, trend }) => {
      const lines = ['<StatCard']
      lines.push(`  title="${String(title)}"`)
      lines.push(`  value="${String(value)}"`)
      if (showTrend === true || showTrend === 'true') {
        lines.push(`  trend="${String(trend)}"`)
        if (String(trendType) !== 'increase') lines.push(`  trendType="${String(trendType)}"`)
      } else {
        lines.push(`  showTrend={false}`)
      }
      if (String(surface) !== 'white') lines.push(`  surface="${String(surface)}"`)
      if (String(size) !== 'regular')   lines.push(`  size="${String(size)}"`)
      if (String(icon) !== 'sms-sent')  lines.push(`  icon="${String(icon)}"`)
      lines.push('/>')
      return lines.join('\n')
    },
  },

  // ─── Metric Tile ACGR ────────────────────────────────────────────────────────
  'metric-tile-acgr': {
    slug: 'metric-tile-acgr',
    title: 'Metric Tile ACGR',
    description:
      'Data Card for Access Management ACGR contexts. "Only View" shows a TDG-assignment caption; "Action" turns the card into a red alert with an inline Assign CTA instead of a trend indicator.',
    status: 'stable',
    scope: { MetricTileAcgr },
    propSchema: {
      type: {
        type: 'chip-select',
        label: 'Type',
        options: ['only-view', 'action'],
        default: 'only-view',
      },
      label: {
        type: 'text',
        label: 'Label',
        default: 'Total Agents',
      },
      value: {
        type: 'text',
        label: 'Value',
        default: '6,893',
      },
      assignedTdgCount: {
        type: 'text',
        label: 'Assigned TDGs',
        default: '3',
      },
    },
    generateCode: ({ type, label, value, assignedTdgCount }) => {
      const t   = String(type)
      const l   = String(label)
      const v   = String(value)
      const tdg = parseInt(String(assignedTdgCount))

      const lines = ['<MetricTileAcgr']
      if (l !== 'Total Agents') lines.push(`  label="${l}"`)
      if (v !== '6,893') lines.push(`  value="${v}"`)
      if (t !== 'only-view') lines.push(`  type="${t}"`)
      if (t === 'only-view' && !isNaN(tdg)) lines.push(`  assignedTdgCount={${tdg}}`)
      if (t === 'action') lines.push(`  onAssign={() => {}}`)
      lines.push('/>')
      return lines.join('\n')
    },
  },

  // ─── Inline Stats Cards ──────────────────────────────────────────────────────
  'inline-stats-cards': {
    slug: 'inline-stats-cards',
    title: 'Inline Stats Cards',
    description:
      'Compact metric tiles for inline placement within detail pages — a row of 3-5 equal-width tiles, no icon, no trend indicator. Distinct from the dashboard-oriented Stats Cards / Metric Tiles.',
    status: 'stable',
    scope: { InlineStatTile, InlineStatsRow },
    propSchema: {
      count: {
        type: 'chip-select',
        label: 'Tile count',
        options: ['3', '4', '5'],
        default: '4',
      },
      unit: {
        type: 'select',
        label: 'Unit',
        options: ['none', 'percent', 'euro', 'dollar', 'kilo', 'mega', 'kilobyte', 'millisecond', 'second'],
        default: 'none',
      },
    },
    generateCode: ({ count, unit }) => {
      const n = parseInt(String(count)) || 4
      const u = String(unit)
      const unitAttr = u !== 'none' ? ` unit="${u}"` : ''
      const labels = ['Campaign Groups', 'Topics', 'Lists', 'Templates', 'Campaigns']

      const tiles = labels
        .slice(0, n)
        .map(label => `      <InlineStatTile label="${label}" value="48,5"${unitAttr} />`)
        .join('\n')

      return [
        `<InlineStatsRow>`,
        tiles,
        `    </InlineStatsRow>`,
      ].join('\n')
    },
  },

  // ─── Clickable Card ──────────────────────────────────────────────────────────
  'clickable-card': {
    slug: 'clickable-card',
    title: 'Clickable Card',
    description:
      'Selection cards for single-choice flows. Two variants: a rich Card with icon, title and description, and a compact Horizontal Card with a radio and uppercase label.',
    status: 'stable',
    scope: { ClickableCard, ClickableHorizontalCard },
    propSchema: {
      variant: {
        type: 'chip-select',
        label: 'Variant',
        options: ['card', 'horizontal'],
        default: 'card',
      },
      selected: {
        type: 'boolean',
        label: 'Selected',
        default: false,
      },
      icon: {
        type: 'select',
        label: 'Icon',
        options: [
          'voice-survey',
          'sms-sent',
          'voice-duration',
          'delivery-rate',
          'open-rate',
          'response-rate',
          'opt-out',
          'voice-notification',
          'sms-survey',
          'sms-notification',
        ],
        default: 'voice-survey',
      },
      title: {
        type: 'text',
        label: 'Title',
        default: 'Voice Survey',
      },
      description: {
        type: 'text',
        label: 'Description',
        default: 'Collect feedback through interactive voice calls with up to 5 questions.',
      },
      label: {
        type: 'text',
        label: 'Label (horizontal)',
        default: 'Schedule Campaign',
      },
    },
    generateCode: ({ variant, selected, icon, title, description, label }) => {
      const v   = String(variant)
      const sel = selected === true || selected === 'true'
      const selAttr = sel ? `\n  selected` : ''

      if (v === 'horizontal') {
        const lbl = String(label)
        return [`<ClickableHorizontalCard`, `  label="${lbl}"${selAttr}`, `/>`].join('\n')
      }

      // card variant
      const lines = [`<ClickableCard`]
      lines.push(`  title="${String(title)}"`)
      lines.push(`  description="${String(description)}"`)
      if (String(icon) !== 'voice-survey') lines.push(`  icon="${String(icon)}"`)
      if (sel) lines.push(`  selected`)
      lines.push(`/>`)
      return lines.join('\n')
    },
  },

  // ─── Tooltip ─────────────────────────────────────────────────────────────────
  tooltip: {
    slug: 'tooltip',
    title: 'Tooltip',
    description:
      'Two anchored context components. Tooltip carries short text on hover or focus and closes itself; Dismissible Tip carries a title and longer body until the user closes it.',
    status: 'stable',
    scope: { Tooltip, DismissibleTip, Button },
    propSchema: {
      placement: {
        type: 'chip-select',
        label: 'Placement',
        options: ['top', 'right', 'bottom', 'left'],
        default: 'top',
      },
      theme: {
        type: 'chip-select',
        label: 'Theme',
        options: ['light', 'dark'],
        default: 'light',
      },
      content: {
        type: 'text',
        label: 'Tooltip content',
        default: 'Tooltip content',
      },
      tipType: {
        type: 'chip-select',
        label: 'Tip type',
        options: ['primary', 'secondary'],
        default: 'primary',
      },
      showClose: {
        type: 'boolean',
        label: 'Tip close control',
        default: true,
      },
    },
    generateCode: ({ placement, theme, content, tipType, showClose }) => {
      const p = String(placement)
      const th = String(theme)
      const c = String(content)
      const tt = String(tipType)
      const close = showClose === true || showClose === 'true'

      const tooltipAttrs = [
        `content="${c}"`,
        p !== 'top' ? `placement="${p}"` : null,
        th !== 'light' ? `theme="${th}"` : null,
      ].filter(Boolean).join(' ')

      const tipAttrs = [
        `title="Permission Roles"`,
        tt !== 'primary' ? `type="${tt}"` : null,
        !close ? `showClose={false}` : null,
      ].filter(Boolean).join(' ')

      // Both components render in one preview, so they need a single root —
      // the playground evaluates the snippet as one expression.
      return [
        `<div style={{ display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'flex-start', padding: 48 }}>`,
        `  <Tooltip ${tooltipAttrs}>`,
        `    <Button variant="secondary">Hover me</Button>`,
        `  </Tooltip>`,
        `  <DismissibleTip`,
        `    ${tipAttrs}`,
        `    content="This Entity contains Items that reference this field so it cannot be deleted."`,
        `  />`,
        `</div>`,
      ].join('\n')
    },
  },

  // ─── Stepper ──────────────────────────────────────────────────────────────────
  stepper: {
    slug: 'stepper',
    title: 'Stepper',
    description:
      'Vertical progress indicator for multi-step flows. Shows completed, active, and upcoming steps with a connecting line, step labels, and optional tag chips on completed steps.',
    status: 'stable',
    scope: { Stepper },
    propSchema: {
      currentStep: {
        type: 'chip-select',
        label: 'Active step',
        options: ['0', '1', '2', '3', '4'],
        default: '1',
      },
      stepCount: {
        type: 'chip-select',
        label: 'Step count',
        options: ['3', '4', '5'],
        default: '4',
      },
      showTags: {
        type: 'boolean',
        label: 'Show tags on completed',
        default: true,
      },
    },
    generateCode: ({ currentStep, stepCount, showTags }) => {
      const active = parseInt(String(currentStep)) || 0
      const count  = parseInt(String(stepCount))   || 4
      const tags   = showTags === true || showTags === 'true'

      const ALL_STEPS = [
        { title: '1. Select Campaign Type', description: 'Choose the channel and format',   tag: 'Voice Survey'     },
        { title: '2. Configure Audience',   description: 'Define targeting rules',           tag: 'All Contacts'     },
        { title: '3. Compose Message',       description: 'Write and preview your message',  tag: 'Template Applied' },
        { title: '4. Schedule Delivery',     description: 'Set date, time, and quiet hours', tag: 'Mar 15, 09:00 AM' },
        { title: '5. Review & Launch',       description: 'Final review before activation',  tag: 'Ready'            },
      ].slice(0, count)

      const stepsCode = ALL_STEPS.map((s, i) => {
        const tagPart = (i < active && tags) ? `, tag: "${s.tag}"` : ''
        return `    { title: "${s.title}", description: "${s.description}"${tagPart} }`
      }).join(',\n')

      return [
        `<div style={{ width: 280, background: '#ffffff', border: '1px solid #eff1f3', borderRadius: 8, padding: 8 }}>`,
        `  <Stepper`,
        `    steps={[`,
        stepsCode,
        `    ]}`,
        `    currentStep={${active}}`,
        `  />`,
        `</div>`,
      ].join('\n')
    },
  },

  // ─── Nav Item ────────────────────────────────────────────────────────────────
  'nav-item': {
    slug: 'nav-item',
    title: 'Nav Item',
    description:
      'Atomic navigation item for vertical sidebars. Two types: Menu Item (48px, icon + caret) and Sub Menu Item (48px, indented). Four interaction states.',
    status: 'stable',
    scope: { NavMenuItem, NavSubItem, SquaresFourIcon },
    propSchema: {
      variant: {
        type: 'chip-select',
        label: 'Type',
        options: ['menu', 'sub'],
        default: 'menu',
      },
      state: {
        type: 'chip-select',
        label: 'State',
        options: ['default', 'hover', 'active', 'disabled'],
        default: 'default',
      },
      label: {
        type: 'text',
        label: 'Label',
        default: 'Campaigns',
      },
      isOpen: {
        type: 'boolean',
        label: 'Open (menu only)',
        default: false,
      },
    },
    generateCode: ({ variant, state, label, isOpen }) => {
      const v   = String(variant)
      const s   = String(state)
      const lbl = String(label)
      const open = isOpen === true || isOpen === 'true'

      if (v === 'sub') {
        const lines = ['<NavSubItem']
        lines.push(`  label="${lbl}"`)
        if (s !== 'default') lines.push(`  state="${s}"`)
        lines.push('/>')
        return lines.join('\n')
      }

      const lines = ['<NavMenuItem']
      lines.push(`  label="${lbl}"`)
      lines.push(`  icon={<SquaresFourIcon size={18} weight="thin" />}`)
      if (s !== 'default') lines.push(`  state="${s}"`)
      if (open) lines.push(`  isOpen`)
      lines.push('/>')
      return lines.join('\n')
    },
  },

  // ─── NT Menu ──────────────────────────────────────────────────────────────────
  'nt-menu': {
    slug: 'nt-menu',
    title: 'NT Menu',
    description:
      'In-progress redesign of the left/vertical nav — light theme, rounded pill rows, drop shadows, tree connector lines. Not yet wired in as the live sidebar.',
    status: 'wip',
    scope: { NTMenuHomeItem, NTMenuModuleItem, NTMenuSubItem, NTMenuGroup, NTMenuItemCollapsed },
    propSchema: {
      type: {
        type: 'chip-select',
        label: 'Type',
        options: ['Home', 'Module', 'Sub Item', 'Group', 'Collapsed'],
        default: 'Group',
      },
      state: {
        type: 'chip-select',
        label: 'State',
        options: ['default', 'hover', 'active'],
        default: 'default',
      },
      open: {
        type: 'boolean',
        label: 'Open (Module/Group only)',
        default: true,
      },
    },
    generateCode: ({ type, state, open }) => {
      const t    = String(type)
      const s    = String(state)
      const isOpen = open === true || open === 'true'

      if (t === 'Home') {
        return `<NTMenuHomeItem${s !== 'default' ? ` state="${s}"` : ''} />`
      }
      if (t === 'Sub Item') {
        return `<NTMenuSubItem\n  label="Module Sub Item"${s !== 'default' ? `\n  state="${s}"` : ''}\n/>`
      }
      if (t === 'Collapsed') {
        return `<NTMenuItemCollapsed${s !== 'default' ? ` state="${s}"` : ''} />`
      }
      if (t === 'Group') {
        return [
          `<NTMenuGroup label="Module Name"${isOpen ? ' open' : ''}>`,
          `  <NTMenuSubItem label="Module Sub Item" state="active" />`,
          `  <NTMenuSubItem label="Module Sub Item" />`,
          `  <NTMenuSubItem label="Module Sub Item" />`,
          `</NTMenuGroup>`,
        ].join('\n')
      }
      // Module
      return [
        `<NTMenuModuleItem`,
        `  label="Module Name"`,
        s !== 'default' ? `  state="${s}"` : null,
        isOpen ? `  isOpen` : null,
        `/>`,
      ].filter(Boolean).join('\n')
    },
  },

  // ─── Breadcrumb ───────────────────────────────────────────────────────────────
  breadcrumb: {
    slug: 'breadcrumb',
    title: 'Breadcrumb',
    description:
      'A horizontal navigation trail showing the current position within the page hierarchy. Always starts with a Home icon; the last item is the current page. Depth is 1-4 items.',
    status: 'stable',
    scope: { Breadcrumb },
    propSchema: {
      depth: {
        type: 'chip-select',
        label: 'Depth',
        options: ['1', '2', '3', '4'],
        default: '2',
      },
    },
    generateCode: ({ depth }) => {
      const labels = ['Social Security Admin', 'Benefit Status Updates', 'Retirement Planning Reminders', 'Send Schedule']
      const hrefs  = ['/accounts/ssa', '/accounts/ssa/campaign-groups/benefit-status', '/accounts/ssa/campaign-groups/benefit-status/reminders']
      const n = Math.min(4, Math.max(1, Number(depth) || 2))

      const lines = ['<Breadcrumb', `  homeHref="/"`, '  items={[']
      for (let i = 0; i < n; i++) {
        const isCurrent = i === n - 1
        lines.push(isCurrent ? `    { label: '${labels[i]}' },` : `    { label: '${labels[i]}', href: '${hrefs[i]}' },`)
      }
      lines.push('  ]}', '/>')
      return lines.join('\n')
    },
  },

  // ─── Page Title ───────────────────────────────────────────────────────────────
  'page-title': {
    slug: 'page-title',
    title: 'Page Title',
    description:
      'Page-level header with a large title, optional subtitle, optional chip, and a composable right-side actions slot.',
    status: 'stable',
    scope: { PageTitle },
    propSchema: {
      title: {
        type: 'text',
        label: 'Title',
        default: 'Northeast Quarter',
      },
      subtitle: {
        type: 'text',
        label: 'Subtitle',
        default: 'Master list for Northeast Quarter',
      },
      showChip: {
        type: 'boolean',
        label: 'Show chip',
        default: false,
      },
      chip: {
        type: 'text',
        label: 'Chip label',
        default: 'Current',
      },
    },
    generateCode: ({ title, subtitle, showChip, chip }) => {
      const t   = String(title)
      const sub = String(subtitle)
      const ch  = String(chip)
      const sc  = Boolean(showChip)

      const lines: string[] = ['<PageTitle']
      lines.push(`  title="${t}"`)
      if (sub) lines.push(`  subtitle="${sub}"`)
      if (sc) lines.push('  showChip')
      if (sc && ch) lines.push(`  chip="${ch}"`)
      lines.push('/>')
      return lines.join('\n')
    },
  },

  // ─── Inline Context Data ──────────────────────────────────────────────────────
  'inline-context-data': {
    slug: 'inline-context-data',
    title: 'Inline Context Data',
    description:
      'A compact, read-only metadata row that displays a label–value pair with an optional contextual icon. Supports a secondary value for compound data.',
    status: 'stable',
    scope: { InlineContextData, AddressBookIcon, CalendarIcon, TagIcon, UserListIcon },
    propSchema: {
      label: {
        type: 'text',
        label: 'Label',
        default: 'Next Credit Renew:',
      },
      value: {
        type: 'text',
        label: 'Value',
        default: '11/05/2025',
      },
      showValue2: {
        type: 'boolean',
        label: 'Second value',
        default: false,
      },
      value2: {
        type: 'text',
        label: 'Value 2',
        default: '09:00 AM',
      },
      showIcon: {
        type: 'boolean',
        label: 'Show icon',
        default: true,
      },
    },
    generateCode: ({ label, value, showValue2, value2, showIcon }) => {
      const lbl   = String(label)
      const val   = String(value)
      const val2  = String(value2)
      const icon  = showIcon  === true || showIcon  === 'true'
      const two   = showValue2 === true || showValue2 === 'true'

      const lines: string[] = ['<InlineContextData']
      if (icon) lines.push(`  icon={<AddressBookIcon size={16} weight="regular" color="#8d8d8d" />}`)
      lines.push(`  label="${lbl}"`)
      lines.push(`  value="${val}"`)
      if (two) lines.push(`  value2="${val2}"`)
      lines.push('/>')
      return lines.join('\n')
    },
  },
  // ─── Instance Card ──────────────────────────────────────────────────────────
  'instance-card': {
    slug: 'instance-card',
    title: 'Instance Card',
    description:
      'A draggable, selectable row used to list an org instance inside a group. Clickable adds a leading multi-select checkbox; Read Only fills the row without one.',
    status: 'stable',
    scope: { InstanceCard },
    propSchema: {
      title: {
        type: 'text',
        label: 'Title',
        default: 'qa-cft-testing',
      },
      state: {
        type: 'chip-select',
        label: 'State',
        options: ['default', 'active', 'multi-select', 'disabled'] as const,
        default: 'default',
      },
      interaction: {
        type: 'chip-select',
        label: 'Interaction',
        options: ['clickable', 'read-only'] as const,
        default: 'clickable',
      },
    },
    generateCode: ({ title, state, interaction }) => {
      const t = String(title)
      const s = String(state)
      const i = String(interaction)

      const lines = ['<InstanceCard']
      lines.push(`  title="${t}"`)
      if (s !== 'default') lines.push(`  state="${s}"`)
      if (i !== 'clickable') lines.push(`  interaction="${i}"`)
      lines.push('/>')
      return lines.join('\n')
    },
  },
  // ─── Top Bar ──────────────────────────────────────────────────────────────────
  'top-bar': {
    slug: 'top-bar',
    title: 'Top Bar',
    description:
      'Application-level top bar with product branding, instance label, and action icon buttons. CxPortal, CxCentral, and Cases share one unified accent — only the wordmark differs. "New UI" is a stripped-down variant tracking the org\'s active redesign direction.',
    status: 'stable',
    scope: { TopBar },
    propSchema: {
      product: {
        type: 'chip-select',
        label: 'Product',
        options: ['cx-portal', 'cx-central', 'cases', 'new-ui'] as const,
        default: 'cx-portal',
      },
      instance: {
        type: 'text',
        label: 'Instance',
        default: 'pronetxcrawler',
      },
      userEmail: {
        type: 'text',
        label: 'User email',
        default: 'rseoane@pronetx.com',
      },
      notifCount: {
        type: 'select',
        label: 'Notifications',
        options: ['0', '1', '3', '9', '12'],
        default: '3',
      },
    },
    generateCode: ({ product, instance, userEmail, notifCount }) => {
      const prod  = String(product)
      const inst  = String(instance)
      const email = String(userEmail)
      const count = Number(notifCount)

      const lines: string[] = ['<TopBar']
      if (prod !== 'cx-portal') lines.push(`  product="${prod}"`)
      if (inst !== 'pronetxcrawler') lines.push(`  instance="${inst}"`)
      if (email !== 'rseoane@pronetx.com') lines.push(`  userEmail="${email}"`)
      if (count !== 3) lines.push(`  notifCount={${count}}`)
      lines.push('/>')
      return lines.join('\n')
    },
  },

  'file-tree': {
    slug: 'file-tree',
    title: 'File Tree',
    description:
      'Hierarchical navigation tree for account → group → topic structures. 24 px rows with expand/collapse carets, connector lines, and topic selection highlight.',
    status: 'stable',
    scope: { FileTree, TREE_DATA: FILE_TREE_DATA },
    propSchema: {
      selectedId: {
        type: 'chip-select',
        label: 'Selected',
        options: ['topic-1', 'topic-2', 'topic-3', 'topic-4', 'topic-5'],
        default: 'topic-1',
      },
    },
    generateCode: ({ selectedId }) => {
      const sel = String(selectedId)
      return [
        '<div style={{ width: 280, border: \'1px solid #eff1f3\' }}>',
        '  <FileTree',
        '    nodes={TREE_DATA}',
        `    selectedId="${sel}"`,
        '  />',
        '</div>',
      ].join('\n')
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
