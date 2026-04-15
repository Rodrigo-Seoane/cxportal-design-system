export type ExperimentStatus = 'Draft' | 'In Review' | 'Validated'

export type Experiment = {
  slug:        string
  title:       string
  description: string
  status:      ExperimentStatus
  author:      string
  created:     string   // ISO date string, e.g. "2026-04-10"
  href:        string   // resolved page path
}

const EXPERIMENTS: Experiment[] = [
  {
    slug:        'login-report',
    title:       'Login Report',
    description: 'Generate and download login activity reports for a selected date range. Tests the report configuration flow, progress feedback, and success/error states.',
    status:      'In Review',
    author:      'Rodrigo S.',
    created:     '2026-04-10',
    href:        '/sandbox/login-report',
  },
  {
    slug:        'collapsible-filter',
    title:       'Collapsible Filter',
    description: 'Article table with an inline collapsible filter panel. Supports KB, folder, and tag filters with active-filter chips and a pagination bar.',
    status:      'In Review',
    author:      'Rodrigo S.',
    created:     '2026-04-12',
    href:        '/sandbox/collapsible-filter',
  },
]

export function getExperiments(): Experiment[] {
  return EXPERIMENTS
}

export function getExperiment(slug: string): Experiment | undefined {
  return EXPERIMENTS.find(e => e.slug === slug)
}
