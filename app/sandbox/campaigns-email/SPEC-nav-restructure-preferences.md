# SPEC — Email Campaigns: Navigation Restructure & Preferences Page

**Source PRD:** `PRD-nav-restructure-preferences.md`
**Module:** `app/sandbox/campaigns-email/`
**Date:** 2026-05-12
**Status:** Ready for Implementation

---

## Overview

Two tightly coupled changes:

1. **Navigation restructure** — Replace the flat 8-item `SUB_NAV` array in `layout.tsx` with a grouped sidebar that uses non-interactive section headers (CAMPAIGNS, AUDIENCE, ANALYTICS).
2. **Preferences page** — Create a new `preferences/` route that merges the Groups page (tree + detail pane) and the Topics page (topic list). The standalone `topics/page.tsx` list is deleted; topic detail pages at `topics/[id]/` are kept unchanged. The `groups/` directory is deleted once `preferences/` is in place.

Additionally: `lists/` → `segments/`, `unsubscribes/` → `unsubscribers/`, `TopicModelContext` removed.

---

## Implementation Order

Execute in this sequence to avoid broken intermediate states:

1. Create `preferences/` (page + DetailPane)
2. Create `segments/` (copy from `lists/`)
3. Create `unsubscribers/` (copy from `unsubscribes/`)
4. Update `layout.tsx` (new nav — points to new routes)
5. Update internal links in `campaigns/page.tsx` and `campaigns/new/page.tsx`
6. Delete `groups/`, `topics/page.tsx`, `lists/`, `unsubscribes/`
7. Remove `TopicModelContext` provider from `layout.tsx`

---

## 1. Files to CREATE

---

### `preferences/page.tsx`

**Purpose:** Replaces `groups/page.tsx`. Two-column layout: tree rail + detail pane. Removes "Hierarchy labels" toggle entirely. Adds topic count badge on group nodes.

**Key changes from `groups/page.tsx`:**
- Delete `LABEL_SETS` array and all label-set toggle UI
- Delete `labelSetId` state
- Pass fixed label object `{ level1: 'Organization', level2: 'Component', level3: 'Campaign Group' }` directly to `DetailPane` — no dynamic switching
- Root node label: `SSA · Organization` (hard-coded)
- `TreeNode` at depth 2 (Campaign Group): add a `topicCount` prop. Render a secondary badge `{topicCount} topics` after the dot indicator if `topicCount > 0`
- Import `TOPICS` from `../_mock/topics` and compute `topicCount` for each group: `TOPICS.filter(t => t.groupId === group.id).length`
- All existing tree behavior (expand/collapse, selection, active state) stays identical
- File lives at: `app/sandbox/campaigns-email/preferences/page.tsx`

**Interface additions to `TreeNode`:**
```typescript
topicCount?: number   // only passed for depth-2 nodes
```

**Topic count badge (inside `TreeNode`, after the dot for depth === 2, only if topicCount > 0):**
```typescript
{topicCount !== undefined && topicCount > 0 && (
  <span style={{
    fontSize: 10, fontWeight: 600, lineHeight: '14px',
    padding: '1px 5px', borderRadius: 8, flexShrink: 0,
    background: 'var(--color-info-100)',
    color: 'var(--color-primary)',
  }}>
    {topicCount} topics
  </span>
)}
```

---

### `preferences/DetailPane.tsx`

**Purpose:** Replaces `groups/DetailPane.tsx`. Retains Component and Group detail views. Adds Communication Topics section to Group detail. Adds purpose statement for empty/default state.

**Imports to add:**
```typescript
import Link from 'next/link'
import { TOPICS } from '../_mock/topics'
import { TEMPLATES } from '../_mock/templates'
```

**`LabelSet` type:** Keep as-is. Remove `level1` since it's only used in the label toggle (now removed). Actually keep all three fields for compatibility — just pass fixed values from `page.tsx`.

**`Selection` type:** Keep as-is (`component` | `group` | `null`).

---

#### Empty/default state (Selection = null)

Replace the current muted "Select a component or group…" paragraph with:

```tsx
<div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center',
  height: '100%', maxWidth: 480, paddingTop: 48 }}>
  <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 600,
    color: 'var(--color-text-primary)' }}>
    Organization Preferences
  </h2>
  <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-secondary)',
    lineHeight: '22px' }}>
    Browse your organization's component structure and manage the communication
    streams available within each campaign group. Select a component to see its
    groups, or select a campaign group to view its topics and membership.
  </p>
</div>
```

