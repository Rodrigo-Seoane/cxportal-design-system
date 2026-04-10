'use client'

import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useEffect,
  useState,
  useId,
  type ReactNode,
  type HTMLAttributes,
  type ThHTMLAttributes,
  type TdHTMLAttributes,
} from 'react'
import { CaretUpDown, CaretUp, CaretDown, CheckIcon } from '@phosphor-icons/react'

// ─── Design tokens ────────────────────────────────────────────────────────────
// Source: Figma node 795-2130 (Table Fields) · 1676-58803 (Documentation)
//
// Sizes:    wide (header 48px · cell 64px) | compact (header 40px · cell 40px)
// States:   default · hover · selected · disabled
// Cell types: text · number · link · secondary · actions
// ──────────────────────────────────────────────────────────────────────────────

const T = {
  // Surfaces
  headerBg:       '#ffffff',  // --surface/section
  rowBgDefault:   '#ffffff',  // --surface/section
  rowBgZebra:     '#f8f8f8',  // --surface/table/zebra-row
  rowBgHover:     '#f0f4fb',  // subtle blue tint on hover
  rowBgSelected:  '#eaeff8',  // accent background when selected
  // Borders
  borderRow:      '#eff1f3',  // --border-color/neutral
  borderTable:    '#eff1f3',  // outer table border
  borderActive:   '#689df6',  // --border-color/surface-active/primary
  borderDisabled: '#d9dce0',  // --border-color/disabled
  // Text
  textHeader:     '#021920',  // header label — Body/Small/sm-semibold
  textSecondary:  '#7c7b8b',  // --text/body/secondary (sort icon idle)
  textPrimary:    '#021920',  // --text/body/primary
  textLink:       '#4285f4',  // --text/action / --content-action/primary
  textVisited:    '#2859ab',  // --text/info (visited links)
  textDisabled:   '#aab0b8',  // disabled rows/cells
  // Checkbox (mirrors checkbox.tsx tokens)
  cbChecked:      '#4285f4',  // --surface/action/primary
  cbHover:        '#689df6',  // --content-action/primary/300
  cbBorder:       '#689df6',  // --border-color/surface-active/primary
  cbBorderDis:    '#d9dce0',  // --border-color/disabled
  cbSurface:      '#ffffff',  // --surface/form-field
  cbSurfaceDis:   '#eff1f3',  // --surface/disabled
} as const

// ─── Size context ─────────────────────────────────────────────────────────────

export type TableSize = 'wide' | 'compact'
export type SortDirection = 'none' | 'asc' | 'desc'

const TableSizeCtx = createContext<TableSize>('wide')
const useTableSize = () => useContext(TableSizeCtx)

// ─── Row selection context ────────────────────────────────────────────────────
// Shared between TableRow (background) and TableCheckboxCell (checkbox state)
// so that checking a cell automatically highlights its parent row.

interface TableRowCtxValue {
  selected: boolean
  toggleSelection: (v: boolean) => void
}
const TableRowCtx = createContext<TableRowCtxValue | null>(null)

// ─── Table (root) ─────────────────────────────────────────────────────────────

export interface TableProps extends HTMLAttributes<HTMLDivElement> {
  /** Row density. Wide = 64px body / 48px header. Compact = 40px both. */
  size?: TableSize
  children: ReactNode
}

export function Table({ size = 'wide', children, style, ...props }: TableProps) {
  return (
    <TableSizeCtx.Provider value={size}>
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          borderRadius: 8,
          border: `1px solid ${T.borderTable}`,
          ...style,
        }}
        {...props}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: 'var(--font-sans, "Mona Sans", sans-serif)',
          }}
        >
          {children}
        </table>
      </div>
    </TableSizeCtx.Provider>
  )
}

// ─── TableHeader (thead) ──────────────────────────────────────────────────────

export function TableHeader({ children, style, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      style={{
        background: T.headerBg,
        borderBottom: `1px solid ${T.borderRow}`,
        ...style,
      }}
      {...props}
    >
      {children}
    </thead>
  )
}

// ─── TableBody (tbody) ────────────────────────────────────────────────────────

export function TableBody({ children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props}>{children}</tbody>
}

// ─── TableRow (tr) ────────────────────────────────────────────────────────────

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /** Marks row as selected — renders accent background. */
  selected?: boolean
  /** Marks row as non-interactive — reduced opacity, no hover. */
  disabled?: boolean
  /** Alternate background for zebra-striped tables (pass on odd-indexed rows). */
  striped?: boolean
}

