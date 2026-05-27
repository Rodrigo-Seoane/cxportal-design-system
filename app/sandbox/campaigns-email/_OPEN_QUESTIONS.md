# Open Questions — Email Campaigns Prototype

Unresolved design, product, and technical questions to address before engineering handoff.

---

## Campaign Creation

**Q1 — Can drafts be edited after creation?**
The current "Edit draft" button links back to the `campaigns/new` stepper, which always starts fresh. Should editing a draft pre-populate the stepper with saved values? If yes, the store and stepper need to support hydration from an existing campaign object.

**Q2 — Can a campaign be duplicated?**
No duplicate action exists today. This is a common workflow for repeated sends (e.g., monthly COLA notification). Should this be on the campaigns list or the detail page?

**Q3 — What triggers the transition from `draft` → `sending` → `sent`?**
Status transitions are not modeled in the prototype. Is this driven by a scheduled job, a manual "Send now" confirmation, or an external integration event?

---

## Audience & Targeting

**Q4 — Topic model vs. labeled-lists: what's the migration path?**
The layout has a `TopicModelContext` toggle to switch between "First-class topics" and "Labeled lists." Is this a per-org configuration, a phased rollout, or a permanent design choice? The toggle currently hides the Topics nav item but does not change any data model.

**Q5 — Can a campaign target both a topic AND direct lists simultaneously?**
The current stepper enforces a single selection mode (topic OR lists). Is this intentional or a simplification?

**Q6 — How are subscriber counts kept in sync?**
`topic.subscriberCount` and `list.recipientCount` are static in the mock data. What's the real-time data source — Connect, an SSA identity system, or something else?

---

## Sender Verification

**Q7 — What is the exact verification mechanism?**
The prototype shows a pending → verified state transition but doesn't model the verification flow. Is it an email link click, a DNS TXT record, or a manual admin approval?

**Q8 — Who receives the verification email — the sender address itself or the requestor?**
Current mock shows the sender's own address. If the address is a shared inbox (e.g., `noreply@ssa.gov`), who clicks the link?

**Q9 — What happens to in-flight campaigns when a sender expires?**
If a sender's verification expires mid-campaign, does the send halt? The prototype shows a dashboard warning for expired senders but does not model this state change.

---

## RBAC & Permissions

**Q10 — Is the role model org-admin / dept-editor / dept-readonly final?**
The prototype uses three roles defined in `RoleContext`. The real model may need finer-grained scoping (e.g., an editor scoped to a specific component, not all departments).

**Q11 — Who can approve or publish a campaign?**
No approval workflow exists in the prototype. Is there a review/approve step before a campaign can be sent, and if so, who has that permission?

**Q12 — Are Groups (SSA component hierarchy) managed here or in a separate admin surface?**
The Groups page is read-only in this prototype. If new groups or components are added, where does that happen?

---

## Metrics & Analytics

**Q13 — How frequently do metrics refresh?**
The prototype shows static metrics. Is the real system near-real-time (streaming), batched (hourly/daily), or on-demand (user triggers a refresh)?

**Q14 — What is the data retention policy for metrics?**
After how long are detailed per-recipient events (opens, clicks) aggregated or purged? This affects what drill-down is possible.

**Q15 — Should the Metrics page support filtering by date range or component?**
Currently metrics show all-time aggregate data. Users have asked for date-range filtering (similar to the Unsubscribes page).

---

## Unsubscribes & Compliance

**Q16 — Can a hard-suppressed subscriber be manually resubscribed?**
The prototype shows "Hard suppressed" with no re-subscribe action. Is there an admin override? What's the compliance implication?

**Q17 — What is the grace period duration, and is it configurable per component?**
The mock data hardcodes a grace period end date. Is this 30 days, 90 days, or configurable?

**Q18 — Does the Unsubscribes page need to support bulk export with PII masking?**
CSV export currently includes full email addresses. For compliance audits, should PII be masked or restricted to org-admin only?

---

## Templates

**Q19 — What is the diff-view implementation?**
The template editor has a "View diff" button that opens a stub modal. Is this a word-diff, line-diff, or visual HTML comparison?

**Q20 — Are template versions immutable once published?**
The current model allows editing and publishing new versions but does not lock previous versions. Should published versions be read-only to ensure audit trail integrity?