---

#### `ComponentDetail` — changes

- Change badge label from dynamic `{labels.level2}` to hard-coded string `Component`
- Change section heading from dynamic `{labels.level3}s ({groups.length})` to `Campaign Groups ({groups.length})`
- Make each group row in the list **clickable** — the row must accept an `onSelect` callback and call it when clicked. Add `cursor: pointer` to row style.
- `ComponentDetail` new prop: `onSelectGroup: (groupId: string) => void`
- Pass this down from `DetailPane` which receives it from `preferences/page.tsx` via a new prop: `onSelectGroup?: (groupId: string) => void`

**Updated `ComponentDetail` signature:**
```typescript
function ComponentDetail({
  componentId,
  labels,
  onSelectGroup,
}: {
  componentId: string
  labels: LabelSet
  onSelectGroup: (groupId: string) => void
})
```

**Row click handler (inside the group map):**
```typescript
onClick={() => onSelectGroup(g.id)}
```

Add to each row div:
```typescript
role="button"
tabIndex={0}
onKeyDown={e => { if (e.key === 'Enter') onSelectGroup(g.id) }}
style={{ ..., cursor: 'pointer' }}
onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-display)' }}
onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-section)' }}
```

---

#### `GroupDetail` — changes

- Badge label: hard-code `Campaign Group` (remove dynamic `{labels.level3}`)
- **Add `Communication Topics` section** between `Membership` and `Recent Campaigns`:

```typescript
// Inside GroupDetail, after the Membership div:
const groupTopics = TOPICS.filter(t => t.groupId === groupId)

function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function openRateColor(rate: number): string {
  if (rate >= 0.6) return '#1a6b1a'
  if (rate >= 0.4) return 'var(--color-text-primary)'
  return '#8b1a2a'
}
```

**Communication Topics section JSX:**

```tsx
<div>
  <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600,
    color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
    Communication Topics ({groupTopics.length})
  </p>

  {groupTopics.length === 0 ? (
    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
      No topics configured for this group.
    </p>
  ) : (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {groupTopics.map(topic => {
        const tpl = topic.defaultTemplateId
          ? TEMPLATES.find(t => t.id === topic.defaultTemplateId)
          : null
        return (
          <div key={topic.id} style={{
            padding: '12px 14px', borderRadius: 8,
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface-section)',
          }}>
            {/* Name row */}
            <div style={{ display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: 6 }}>
              <Link
                href={`/sandbox/campaigns-email/topics/${topic.id}`}
                style={{ fontSize: 13, fontWeight: 600,
                  color: 'var(--color-primary)', textDecoration: 'none' }}
              >
                {topic.name}
              </Link>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>
                  {fmtCount(topic.subscriberCount)}
                </strong>{' '}subscribers
              </span>
              <span style={{ fontSize: 12, fontWeight: 600,
                color: openRateColor(topic.openRate) }}>
                {(topic.openRate * 100).toFixed(1)}% open
              </span>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                Last sent {fmtDate(topic.lastSentAt)}
              </span>
            </div>

            {/* Default template */}
            {tpl && (
              <div style={{ marginTop: 4, fontSize: 11, color: 'var(--color-text-secondary)' }}>
                Template:{' '}
                <Link
                  href={`/sandbox/campaigns-email/templates/${tpl.id}`}
                  style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}
                >
                  {tpl.name}
                </Link>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )}
</div>
```

---

### `segments/page.tsx`

**Purpose:** Identical to `lists/page.tsx` with the following changes:
- Update page title from `Contact Lists` → `Segments`
- Update subtitle copy: `"Segmented recipient groups scoped to a campaign group. Each segment contains email addresses, phone numbers, or both."`
- Remove `useTopicModel` import and all references to `model` (the `labeled-lists` branch in the Topics column can be removed — the column simply shows `{topicCount} topics` in all cases, or a list of topic tags as the non-conditional variant; since TopicModel is being retired, pick the `first-class` rendering: just show `{topicCount} topic{topicCount > 1 ? 's' : ''}` as a plain string)
- File path: `app/sandbox/campaigns-email/segments/page.tsx`

### `segments/[id]/page.tsx`

Copy from `lists/[id]/page.tsx` verbatim. Update any internal nav links that reference `lists/` → `segments/`.

### `segments/_components/UploadWizard.tsx`

Move from `lists/_components/UploadWizard.tsx`. No content changes needed.

### `unsubscribers/page.tsx`

