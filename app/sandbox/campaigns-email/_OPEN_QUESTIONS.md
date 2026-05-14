# Open Questions — Email Campaigns Prototype

Unresolved design, product, and technical questions to address before engineering handoff.

**Last reconciled with code:** 2026-05-14

---

## Resolved (pending product ratification)

The following questions were open in earlier iterations. Decisions were made as part of the Concept ↔ Code Alignment Plan (`docs/email_campaigns/campaigns-email-alignment-plan.md`). Listed here as a record; the code reflects these choices.

**R1 — Topics as primary parent of Campaigns**
Decided. Topics are the structural and subscription unit. The data model treats Topic as Campaign's parent (`campaign.topicId`). UI reflects this with Topic-first navigation and Topic-context campaign creation. The standalone `/campaigns/new` flow remains as an advanced path but is no longer the primary entrypoint.

**R2 — Audience-unit vocabulary**
Decided. "Recipient Lists" replaces the previous "Segments" naming throughout. The Segment-as-attribute-filter concept is dropped — it is incompatible with the Epic's single-column CSV data model and was not in scope.

**R3 — Role taxonomy**
Decided. Three roles: **Admin / Supervisor / Agent** (in descending permission order). The previous `org-admin / dept-editor / dept-read-only` labels are replaced. Agent maps to the prior Dept Editor (full Campaign CRUD, read-only on Templates). The Dept Read-Only / Viewer tier is deferred — see Q24.

**R4 — Templates scope and authorship**
Decided. Templates are Group-scoped reusable assets, not per-Campaign content. Only Supervisor and Admin can create/edit/publish Templates. Agent can select and view but not author. Topics declare a default Template.

**R5 — Topic defaults**
Decided. Topic carries `defaultTemplateId` and `defaultSenderId`. When a campaign is created in the context of a Topic, these pre-fill the stepper. Schedule cadence and compliance flags are deferred to a later iteration.

**R6 — Org-hierarchy naming**
Decided. "Components" replaces "Preferences" / "Groups" in the user-facing nav and all UI copy. Matches the SOW's vocabulary for the ~12 SSA divisions. The route is `/components/`, the tree label is "Components."

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
→ Resolved. See R1 and R2 in the Resolved section. Topics are first-class objects; Recipient Lists are the audience unit. The `TopicModelContext` toggle in `layout.tsx` is a prototype artifact and can be removed.

**Q5 — Can a campaign target both a topic AND direct lists simultaneously?**
The current stepper enforces a single selection mode (topic OR lists). Is this intentional or a simplification?

**Q6 — How are subscriber counts kept in sync?**
`topic.subscriberCount` and `list.recipientCount` are static in the mock data. What's the real-time data source — Connect, an SSA identity system, or something else?

**Q21 — Subscription state: derived or explicit?**
The data model implies subscribers subscribe to Topics, but Recipient Lists are single-column CSVs with no per-Topic state. Two interpretations: **derived** (subscribed = on a List associated with the Topic, minus unsubscribers — matches GovDelivery semantics) or **explicit** (separate `(subscriber, topic, state)` table). The prototype currently shows derived counts with a "derived" callout in the Topic detail view. Backend source of truth is pending Mebin's data-model finalization.

**Q22 — Cross-component subscriber experience**
Topics are scoped per Component. A subscriber interested in updates from both Retirement Services and Disability Services must subscribe to topics in each Component separately. If SSA's subscriber-facing preference portal should unify these across Components, that is net-new scope not covered by the current Epic. Needs alignment with J.C. Paz before the preference-portal surface is designed.

---

## Sender Verification

**Q7 — What is the exact verification mechanism?**
The prototype shows a pending → verified state transition but doesn't model the verification flow. Is it an email link click, a DNS TXT record, or a manual admin approval?

**Q8 — Who receives the verification email — the sender address itself or the requestor?**
Current mock shows the sender's own address. If the address is a shared inbox (e.g., `noreply@ssa.gov`), who clicks the link?

**Q9 — What happens to in-flight campaigns when a sender expires?**
If a sender's verification expires mid-campaign, does the send halt? The prototype shows a dashboard warning for expired senders but does not model this state change.

**Q23 — Per-Topic default Sender override semantics**
Topics carry a `defaultSenderId`. When that Sender's verification expires or is revoked, what happens to in-flight Campaigns already referencing that Topic? Options: block sends until a new default is set; continue with the last-known-good Sender; require manual re-confirmation per Campaign. Currently not modeled in the prototype. Needs a decision before the Sender-Topic binding ships.

---

## RBAC & Permissions

**Q10 — Is the role model org-admin / dept-editor / dept-readonly final?**
→ Resolved. See R3 in the Resolved section. The prototype now uses Admin / Supervisor / Agent. The Read-Only tier is deferred — see Q24.

**Q11 — Who can approve or publish a campaign?**
No approval workflow exists in the prototype. Is there a review/approve step before a campaign can be sent, and if so, who has that permission?

**Q12 — Are Components (SSA component hierarchy) managed here or in a separate admin surface?**
The Components page is read-only in this prototype. If new components or campaign groups are added, where does that happen?

**Q24 — Read-only / Viewer tier deferred**
The SOW references three role tiers including a Read-Only / Dept Read-Only role. The prototype currently models three roles (Admin / Supervisor / Agent) and defers the Viewer tier until a concrete workflow needs it. **Confirm with SSA stakeholders that no audit / compliance / observer use case requires a Viewer role in MVP.** If a Viewer role is needed, its permissions differ from Agent in one key way: Agent has full Campaign CRUD; Viewer would be read-only on all surfaces.

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
CSV export currently includes full email addresses. For compliance audits, should PII be masked or restricted to Admin only?

---

## Templates

**Q19 — What is the diff-view implementation?**
The template editor has a "View diff" button that opens a stub modal. Is this a word-diff, line-diff, or visual HTML comparison?

**Q20 — Are template versions immutable once published?**
The current model allows editing and publishing new versions but does not lock previous versions. Should published versions be read-only to ensure audit trail integrity?
