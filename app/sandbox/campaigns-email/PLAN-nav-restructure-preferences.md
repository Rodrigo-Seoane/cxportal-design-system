# Implementation Plan — Nav Restructure & Preferences Page

**Based on:** `SPEC-nav-restructure-preferences.md`
**Date:** 2026-05-12

---

## Architectural Warnings — Read Before Starting

1. **Do not break the `topics/[id]/` route.** Only `topics/page.tsx` is deleted. The `topics/[id]/` directory and its `page.tsx` stay in place permanently.

2. **`onSelectGroup` must flow from `page.tsx` → `DetailPane` → `ComponentDetail`.** The tree selection state lives in `page.tsx`. When a user clicks a group row inside `ComponentDetail`, it needs to call `setSelection` in `page.tsx`. Wire this as a prop callback — do not lift state elsewhere.

3. **`SlidersIcon` is confirmed available** in `@phosphor-icons/react`. Use it for the Preferences nav item.

4. **Mock data field names don't change.** `listIds`, `groupId`, `topicIds` etc. in mock files stay as-is. Only user-facing string labels change. Do not rename fields.

5. **`TopicModelContext` is consumed in three places today:** `layout.tsx` (as provider), `lists/page.tsx` (as consumer, being deleted), and `topics/page.tsx` (as consumer, being deleted). After step 3, the context has zero consumers — delete it in step 7.

6. **Line count discipline.** `preferences/DetailPane.tsx` will be the riskiest file for size. The `GroupDetail` component adds a full Topics section. Estimate ~230 lines for `DetailPane.tsx`. Keep it under 300 by keeping helper functions (`fmtCount`, `fmtDate`, `openRateColor`) as module-level functions, not inline.

7. **The `preferences/page.tsx` `onSelectGroup` callback** must also expand the parent component node in the tree. When a group is selected from the component detail pane, call both `setSelection` and ensure `setExpanded` includes the group's `componentId`. Get the `componentId` from `CAMPAIGN_GROUPS.find(g => g.id === groupId)?.componentId`.

---

## Step-by-Step Implementation Sequence

---

### Step 1 — Create `preferences/page.tsx`

**Action:** Create new file  
**Path:** `app/sandbox/campaigns-email/preferences/page.tsx`

Start from `groups/page.tsx` as the base. Apply the following changes:

**Remove entirely:**
- `LABEL_SETS` array and its type
- `labelSetId` state (`useState<string>('ssa')`)
- The `labels` variable derived from `LABEL_SETS`
- The entire "Label-set toggle" `<div>` block (the section from `/* Label-set toggle */` down to its closing `</div>`)

**Add import:**
```typescript
import { TOPICS } from '../_mock/topics'
```

**Fix the fixed label object.** Replace the dynamic `labels` variable passed to `DetailPane` with a hard-coded object:
```typescript
const FIXED_LABELS = { level1: 'Organization', level2: 'Component', level3: 'Campaign Group' } as const
```
Pass `labels={FIXED_LABELS}` to `<DetailPane>`.

**Update root node label.** Change `SSA · {labels.level1}` → `SSA · Organization`.

**Add `topicCount` to `TreeNode`.** In the `TreeNode` props interface, add `topicCount?: number`. In the JSX, after the dot indicator for depth-2 nodes and before/after the count badge, render the topic count badge:
```tsx
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

**Compute topic counts.** In the main `GroupsPage` function (rename export to `PreferencesPage`), before the return, compute a lookup map:
```typescript
const topicCountByGroup = useMemo(() =>
  Object.fromEntries(
    CAMPAIGN_GROUPS.map(g => [g.id, TOPICS.filter(t => t.groupId === g.id).length])
  ),
  []
)
```
Import `useMemo` from React.

**Pass `topicCount` when rendering group `TreeNode`s (depth 2):**
```typescript
topicCount={topicCountByGroup[group.id]}
```

**Add `onSelectGroup` handler.** Define in the page component:
```typescript
function handleSelectGroup(groupId: string) {
  const componentId = CAMPAIGN_GROUPS.find(g => g.id === groupId)?.componentId
  if (componentId) setExpanded(prev => new Set([...prev, componentId]))
  setSelection({ type: 'group', id: groupId })
}
```
Pass as `onSelectGroup={handleSelectGroup}` to `<DetailPane>`.

**Rename export:** `GroupsPage` → `PreferencesPage`.

**Estimated file size:** ~190 lines.

---

### Step 2 — Create `preferences/DetailPane.tsx`

**Action:** Create new file  
**Path:** `app/sandbox/campaigns-email/preferences/DetailPane.tsx`

Start from `groups/DetailPane.tsx`. Apply the following changes:

**Add imports:**
```typescript
import Link from 'next/link'
import { TOPICS } from '../_mock/topics'
import { TEMPLATES } from '../_mock/templates'
```

**Add module-level helpers** (above all component functions):
```typescript
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

