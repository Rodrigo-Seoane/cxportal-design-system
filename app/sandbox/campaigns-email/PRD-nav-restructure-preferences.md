# PRD — Email Campaigns: Navigation Restructure & Preferences Page Redesign

**Module:** `app/sandbox/campaigns-email`
**Date:** 2026-05-12
**Status:** Ready for Spec

---

## 1. Executive Summary

The Email Campaigns module launched with a flat, 8-item sidebar navigation that does not reflect how users think about email campaign management. Every concept — whether operationally central (Campaigns) or supporting infrastructure (Senders) or audience management (Lists, Groups, Topics, Unsubscribes) — lives at the same visual level. The result is cognitive overload: users cannot predict where something lives, and the nav gives no signal about the relationships between items.

Concurrently, the Groups page — the only page with a bespoke tree-navigation pattern — is failing. It exposes an internal prototype artifact (the "Hierarchy labels" toggle) as a UI control, conflates org-hierarchy browsing with group/component details, and leaves users unable to understand what they're looking at or why.

This PRD covers two tightly coupled changes:
1. **Navigation restructure** — collapse the flat 8-item list into a grouped, two-level sidebar with section headers.
2. **Preferences page** — replace the separate Groups and Topics pages with a single unified page that makes purpose immediately legible and surfaces topic subscription streams in context of their owning groups.

---

## 2. Research Metadata

| Item | Detail |
|---|---|
| Module path | `app/sandbox/campaigns-email/` |
| Layout file | `layout.tsx` |
| Pages changed | `groups/`, `topics/`, `lists/`, `unsubscribes/` |
| Pages renamed | `lists → segments`, `unsubscribes → unsubscribers`, `groups + topics → preferences` |
| New routes | `preferences/` (replaces `groups/` and `topics/`) |
| Shared components affected | `_components/`, `_context/TopicModelContext.tsx` |
| Mock data affected | `_mock/groups.ts`, `_mock/topics.ts` |

---

## 3. Affected Codebase Files

### Critical
| File | Change |
|---|---|
| `layout.tsx` | Full rewrite of `SUB_NAV` array and `SubNav` component — add section headers, grouped structure |
| `groups/page.tsx` | Delete or repurpose → becomes `preferences/page.tsx` |
| `groups/DetailPane.tsx` | Significant redesign — add Topics section, remove label-set toggle logic |
| `topics/page.tsx` | Delete → topics surface inside Preferences page, not standalone |
| `topics/[id]/page.tsx` | Retain — individual topic detail pages remain accessible via deep link |
| `lists/page.tsx` | Rename route to `segments/`, update header copy |
| `lists/[id]/page.tsx` | Rename route to `segments/[id]/` |
| `lists/_components/UploadWizard.tsx` | Move to `segments/_components/UploadWizard.tsx` |
| `unsubscribes/page.tsx` | Rename route to `unsubscribers/` |
| `_context/TopicModelContext.tsx` | Remove from module-level providers (toggle is retired) |

### Supporting
| File | Change |
|---|---|
| `_mock/groups.ts` | No changes — data model is sound |
| `_mock/topics.ts` | No changes — data model is sound |
| `_mock/lists.ts` | No changes |
| `campaigns/page.tsx` | Internal links to `lists/` need updating to `segments/` |
| `campaigns/[id]/page.tsx` | Internal links update |
| `campaigns/new/page.tsx` | Internal links update |

### No Change Required
- `_components/ChannelBadge.tsx`
- `_components/MetricTile.tsx`
- `_components/SenderIdentityStatus.tsx`
- `_context/RoleContext.tsx`
- `_store/campaigns-store.ts`
- `metrics/page.tsx`
- `senders/page.tsx`
- `senders/AddSenderModal.tsx`
- `templates/page.tsx`
- `templates/[id]/page.tsx`

---

## 4. Problem Statement

### Navigation problems (user perspective)

The sidebar is a flat list of 8 items. There is no visual grouping, no hierarchy, and no indication of which items are primary workflows vs. supporting configuration. A first-time user looking at the nav cannot answer: "Where do I manage who receives my campaigns?" or "Is sender setup a one-time task or something I do per campaign?" The cognitive model being imposed on users is "eight equal siblings," which does not match how the work is actually structured.

