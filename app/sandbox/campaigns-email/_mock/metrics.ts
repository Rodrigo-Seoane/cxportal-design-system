export interface CampaignMetrics {
  campaignId:       string
  sent:             number
  delivered:        number
  opens:            number
  uniqueOpens:      number
  clicks:           number
  uniqueClicks:     number
  bounces:          number
  hardBounces:      number
  softBounces:      number
  unsubscribes:     number
  complaints:       number
  deliveryRate:     number  // 0–1
  openRate:         number  // 0–1
  clickRate:        number  // 0–1
  bounceRate:       number  // 0–1
  unsubscribeRate:  number  // 0–1
  /** Hourly open counts over first 24h post-send (24 data points) */
  opensByHour:      number[]
}

function pct(n: number, total: number) { return total > 0 ? n / total : 0 }

// Deterministic hourly open curves — bell-shaped, peaking at hour 2–3 after send
function openCurve(total: number): number[] {
  const weights = [0.04, 0.14, 0.20, 0.16, 0.10, 0.07, 0.05, 0.04, 0.03, 0.03,
                   0.02, 0.02, 0.02, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01,
                   0.00, 0.00, 0.00, 0.00]
  return weights.map(w => Math.round(total * w))
}

const m1: CampaignMetrics = (() => {
  const sent = 50_900_000, delivered = 49_750_000, opens = 30_350_000
  const clicks = 3_820_000, bounces = 1_150_000, unsubs = 142_000
  return {
    campaignId: 'camp-1', sent, delivered, opens, uniqueOpens: 28_900_000,
    clicks, uniqueClicks: 3_200_000, bounces, hardBounces: 410_000, softBounces: 740_000,
    unsubscribes: unsubs, complaints: 1_800,
    deliveryRate: pct(delivered, sent), openRate: pct(opens, delivered),
    clickRate: pct(clicks, delivered), bounceRate: pct(bounces, sent),
    unsubscribeRate: pct(unsubs, delivered), opensByHour: openCurve(opens),
  }
})()

const m2: CampaignMetrics = (() => {
  const sent = 62_400_000, delivered = 61_100_000, opens = 33_600_000
  const clicks = 4_100_000, bounces = 1_300_000, unsubs = 95_000
  return {
    campaignId: 'camp-2', sent, delivered, opens, uniqueOpens: 31_200_000,
    clicks, uniqueClicks: 3_600_000, bounces, hardBounces: 520_000, softBounces: 780_000,
    unsubscribes: unsubs, complaints: 2_200,
    deliveryRate: pct(delivered, sent), openRate: pct(opens, delivered),
    clickRate: pct(clicks, delivered), bounceRate: pct(bounces, sent),
    unsubscribeRate: pct(unsubs, delivered), opensByHour: openCurve(opens),
  }
})()

// camp-3 is currently sending — partial metrics
const m3: CampaignMetrics = (() => {
  const sent = 2_800_000, delivered = 2_740_000, opens = 1_540_000
  const clicks = 198_000, bounces = 60_000, unsubs = 4_200
  return {
    campaignId: 'camp-3', sent, delivered, opens, uniqueOpens: 1_480_000,
    clicks, uniqueClicks: 182_000, bounces, hardBounces: 22_000, softBounces: 38_000,
    unsubscribes: unsubs, complaints: 310,
    deliveryRate: pct(delivered, sent), openRate: pct(opens, delivered),
    clickRate: pct(clicks, delivered), bounceRate: pct(bounces, sent),
    unsubscribeRate: pct(unsubs, delivered), opensByHour: openCurve(opens),
  }
})()

export const METRICS: CampaignMetrics[] = [m1, m2, m3]

export const METRICS_BY_CAMPAIGN: Record<string, CampaignMetrics> = Object.fromEntries(
  METRICS.map(m => [m.campaignId, m])
)

// Aggregate summary across all fully-sent campaigns
export const AGGREGATE_METRICS = {
  totalCampaigns:    8,
  totalSent:         225_000_000,
  avgOpenRate:       0.594,
  avgClickRate:      0.073,
  avgBounceRate:     0.022,
  avgUnsubscribeRate:0.003,
}