**Update `LabelSet` type** — it's fine to keep as-is since we pass fixed values. No removal needed.

**Update `DetailPane` exported function signature** — add `onSelectGroup` prop:
```typescript
export function DetailPane({
  selection,
  labels,
  onSelectGroup,
}: {
  selection:     Selection
  labels:        LabelSet
  onSelectGroup: (groupId: string) => void
})
```
Pass `onSelectGroup` through to `ComponentDetail`.

**Empty state (`Selection = null`)** — replace the existing empty state JSX with:
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

**`ComponentDetail` changes:**
- Add prop: `onSelectGroup: (groupId: string) => void`
- Badge text: change dynamic `{labels.level2}` → hard-code `Component`
- Section heading: change dynamic `{labels.level3}s ({groups.length})` → `Campaign Groups ({groups.length})`
- Make each group row clickable:
  - Add `role="button"` and `tabIndex={0}` to the row `<div>`
  - Add `onClick={() => onSelectGroup(g.id)}`
  - Add `onKeyDown={e => { if (e.key === 'Enter') onSelectGroup(g.id) }}`
  - Add `cursor: 'pointer'` to row styles
  - Add `onMouseEnter`/`onMouseLeave` hover state

**`GroupDetail` changes:**
- Badge text: hard-code `Campaign Group` (remove dynamic label)
- Add Communication Topics section (between Membership and Recent Campaigns):

