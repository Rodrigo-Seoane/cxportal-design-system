export interface Account {
  id:               string
  name:             string
  campaignGroupIds: string[]
}

export const ACCOUNTS: Account[] = [
  {
    id:   'ssa-rsc',
    name: 'SSA — Retirement Services',
    campaignGroupIds: [
      'rsc-g1', 'rsc-g2', 'rsc-g3',
      'mcc-g1', 'mcc-g2',
      'ohr-g1',
      'obfm-g1', 'obfm-g2',
      'oaro-g1',
    ],
  },
  {
    id:   'ssa-foc',
    name: 'SSA — Field Operations',
    campaignGroupIds: [
      'dsc-g1', 'dsc-g2', 'dsc-g3', 'dsc-g4',
      'foc-g1', 'foc-g2', 'foc-g3',
      'hoc-g1', 'hoc-g2',
      'oc-g1',  'oc-g2',
      'oit-g1',
      'oao-g1', 'oao-g2',
      'oig-g1',
    ],
  },
]