Additionally, the "Topics" nav item is conditionally hidden based on an internal prototype toggle (`TopicModelContext`). This means the nav itself changes state based on a prototype artifact, creating a confusing and unreliable navigation experience.

### Groups page problems (product owner's exact words)

> "I can't understand what I am looking at when I am at the page."

The page header says nothing about purpose. The tree shows a 3-level hierarchy (SSA · Account at root, then Components, then Campaign Groups) but the page title just says "Groups" with no explanation of what a "Group" is, why it matters for email campaigns, or what action a user takes here.

> "Why is there a difference on the hierarchy labels but I don't see this difference on the detail view."

The "Hierarchy labels" toggle was built as a prototype tool to explore whether to call these entities "Component/Group/Campaign" or "Account/Dept/Campaign." It was never meant to be a product feature. Its presence as a UI control in the left rail makes users think it controls something meaningful — but the detail pane barely changes when you switch it. The toggle creates confusion by implying a user-facing concept that doesn't exist.

**Root cause:** The Groups page serves three unrelated purposes simultaneously:
1. Browse the org hierarchy (the tree)
2. View component/group details (the detail pane)
3. Prototype a label-renaming system (the toggle)

None of these is the actual job-to-be-done for a Campaign Manager. The page has no clear user purpose.

### Why Groups + Topics belong together

Campaign Groups are the organizational containers that define audience scope. Topics are the subscription streams that belong to those groups. A Campaign Manager asking "Who will receive this communication?" needs to understand both: the group (who is in scope) and the topics available within that group (what communication streams can be targeted). Today these are two separate nav items that users must correlate manually.

---

## 5. Goals

1. Users can navigate the module in ≤ 2 clicks to any area without hunting
2. The sidebar conveys relationships: Campaigns owns Templates and Senders; Audience owns targeting and subscription management
3. The Preferences page communicates its purpose immediately — before any selection is made
4. Selecting a Campaign Group in the Preferences tree shows both group metadata AND its topics in the detail pane
5. The "Hierarchy labels" toggle is completely removed from any user-facing surface
6. The vocabulary is standardized: Component (not Account/Dept), Campaign Group (not Campaign), Topic (not labeled list)
7. Route renames do not break existing deep links to `topics/[id]` or `lists/[id]` detail pages (redirects or updated links)

---

## 6. Non-Goals

- **Data model changes** — no changes to `_mock/groups.ts` or `_mock/topics.ts`. The 3-level SSA hierarchy stays as-is.
- **Topics page CRUD** — creating/editing/deleting topics is out of scope for this sprint. The Preferences page shows existing topics in context; management UI can follow.
- **RBAC enforcement** — the role switcher in the sidebar is retained as-is for prototype purposes.
- **Campaign creation flow** — the stepper in `campaigns/new/` is not touched.
- **Metrics redesign** — Metrics stays as a standalone top-level nav item.
- **Mobile/responsive layout** — the sidebar is desktop-first.

---

## 7. User Stories

**US-1 — Campaign Manager: navigate to audience**
> As a Campaign Manager, when I open the Email Campaigns module I want to immediately understand where audience management lives, so I don't have to click through every nav item to find it.

**US-2 — Campaign Manager: understand what Preferences shows**
> As a Campaign Manager who lands on the Preferences page for the first time, I want to understand what I'm looking at without reading documentation, so I can start using the hierarchy tree right away.

**US-3 — Component Admin: see all topics for my group**
> As a Component Admin, when I select my Campaign Group in the Preferences tree, I want to see both the group's configuration AND all the communication topics it owns in a single view, so I don't have to switch between two pages to get a complete picture.

**US-4 — Campaign Manager: set up sender identity**
> As a Campaign Manager setting up a new campaign, when I need to configure a sender I want the Senders section to feel like part of the Campaigns workflow (not a separate admin area), so the mental model is "campaign setup → sender → templates → send."

