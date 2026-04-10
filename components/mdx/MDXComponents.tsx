import type { MDXComponents } from 'mdx/types'
import { DosDonts, Do, Dont } from '@/components/ds/DosDonts'
import { ComponentPlayground } from '@/components/ds/ComponentPlayground'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Chip, Tag } from '@/components/ui/chip'
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs'

// ─── Inline ComponentPreview wrapper ─────────────────────────────────────────
// Lets MDX docs embed the live playground with: <ComponentPreview slug="button" />

function ComponentPreview({ slug }: { slug: string }) {
  return (
    <div className="my-6">
      <ComponentPlayground slug={slug} />
    </div>
  )
}

// ─── MDX component map ────────────────────────────────────────────────────────
// Maps HTML tags → styled equivalents, and registers custom DS components.

export function getMDXComponents(): MDXComponents {
  return {
    // ── Headings ──────────────────────────────────────────────────────────────

    h2: ({ children, ...props }) => (
      <h2
        className="text-lg font-semibold mt-10 mb-3 pb-2 border-b"
        style={{
          color: 'var(--color-text-primary)',
          borderColor: 'var(--color-border)',
        }}
        {...props}
      >
        {children}
      </h2>
    ),

    h3: ({ children, ...props }) => (
      <h3
        className="text-base font-semibold mt-6 mb-2"
        style={{ color: 'var(--color-text-primary)' }}
        {...props}
      >
        {children}
      </h3>
    ),

    // ── Body text ─────────────────────────────────────────────────────────────

    p: ({ children, ...props }) => (
      <p
        className="text-sm mb-4 leading-6"
        style={{ color: 'var(--color-text-secondary)' }}
        {...props}
      >
        {children}
      </p>
    ),

    // ── Lists ─────────────────────────────────────────────────────────────────

    ul: ({ children, ...props }) => (
      <ul
        className="list-disc list-inside mb-4 space-y-1"
        style={{ color: 'var(--color-text-secondary)' }}
        {...props}
      >
        {children}
      </ul>
    ),

    li: ({ children, ...props }) => (
      <li
        className="text-sm leading-6"
        style={{ color: 'var(--color-text-secondary)' }}
        {...props}
      >
        {children}
      </li>
    ),

    // ── Tables ────────────────────────────────────────────────────────────────

    table: ({ children, ...props }) => (
      <div className="overflow-x-auto mb-6 rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-sm border-collapse" {...props}>
          {children}
        </table>
      </div>
    ),

    thead: ({ children, ...props }) => (
      <thead style={{ backgroundColor: 'var(--color-surface-display)' }} {...props}>
        {children}
      </thead>
    ),

    th: ({ children, ...props }) => (
      <th
        className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider border-b"
        style={{
          color: 'var(--color-text-secondary)',
          borderColor: 'var(--color-border)',
        }}
        {...props}
      >
        {children}
      </th>
    ),

    td: ({ children, ...props }) => (
      <td
        className="px-4 py-3 text-sm border-b"
        style={{
          color: 'var(--color-text-primary)',
          borderColor: 'var(--color-border)',
        }}
        {...props}
      >
        {children}
      </td>
    ),

    // ── Code ──────────────────────────────────────────────────────────────────
    // rehype-pretty-code transforms <pre><code> into its own structure;
    // these handle inline `code` and raw pre fallback.

    code: ({ children, ...props }) => (
      <code
        className="text-xs font-mono px-1.5 py-0.5 rounded"
        style={{
          backgroundColor: 'var(--color-surface-display)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)',
        }}
        {...props}
      >
        {children}
      </code>
    ),

    pre: ({ children, ...props }) => (
      <pre
        className="rounded-lg overflow-x-auto my-4 p-4 text-sm font-mono"
        style={{
          backgroundColor: 'var(--color-surface-nav)',
          color: 'var(--color-text-on-dark)',
        }}
        {...props}
      >
        {children}
      </pre>
    ),

    // ── Strong / Em ───────────────────────────────────────────────────────────

    strong: ({ children, ...props }) => (
      <strong
        className="font-semibold"
        style={{ color: 'var(--color-text-primary)' }}
        {...props}
      >
        {children}
      </strong>
    ),

    // ── Custom DS components ──────────────────────────────────────────────────

    DosDonts,
    Do,
    Dont,
    ComponentPreview,
    // ── Design-system Table primitives (available in all MDX docs) ────────────
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    // ── Chip & Tag (available in all MDX docs) ────────────────────────────────
    Chip,
    Tag,
    // ── Tabs (available in all MDX docs) ─────────────────────────────────────
    Tabs,
    TabList,
    Tab,
    TabPanel,
  }
}