```tsx
const groupTopics = TOPICS.filter(t => t.groupId === groupId)

// In JSX:
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>
                  {fmtCount(topic.subscriberCount)}
                </strong>{' '}subscribers
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: openRateColor(topic.openRate) }}>
                {(topic.openRate * 100).toFixed(1)}% open
              </span>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                Last sent {fmtDate(topic.lastSentAt)}
              </span>
            </div>
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

**Estimated file size:** ~230 lines. If it exceeds 280, extract `TopicsSection` as a named component in the same file.

---

### Step 3 — Create `segments/` route

**Action:** Create 3 files

**3a. `app/sandbox/campaigns-email/segments/page.tsx`**  
Copy `lists/page.tsx` verbatim then apply:
- Remove `import { useTopicModel } from '../_context/TopicModelContext'`
- Remove `const { model } = useTopicModel()`
- Change page title from `Contact Lists` → `Segments`
- Change subtitle: `"Segmented recipient groups scoped to a campaign group. Each segment contains email addresses, phone numbers, or both."`
- In the Topics table cell, replace the `model === 'labeled-lists'` conditional branch. Keep only the `first-class` branch: show `{topicCount} topic{topicCount > 1 ? 's' : ''}` as a plain string. Remove the inline tag-rendering branch entirely.
- Update `href` in `<Link>` rows: `/sandbox/campaigns-email/lists/${list.id}` → `/sandbox/campaigns-email/segments/${list.id}`

**3b. `app/sandbox/campaigns-email/segments/[id]/page.tsx`**  
Copy `lists/[id]/page.tsx` verbatim. Check for any internal links to `/lists/` and update to `/segments/`.

**3c. `app/sandbox/campaigns-email/segments/_components/UploadWizard.tsx`**  
Copy `lists/_components/UploadWizard.tsx` verbatim. No content changes needed.

---

### Step 4 — Create `unsubscribers/page.tsx`

**Action:** Create new file  
**Path:** `app/sandbox/campaigns-email/unsubscribers/page.tsx`

Copy `unsubscribes/page.tsx` verbatim then apply:
- Change `<h2>` heading text: `Unsubscribes` → `Unsubscribers`
- Update `downloadCsv` function's `a.download` attribute: `'unsubscribes.csv'` → `'unsubscribers.csv'`
- Rename exported function: `UnsubscribesPage` → `UnsubscribersPage`

---

### Step 5 — Update `layout.tsx`

**Action:** Modify existing file  
**Path:** `app/sandbox/campaigns-email/layout.tsx`

**5a. Update imports.**

Remove:
```typescript
import { TopicModelProvider, useTopicModel } from './_context/TopicModelContext'
```

Add `SlidersIcon` to the existing Phosphor import line:
```typescript
import {
  EnvelopeIcon,
  FileTextIcon,
  UsersThreeIcon,
  ShieldCheckIcon,
  SlidersIcon,
  ChartBarIcon,
  UserMinusIcon,
  FlaskIcon,
} from '@phosphor-icons/react'
```

Remove unused icons from import: `TagIcon`, `FolderOpenIcon` (no longer in nav).

**5b. Replace `SUB_NAV` with `NAV_SECTIONS`.**

Delete the entire `SUB_NAV` array. Add:

```typescript
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
      { label: 'Campaigns',       href: '/sandbox/campaigns-email/campaigns',     Icon: EnvelopeIcon    },
      { label: 'Email Templates', href: '/sandbox/campaigns-email/templates',     Icon: FileTextIcon    },
      { label: 'Senders',         href: '/sandbox/campaigns-email/senders',       Icon: ShieldCheckIcon },
    ],
  },
  {
    heading: 'AUDIENCE',
    items: [
      { label: 'Segments',        href: '/sandbox/campaigns-email/segments',      Icon: UsersThreeIcon  },
      { label: 'Preferences',     href: '/sandbox/campaigns-email/preferences',   Icon: SlidersIcon     },
      { label: 'Unsubscribers',   href: '/sandbox/campaigns-email/unsubscribers', Icon: UserMinusIcon   },
    ],
  },
  {
    heading: 'ANALYTICS',
    items: [
      { label: 'Metrics',         href: '/sandbox/campaigns-email/metrics',       Icon: ChartBarIcon    },
    ],
  },
]
```

**5c. Rewrite `SubNav` function.**

Delete the entire existing `SubNav` function. Replace with:

```typescript
function SubNav() {
  const pathname          = usePathname()
  const { role, setRole } = useRole()

  function isActive(href: string): boolean {
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

      {/* RBAC role switcher — unchanged */}
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

**5d. Remove `TopicModelProvider` from `CampaignsEmailLayout`.**

In `CampaignsEmailLayout`, remove the `<TopicModelProvider>` wrapper. Keep only `<RoleProvider>`.

---

### Step 6 — Update `campaigns/page.tsx`

**Action:** Modify existing file  
**Path:** `app/sandbox/campaigns-email/campaigns/page.tsx`

One change only — in the Audience column cell where `c.listIds.length` is rendered:

```typescript
// Before:
`${c.listIds.length} list${c.listIds.length > 1 ? 's' : ''}`

// After:
`${c.listIds.length} segment${c.listIds.length > 1 ? 's' : ''}`
```

No route changes needed — this page does not link to `lists/`.

---

### Step 7 — Update `campaigns/new/page.tsx`

**Action:** Modify existing file  
**Path:** `app/sandbox/campaigns-email/campaigns/new/page.tsx`

Three string changes:

1. `StepAudience` tab label: `'Direct lists'` → `'Direct segments'`
2. `STEP_META[2].description`: `'Topic or lists'` → `'Topic or segments'`
3. `getTag` function, `i === 2` branch: `list(s)` → `segment(s)`
   ```typescript
   // Before:
   `${...listIds.length} list(s)`
   // After:
   `${...listIds.length} segment(s)`
   ```

No other changes — the file imports `LISTS` from `_mock/lists` which stays in place.

---

### Step 8 — Delete old files

**Action:** Delete directories and files  
**Execute after visually verifying all new routes load correctly in the browser.**

Delete in this order:

```bash
# Delete groups (replaced by preferences)
rm -rf app/sandbox/campaigns-email/groups/

# Delete topics list page only (keep [id] route)
rm app/sandbox/campaigns-email/topics/page.tsx

# Delete lists (replaced by segments)
rm -rf app/sandbox/campaigns-email/lists/

# Delete unsubscribes (replaced by unsubscribers)
rm -rf app/sandbox/campaigns-email/unsubscribes/
```

---

### Step 9 — Delete `TopicModelContext`

**Action:** Delete file  
**Path:** `app/sandbox/campaigns-email/_context/TopicModelContext.tsx`

First, confirm zero consumers remain:
```bash
grep -r "TopicModelContext\|useTopicModel\|TopicModelProvider\|TopicModel" \
  app/sandbox/campaigns-email \
  --include="*.tsx" --include="*.ts"
```

If the grep returns empty output, delete the file. If any hits remain, fix them before deleting.

---

## File Size Estimates

| File | Estimated Lines | Notes |
|---|---|---|
| `preferences/page.tsx` | ~185 | TreeNode + tree render + useMemo |
| `preferences/DetailPane.tsx` | ~230 | Topics section adds ~60 lines vs original |
| `segments/page.tsx` | ~195 | Simpler than original (model branch removed) |
| `segments/[id]/page.tsx` | Copy | No line count change |
| `segments/_components/UploadWizard.tsx` | Copy | No line count change |
| `unsubscribers/page.tsx` | ~130 | Identical to original |
| `layout.tsx` | ~140 | Smaller — removed TopicModel, label toggle |

All files are under the 300-line limit.

---

## Verification Checklist

### Navigation
- [ ] Sidebar shows 3 section headers: CAMPAIGNS, AUDIENCE, ANALYTICS
- [ ] Section headers have no hover state and are not links
- [ ] All 7 items link to correct routes
- [ ] Correct item highlights when at `/campaigns`, `/templates`, `/senders`, `/segments`, `/preferences`, `/unsubscribers`, `/metrics`
- [ ] RBAC role switcher renders at bottom and functions

### Preferences — tree
- [ ] Page loads with purpose statement (no selection)
- [ ] No "Hierarchy labels" toggle visible anywhere
- [ ] Root node shows "SSA · Organization"
- [ ] Components expand/collapse
- [ ] Campaign Group nodes show `N topics` badge when group has ≥ 1 topic
- [ ] Campaign Group nodes with 0 topics show no badge

### Preferences — detail pane
- [ ] Clicking Component → Component detail shows, group list renders
- [ ] Clicking group row in Component detail → selects that group in tree + updates pane
- [ ] Clicking Campaign Group → Group detail shows
- [ ] Membership chips render (Members, Lists, Topics, Templates, Campaigns)
- [ ] Communication Topics section renders with correct count heading
- [ ] Topic name links to `/sandbox/campaigns-email/topics/[id]`
- [ ] Subscriber count formatted (51M, 4.2K)
- [ ] Open rate is green ≥ 60%, neutral 40–59%, red < 40%
- [ ] Template link renders only when `defaultTemplateId` is set
- [ ] Groups with 0 topics show italic placeholder message
- [ ] Recent Campaigns section still renders

### Segments
- [ ] `/sandbox/campaigns-email/segments` loads, title shows "Segments"
- [ ] Row links go to `/segments/[id]`
- [ ] Topics column shows plain count (no tag-render branch)
- [ ] Upload wizard still opens

### Unsubscribers
- [ ] `/sandbox/campaigns-email/unsubscribers` loads, heading shows "Unsubscribers"
- [ ] CSV download filename is `unsubscribers.csv`

### Topics detail preserved
- [ ] `/sandbox/campaigns-email/topics/[any-valid-id]` loads without error

### Deleted routes confirm 404
- [ ] `/sandbox/campaigns-email/groups` → 404
- [ ] `/sandbox/campaigns-email/topics` → 404
- [ ] `/sandbox/campaigns-email/lists` → 404
- [ ] `/sandbox/campaigns-email/unsubscribes` → 404

### Campaign stepper
- [ ] Audience step tab shows "Direct segments"
- [ ] Step description shows "Topic or segments"
- [ ] Stepper tag shows "N segment(s)" after completing audience step