**US-5 — Campaign Manager: find contact segments**
> As a Campaign Manager, when I need to select a recipient list I want to find it under "Audience → Segments" because that matches how I think about who receives a campaign.

**US-6 — Org Admin: review unsubscribers**
> As an Org Admin reviewing compliance, when I navigate to unsubscribers I expect to find it under Audience (not as a top-level peer of Campaigns), because unsubscribers are an audience state, not a campaign.

---

## 8. Navigation Restructure Spec

### New sidebar structure

```
[Section: CAMPAIGNS]
  Campaigns                 → /sandbox/campaigns-email/campaigns
  Email Templates           → /sandbox/campaigns-email/templates
  Senders                   → /sandbox/campaigns-email/senders

[Section: AUDIENCE]          ← non-clickable label, not a route
  Segments                  → /sandbox/campaigns-email/segments
  Preferences               → /sandbox/campaigns-email/preferences
  Unsubscribers             → /sandbox/campaigns-email/unsubscribers

[Section: ANALYTICS]
  Metrics                   → /sandbox/campaigns-email/metrics
```

### Sidebar rendering rules

- **Section headers** are non-interactive labels. They are NOT links. They do not have hover states. They should be styled as uppercase, small (10–11px), secondary text color, with appropriate top margin to separate sections visually.
- **Section headers replace the concept of "a top-level item that owns children."** There is no expand/collapse at the nav level — all items are always visible.
- The **Campaigns root item** (the module landing page at `/sandbox/campaigns-email`) is folded into the Campaigns section. The section header "CAMPAIGNS" acts as the visual anchor; the first item in the section is still a link to the campaigns list.
- **Active state** behavior is unchanged: exact match for `/campaigns`, prefix match for everything else.
- The **RBAC role switcher** (dev tool) remains at the bottom of the sidebar, below all sections.
- The **TopicModelContext** toggle is removed from the nav entirely.

### Icon assignment

| Item | Icon |
|---|---|
| Campaigns | `EnvelopeIcon` |
| Email Templates | `FileTextIcon` |
| Senders | `ShieldCheckIcon` |
| Segments | `UsersThreeIcon` |
| Preferences | `SlidersIcon` or `FadersIcon` (Phosphor) |
| Unsubscribers | `UserMinusIcon` |
| Metrics | `ChartBarIcon` |

---

## 9. Preferences Page Redesign Spec

### Route
`/sandbox/campaigns-email/preferences/` (replaces `/groups/` and `/topics/`)

### File structure
```
preferences/
  page.tsx           (replaces groups/page.tsx)
  DetailPane.tsx     (replaces groups/DetailPane.tsx — significantly updated)
```

### Page layout
Same two-column layout as current Groups page: left tree rail (280px) + right detail pane (flex: 1).

---

### 9a. Left tree rail

**What changes:**
- Remove the "Hierarchy labels" toggle block entirely
- Remove the prototype label-set switcher (`LABEL_SETS` array and its UI)
- Keep the SSA root label as: `SSA · Organization` (fixed, not switchable)
- Keep the tree node structure: Component (depth 1, folder icon) → Campaign Group (depth 2, dot indicator)
- Keep expand/collapse behavior
- Keep count badge on Component nodes (shows number of Campaign Groups it owns)

**What's new:**
- Add a topic count badge on Campaign Group nodes (depth 2) to signal that topics exist:
  - Show as a secondary badge (e.g. `3 topics`) alongside the existing count
  - Only show if the group has ≥ 1 topic

**Vocabulary to standardize (baked in, not switchable):**
| Level | Label |
|---|---|
| Root | Organization |
| Depth 1 | Component |
| Depth 2 | Campaign Group |
| Leaf objects | Topics |

---

### 9b. Default state (no selection)

When the page loads with no selection, the detail pane should show a **page purpose statement** instead of "Select a component or group to view details."

Suggested copy:
> **Organization Preferences**
> Browse your organization's component structure and manage the communication streams available within each campaign group. Select a component to see its groups, or select a campaign group to view its topics and membership.

This must be the first thing a user sees. It replaces the empty/grey placeholder state.

---

### 9c. Detail pane — Component selected