export function TableRow({
  selected: controlledSelected, // undefined → uncontrolled (row manages its own state)
  disabled = false,
  striped = false,
  children,
  style,
  onMouseEnter,
  onMouseLeave,
  ...props
}: TableRowProps) {
  const [hovered, setHovered] = useState(false)
  const [internalSelected, setInternalSelected] = useState(false)

  const isSelectionControlled = controlledSelected !== undefined
  const selected = isSelectionControlled ? controlledSelected : internalSelected

  const toggleSelection = useCallback((v: boolean) => {
    if (!isSelectionControlled) setInternalSelected(v)
  }, [isSelectionControlled])

  const bg = disabled
    ? T.rowBgDefault
    : selected
    ? T.rowBgSelected
    : hovered
    ? T.rowBgHover
    : striped
    ? T.rowBgZebra
    : T.rowBgDefault

  return (
    <TableRowCtx.Provider value={{ selected, toggleSelection }}>
      <tr
        aria-selected={selected || undefined}
        aria-disabled={disabled || undefined}
        style={{
          background: bg,
          borderBottom: `1px solid ${T.borderRow}`,
          opacity: disabled ? 0.5 : 1,
          transition: 'background 120ms ease',
          cursor: disabled ? 'not-allowed' : 'default',
          ...style,
        }}
        onMouseEnter={e => { if (!disabled) setHovered(true); onMouseEnter?.(e) }}
        onMouseLeave={e => { setHovered(false); onMouseLeave?.(e) }}
        {...props}
      >
        {children}
      </tr>
    </TableRowCtx.Provider>
  )
}

// ─── TableHead (th) ───────────────────────────────────────────────────────────

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /**
   * Current sort direction. Providing this prop (even as `'none'`) makes the
   * column sortable — renders the CaretUpDown indicator and pointer cursor.
   */
  sortDirection?: SortDirection
  /** Called when the header is clicked in sort mode. */
  onSort?: () => void
  /** Text / content alignment — mirrors the cell data convention. */
  align?: 'left' | 'center' | 'right'
}

export function TableHead({
  sortDirection,
  onSort,
  align = 'left',
  children,
  style,
  onClick,
  ...props
}: TableHeadProps) {
  const size = useTableSize()
  const sortable = sortDirection !== undefined

  const height   = size === 'wide' ? 48 : 40
  const paddingV = size === 'wide' ? 16 : 8

  const SortIcon =
    sortDirection === 'asc'  ? CaretUp   :
    sortDirection === 'desc' ? CaretDown :
    CaretUpDown

  const sortColor = (sortDirection === 'asc' || sortDirection === 'desc')
    ? T.textLink
    : T.textSecondary

  return (
    <th
      scope="col"
      aria-sort={
        sortDirection === 'asc'  ? 'ascending'  :
        sortDirection === 'desc' ? 'descending' :
        sortable                 ? 'none'       :
        undefined
      }
      style={{
        height,
        padding: `${paddingV}px 8px`,
        textAlign: align,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: '20px',
        letterSpacing: '0.24px',
        color: T.textHeader,
        whiteSpace: 'nowrap',
        userSelect: sortable ? 'none' : undefined,
        cursor: sortable ? 'pointer' : 'default',
        ...style,
      }}
      onClick={e => { onSort?.(); onClick?.(e) }}
      {...props}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {children}
        {sortable && (
          <SortIcon
            size={18}
            color={sortColor}
            weight={sortDirection !== 'none' ? 'bold' : 'regular'}
          />
        )}
      </span>
    </th>
  )
}

// ─── TableCell (td) ───────────────────────────────────────────────────────────

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  /** Data alignment — numbers right, text left, status/actions center. */
  align?: 'left' | 'center' | 'right'
  /**
   * Visual variant:
   * - `default`   → primary text (#021920)
   * - `secondary` → muted text (#7c7b8b)
   * - `link`      → blue clickable (#4285f4)
   * - `visited`   → visited link (#2859ab)
   */
  variant?: 'default' | 'secondary' | 'link' | 'visited'
}

export function TableCell({
  align = 'left',
  variant = 'default',
  children,
  style,
  ...props
}: TableCellProps) {
  const size = useTableSize()

  const height   = size === 'wide' ? 64 : 40
  const paddingV = size === 'wide' ? 12 : 8
  const fontSize = size === 'wide' ? 14 : 12

  const color =
    variant === 'link'      ? T.textLink      :
    variant === 'visited'   ? T.textVisited   :
    variant === 'secondary' ? T.textSecondary :
    T.textPrimary

  return (
    <td
      style={{
        height,
        padding: `${paddingV}px 8px`,
        textAlign: align,
        fontSize,
        fontWeight: 400,
        lineHeight: '20px',
        color,
        verticalAlign: 'middle',
        ...style,
      }}
      {...props}
    >
      {children}
    </td>
  )
}

// ─── TableCaption ─────────────────────────────────────────────────────────────