Copy from `unsubscribes/page.tsx`. Update the page `<h2>` heading from `Unsubscribes` → `Unsubscribers` and update any internal links.

---

## 2. Files to MODIFY

---

### `layout.tsx`

**Change 1 — Remove `TopicModelProvider` and `TopicModelContext` import.**

Delete lines:
```typescript
import { TopicModelProvider, useTopicModel } from './_context/TopicModelContext'
```

Remove `<TopicModelProvider>` wrapper from `CampaignsEmailLayout`. Keep `<RoleProvider>`.

**Change 2 — Replace `SUB_NAV` array and `SubNav` component.**

Delete the entire `SUB_NAV` array and the current `SubNav` function. Replace with the following grouped structure.

**New nav data structure:**

```typescript
import {
  EnvelopeIcon,
  FileTextIcon,
  ShieldCheckIcon,
  UsersThreeIcon,
  SlidersIcon,
  UserMinusIcon,
  ChartBarIcon,
  FlaskIcon,
} from '@phosphor-icons/react'

type NavItem = {
  label: string
  href:  string
  Icon:  React.ComponentType<{ size?: number; weight?: string; color?: string }>
}

type NavSection = {
  heading: string
  items:   NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    heading: 'CAMPAIGNS',
    items: [
      { label: 'Campaigns',        href: '/sandbox/campaigns-email/campaigns',    Icon: EnvelopeIcon    },
      { label: 'Email Templates',  href: '/sandbox/campaigns-email/templates',    Icon: FileTextIcon    },
      { label: 'Senders',          href: '/sandbox/campaigns-email/senders',      Icon: ShieldCheckIcon },
    ],
  },
  {
    heading: 'AUDIENCE',
    items: [
      { label: 'Segments',         href: '/sandbox/campaigns-email/segments',     Icon: UsersThreeIcon  },
      { label: 'Preferences',      href: '/sandbox/campaigns-email/preferences',  Icon: SlidersIcon     },
      { label: 'Unsubscribers',    href: '/sandbox/campaigns-email/unsubscribers',Icon: UserMinusIcon   },
    ],
  },
  {
    heading: 'ANALYTICS',
    items: [
      { label: 'Metrics',          href: '/sandbox/campaigns-email/metrics',      Icon: ChartBarIcon    },
    ],
  },
]
```

**New `SubNav` component:**

```typescript
function SubNav() {
  const pathname          = usePathname()
  const { role, setRole } = useRole()

  function isActive(href: string): boolean {
    if (href === '/sandbox/campaigns-email/campaigns') {
      return pathname === href || pathname.startsWith(href + '/')
    }
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav
      aria-label="Campaigns navigation"
      style={{
        width:           200,
        flexShrink:      0,
        borderRight:    '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface-section)',
        padding:        '12px 0',
        position:       'sticky',
        top:             56,
        height:         'calc(100vh - 56px)',
        overflowY:      'auto',
      }}
    >
      {NAV_SECTIONS.map((section, si) => (
        <div key={section.heading} style={{ marginBottom: si < NAV_SECTIONS.length - 1 ? 8 : 0 }}>
          {/* Section header */}
          <div style={{
            padding:       '10px 16px 4px',
            fontSize:       10,
            fontWeight:     700,
            color:         'var(--color-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            userSelect:    'none',
          }}>
            {section.heading}
          </div>

          {/* Nav items */}
          {section.items.map(({ label, href, Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                style={{
                  display:         'flex',
                  alignItems:      'center',
                  gap:              10,
                  height:           36,
                  padding:         '0 16px',
                  textDecoration:  'none',
                  backgroundColor:  active ? 'var(--color-info-100)' : 'transparent',
                  borderRight:      active ? '2px solid var(--color-primary)' : '2px solid transparent',
                  transition:      'background 100ms ease',
                }}
                onMouseEnter={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-surface-display)'
                }}
                onMouseLeave={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                }}
              >
                <Icon
                  size={15}
                  weight={active ? 'fill' : 'regular'}
                  color={active ? 'var(--color-primary)' : 'var(--color-text-secondary)'}
                />
                <span style={{
                  fontSize:   13,
                  fontWeight: active ? 600 : 400,
                  color:      active ? 'var(--color-primary)' : 'var(--color-text-primary)',
                  lineHeight: '20px',
                }}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      ))}

      {/* Dev RBAC role switcher — unchanged */}
      <div style={{ margin: '16px 10px 0', padding: '10px', borderRadius: 8,
        border: '1px dashed var(--color-border)', background: 'var(--color-surface-display)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
          <FlaskIcon size={10} color="var(--color-text-secondary)" />
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.4px' }}>Viewing as</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {ROLES.map(r => (
            <button key={r.id} onClick={() => setRole(r.id)} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '4px 8px', borderRadius: 5, border: '1px solid',
              fontSize: 11, cursor: 'pointer', textAlign: 'left',
              background:  role === r.id ? 'var(--color-info-100)' : 'transparent',
              borderColor: role === r.id ? 'var(--color-primary)' : 'transparent',
              color:       role === r.id ? 'var(--color-primary)' : 'var(--color-text-primary)',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: role === r.id ? 'var(--color-primary)' : 'var(--color-border)' }} />
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
```