Retain current behavior with minor copy improvements:

- Header badge: `Component` (not the label-set value)
- Show short code + full name
- Show description
- Section: **Campaign Groups** (N) — list of groups with rollup counts (Members, Topics, Templates, Campaigns as icon+number row)
- Each group row is **clickable** — clicking it selects the group in the tree and updates the detail pane

---

### 9d. Detail pane — Campaign Group selected

This is the most significant change. The detail pane for a Campaign Group selection must now include a **Topics section** that was previously only available on the separate Topics page.

Layout (top to bottom):

**1. Header**
- Badge: `Campaign Group`
- Parent context: `[ComponentShortCode] · [ComponentName]`
- Group name (h3)
- Group description

**2. Membership section** (retained from current)
- Count chips: Members, Lists, Topics, Templates, Campaigns
- Use `Tag` component with `type="with-value"`

**3. Topics section** (NEW)
- Section label: `Communication Topics` (N)
- If no topics: show a muted message — "No topics configured for this group."
- If topics exist: show a list of topic cards, each containing:
  - Topic name (link to `/preferences/topics/[id]` or retain existing `/topics/[id]`)
  - Subscriber count (formatted: 51M, 4.2K, etc.)
  - Open rate (color-coded: green ≥ 60%, neutral 40–59%, red < 40%)
  - Last sent date
  - Default template name (if set), as a secondary link

**4. Recent Campaigns section** (retained from current)
- Section label: `Recent Campaigns` 
- Show up to 4 most recent campaigns for this group
- Same row style as current implementation

---

## 10. Page Renames and Route Changes

| Old Name | New Name | Old Route | New Route |
|---|---|---|---|
| Lists | Segments | `/lists` | `/segments` |
| Lists detail | Segment detail | `/lists/[id]` | `/segments/[id]` |
| Groups | Preferences | `/groups` | `/preferences` |
| Topics | (merged into Preferences) | `/topics` | `/preferences` (list view) |
| Topic detail | Topic detail | `/topics/[id]` | `/preferences/topics/[id]` OR keep `/topics/[id]` with redirect |
| Unsubscribes | Unsubscribers | `/unsubscribes` | `/unsubscribers` |

> **Note on topic detail routes:** The simplest approach is to keep `/topics/[id]` in place and only retire the `/topics` list page. This avoids breaking any external links to topic detail pages. Discuss with engineering.

---

## 11. Open Questions

**OQ-1 — Topic detail route migration**
Should `/topics/[id]` be moved to `/preferences/topics/[id]` (cleaner IA) or kept in place as `/topics/[id]` (zero redirect risk)? Decision affects how the Preferences detail pane links to topic detail.

**OQ-2 — Is "Preferences" the right name?**
The page covers both org structure (Components/Groups) and subscription streams (Topics). "Preferences" emphasizes the subscriber perspective. Alternatives: "Audience Structure," "Targeting," "Groups & Topics." Confirm with stakeholders whether the name should emphasize the manager's view (structure) or the subscriber's view (preferences).

**OQ-3 — Topic creation surface**
With the standalone Topics page retired, where does a user create a new topic? Options: (a) CTA in the Preferences detail pane when a Campaign Group is selected, (b) a modal triggered from the topic count in the tree, (c) a dedicated route under preferences/topics/new. Needs product decision before implementation.

**OQ-4 — Segments vs. Lists naming alignment**
Renaming "Lists" to "Segments" changes the vocabulary used throughout the app (campaign builder stepper, group detail rollup chips, etc.). Audit all instances of the word "list/lists" in the codebase before implementing to prevent partial renames.

**OQ-5 — TopicModelContext retirement**
The `TopicModelContext` provider is currently in `layout.tsx` and consumed by `lists/page.tsx` and `topics/page.tsx`. With Topics merged into Preferences and the toggle removed, can the context be fully deleted? Confirm no other consumer depends on it before removal.

**OQ-6 — Section header: "ANALYTICS" vs. "REPORTING"**
The Metrics section header could be labeled "ANALYTICS," "REPORTING," or "INSIGHTS." Align with product/brand vocabulary.