export function TableCaption({ children, style, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <caption
      style={{
        fontSize: 12,
        fontWeight: 400,
        color: T.textSecondary,
        textAlign: 'left',
        padding: '8px',
        captionSide: 'bottom',
        ...style,
      }}
      {...props}
    >
      {children}
    </caption>
  )
}

// ─── Shared inline checkbox (used by TableCheckboxHead and TableCheckboxCell) ──

interface InlineCheckboxProps {
  id: string
  /** Omit to use uncontrolled mode — the checkbox tracks its own state. */
  checked?: boolean
  indeterminate?: boolean
  disabled?: boolean
  ariaLabel?: string
  onChange?: (checked: boolean) => void
  size: TableSize
  isHeader?: boolean
}

function InlineCheckbox({
  id,
  checked: controlledChecked,
  indeterminate = false,
  disabled = false,
  ariaLabel,
  onChange,
  size,
  isHeader = false,
}: InlineCheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [hovered, setHovered] = useState(false)
  const [internalChecked, setInternalChecked] = useState(false)

  const isControlled = controlledChecked !== undefined
  const checked = isControlled ? controlledChecked : internalChecked

  const handleChange = (v: boolean) => {
    if (!isControlled) setInternalChecked(v)
    onChange?.(v)
  }

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate && !checked
    }
  }, [indeterminate, checked])

  const active = checked || indeterminate

  const boxBg = disabled
    ? T.cbSurfaceDis
    : active
    ? T.cbChecked
    : hovered
    ? T.cbHover
    : T.cbSurface

  const boxBorder = disabled ? T.cbBorderDis : T.cbBorder

  // Cells heights to center the 18px box
  const cellHeight = isHeader
    ? (size === 'wide' ? 48 : 40)
    : (size === 'wide' ? 64 : 40)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: cellHeight,
      }}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Native input — preserves keyboard + screen-reader behaviour */}
      <input
        ref={inputRef}
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={e => handleChange(e.target.checked)}
        style={{
          position: 'absolute',
          opacity: 0,
          width: 1,
          height: 1,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
        }}
      />
      {/* Visual control */}
      <div
        aria-hidden="true"
        onClick={() => !disabled && handleChange(!checked)}
        style={{
          width: 18,
          height: 18,
          flexShrink: 0,
          background: boxBg,
          border: `1px solid ${boxBorder}`,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'background 120ms ease, border-color 120ms ease',
        }}
      >
        {/* Indeterminate dash */}
        {indeterminate && !checked && (
          <div
            style={{
              width: 10,
              height: 2,
              background: 'white',
              borderRadius: 1,
            }}
          />
        )}
        {/* Checked mark */}
        {checked && <CheckIcon size={12} color="white" weight="bold" />}
      </div>
    </div>
  )
}

// ─── TableCheckboxHead (th — select-all) ─────────────────────────────────────

export interface TableCheckboxHeadProps {
  /** True when ALL rows are selected. */
  checked?: boolean
  /** True when SOME (but not all) rows are selected — renders a dash. */
  indeterminate?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
}

export function TableCheckboxHead({
  checked,        // undefined → uncontrolled; boolean → controlled
  indeterminate = false,
  onChange,
  disabled = false,
}: TableCheckboxHeadProps) {
  const size = useTableSize()
  const id = useId()

  return (
    <th
      scope="col"
      style={{ width: 40, padding: '0 8px', textAlign: 'center', verticalAlign: 'middle' }}
    >
      <InlineCheckbox
        id={id}
        checked={checked}
        indeterminate={indeterminate}
        disabled={disabled}
        ariaLabel="Select all rows"
        onChange={v => onChange?.(v)}
        size={size}
        isHeader
      />
    </th>
  )
}

// ─── TableCheckboxCell (td — row selection) ───────────────────────────────────

export interface TableCheckboxCellProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  ariaLabel?: string
}

export function TableCheckboxCell({
  checked: controlledChecked, // undefined → driven by parent TableRow context
  onChange,
  disabled = false,
  ariaLabel,
}: TableCheckboxCellProps) {
  const size = useTableSize()
  const id = useId()
  const rowCtx = useContext(TableRowCtx)

  // When no external checked prop, delegate to the parent TableRow's selection state.
  const useRowCtx = rowCtx !== null && controlledChecked === undefined
  const checked = useRowCtx ? rowCtx.selected : controlledChecked

  const handleChange = (v: boolean) => {
    if (useRowCtx) rowCtx.toggleSelection(v)
    onChange?.(v)
  }

  return (
    <td style={{ width: 40, padding: '0 8px', textAlign: 'center', verticalAlign: 'middle' }}>
      <InlineCheckbox
        id={id}
        checked={checked}
        disabled={disabled}
        ariaLabel={ariaLabel ?? 'Select row'}
        onChange={handleChange}
        size={size}
      />
    </td>
  )
}
