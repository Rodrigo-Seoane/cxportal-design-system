/**
 * Focus order / shortcuts / live regions / contrast / click targets / reduced-motion:
 * identical to MetricDetailPage.tsx (../metric-detail/MetricDetailPage.tsx) — this file
 * only supplies the SLA-specific title copy and clock parameter. See that file for the
 * full a11y notes; TAT and SLA must stay behaviorally identical apart from the clock.
 */
import { MetricDetailPage } from '../metric-detail/MetricDetailPage'

export default function InternalSlaPage() {
  return (
    <MetricDetailPage
      clock="sla"
      title="Internal SLA"
      subtitle="Internal Service Level Agreement — operational control view"
    />
  )
}

export const dynamic = 'force-dynamic'