**Change 3 — Remove `useTopicModel` call inside `SubNav`.**

The old `SubNav` filtered items using `model`. The new version has no such filter — all sections and items are always visible.

---

### `campaigns/page.tsx`

**Find:** All occurrences of `"list"` or `"lists"` in user-facing strings.

- Column header `'Audience'` cell: `c.listIds.length > 0 ? \`${c.listIds.length} list${...}\`` → change to `segment${c.listIds.length > 1 ? 's' : ''}`

No route link changes needed in this file (it doesn't link to `lists/` directly).

---

### `campaigns/new/page.tsx`

**Find and update:**
- `StepAudience` imports `LISTS` from `'../../_mock/lists'` — keep import, no change needed (mock data path unchanged)
- User-facing label in `StepAudience` tab: `'Direct lists'` → `'Direct segments'`
- The `getTag` helper returns `\`${...} list(s)\`` → change to `\`${...} segment(s)\``
- `STEP_META[2].description`: `'Topic or lists'` → `'Topic or segments'`

---

## 3. Files to DELETE

After all new files are in place and `layout.tsx` is updated:

| File/Directory | Action |
|---|---|
| `groups/page.tsx` | Delete |
| `groups/DetailPane.tsx` | Delete |
| `groups/` | Delete directory |
| `topics/page.tsx` | Delete (list page only) |
| `lists/page.tsx` | Delete |
| `lists/[id]/page.tsx` | Delete |
| `lists/_components/UploadWizard.tsx` | Delete (moved to `segments/`) |
| `lists/` | Delete directory |
| `unsubscribes/page.tsx` | Delete |
| `unsubscribes/` | Delete directory |
| `_context/TopicModelContext.tsx` | Delete after removing from `layout.tsx` |

**Do NOT delete:**
- `topics/[id]/page.tsx` — topic detail pages remain at their existing route
- `topics/[id]/` directory — keep as-is

---

## 4. Implementation Notes

### `SlidersIcon` availability
Verify `SlidersIcon` exists in `@phosphor-icons/react`. If not, use `FadersIcon` or `GearIcon`. Run: `grep -r "SlidersIcon\|FadersIcon" node_modules/@phosphor-icons/react/dist --include="*.d.ts" | head -5`

### `onSelectGroup` propagation
`preferences/page.tsx` manages `selection` state. When a Component row's group card is clicked, call:
```typescript
setSelection({ type: 'group', id: groupId })
// Also ensure the parent component is expanded:
setExpanded(prev => new Set([...prev, componentId]))
```
The `componentId` of the group is available from `CAMPAIGN_GROUPS.find(g => g.id === groupId)?.componentId`.

Pass `onSelectGroup` all the way through: `page.tsx` → `DetailPane` → `ComponentDetail`.

### Route active state for `/campaigns`
The old nav had special-case logic for exact-matching `/sandbox/campaigns-email` (the module root). In the new nav, `Campaigns` links to `/sandbox/campaigns-email/campaigns` (the campaigns list), not the module root. The module root (`/sandbox/campaigns-email/page.tsx`) should redirect to `/sandbox/campaigns-email/campaigns` — add a `redirect()` call or a `<Redirect>` in `page.tsx` if it currently renders a landing page.

Check `app/sandbox/campaigns-email/page.tsx` — if it has content, either keep it as a dashboard or redirect to `/campaigns`. Coordinate with product if needed; for this sprint, assume redirect is acceptable.

### `TopicModelContext` removal — check for other consumers
Before deleting `_context/TopicModelContext.tsx`, grep for any remaining imports:
```bash
grep -r "TopicModelContext\|useTopicModel\|TopicModel" app/sandbox/campaigns-email --include="*.tsx" --include="*.ts"
```
After removing from `layout.tsx`, `lists/page.tsx` (which is being deleted), and `topics/page.tsx` (being deleted), there should be zero remaining consumers. Only then delete the file.

### Copy consistency — "segments" vs "lists" in mock data
`_mock/lists.ts` and `_mock/campaigns.ts` use `listIds` as field names. Do NOT rename these fields — mock data field names are internal and not user-facing. Only update user-visible string labels.

---

## 5. Testing Requirements

Since this is a prototype sandbox, there are no automated tests to update. Manual verification checklist:

### Navigation
- [ ] Sidebar shows three section headers: CAMPAIGNS, AUDIENCE, ANALYTICS
- [ ] Section headers are not clickable (no hover state, no navigation)
- [ ] All 7 nav items link to correct routes
- [ ] Active state (blue highlight + right border) appears on correct item for each route
- [ ] Navigating to `/sandbox/campaigns-email/preferences` highlights "Preferences"
- [ ] Navigating to `/sandbox/campaigns-email/segments` highlights "Segments"
- [ ] Navigating to `/sandbox/campaigns-email/unsubscribers` highlights "Unsubscribers"
- [ ] RBAC role switcher still appears at the bottom and functions

### Preferences page — tree
- [ ] Page loads with purpose statement in the detail pane (no selection by default)
- [ ] "Hierarchy labels" toggle is gone
- [ ] Root label shows "SSA · Organization"
- [ ] Components expand/collapse correctly
- [ ] Campaign Group nodes show topic count badge when group has ≥ 1 topic (e.g. RSC → "Retirement Benefits Outreach" shows "1 topics")
- [ ] Campaign Group nodes with 0 topics show no badge

### Preferences page — detail pane
- [ ] Clicking a Component shows Component detail with "Campaign Groups (N)" section
- [ ] Each group row in Component detail is clickable → selects that group, updates tree + detail
- [ ] Clicking a Campaign Group shows Group detail
- [ ] Membership chips render (Members, Lists, Topics, Templates, Campaigns)
- [ ] "Communication Topics" section appears with correct topic count
- [ ] Each topic card shows: name (as link to `/topics/[id]`), subscriber count, open rate (color-coded), last sent date
- [ ] Topics with no default template omit the template link line
- [ ] Groups with 0 topics show "No topics configured for this group."
- [ ] Recent Campaigns section appears if group has campaigns

### Segments page
- [ ] Route `/sandbox/campaigns-email/segments` loads the list page
- [ ] Page title shows "Segments" (not "Contact Lists")
- [ ] Upload wizard still works
- [ ] Filters (Component, Channel) still work
- [ ] Row links navigate to `/sandbox/campaigns-email/segments/[id]`

### Unsubscribers page
- [ ] Route `/sandbox/campaigns-email/unsubscribers` loads correctly
- [ ] Page heading shows "Unsubscribers"

### Topics detail pages
- [ ] `/sandbox/campaigns-email/topics/[any-id]` still loads (not broken by retiring the list page)

### Deleted routes — confirm 404 or redirect
- [ ] `/sandbox/campaigns-email/groups` returns 404 (or redirect — acceptable)
- [ ] `/sandbox/campaigns-email/topics` returns 404 (list page deleted)
- [ ] `/sandbox/campaigns-email/lists` returns 404
- [ ] `/sandbox/campaigns-email/unsubscribes` returns 404

### Campaign stepper
- [ ] "Audience" step tab label shows "Direct segments" (not "Direct lists")
- [ ] Step meta description reads "Topic or segments"
- [ ] Tag summary in stepper shows "N segment(s)"

---

## 6. Decisions Made (from PRD Open Questions)

| OQ | Decision | Rationale |
|---|---|---|
| OQ-1 Topic detail route | Keep `/topics/[id]` unchanged | Zero-risk; retiring only the list route; topic cards in Preferences deep-link to existing route |
| OQ-2 Page name | "Preferences" | Emphasizes subscriber control; confirmed by product owner |
| OQ-3 Topic creation | Out of scope; no stub needed in this sprint | Avoids scope creep; creation surface will be designed separately |
| OQ-4 Segments audit | Update only user-facing strings; do NOT rename `listIds` fields in mock data | Internal field naming is irrelevant to users |
| OQ-5 TopicModelContext | Delete fully after verifying zero consumers remain | No product feature depends on it |
| OQ-6 Section header | Use "ANALYTICS" | Most precise; avoids "Reporting" implying scheduled reports |
