'use client'

import dynamic from 'next/dynamic'

const FeedbackWidget = dynamic(
  () => import('@thedesignproject/crrt').then(m => m.FeedbackWidget),
  { ssr: false }
)

export function CRRTWidget() {
  return <FeedbackWidget projectId="project-cxportal-design-system" />
}
