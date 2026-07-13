import type { ConsentSource } from '../lib/types'

// The consented alternate-data sources, pulled through India-Stack rails.
export const CONSENT_SOURCES: ConsentSource[] = [
  {
    id: 'aa',
    name: 'Bank Statements',
    short: 'Account Aggregator',
    provider: 'via Account Aggregator (DEPA)',
    icon: 'Landmark',
    coverageMonths: 12,
    lastSyncDays: 1,
    connected: false,
    dim: 'cashflow',
  },
  {
    id: 'gst',
    name: 'GST Returns',
    short: 'GSTN',
    provider: 'GSTR-1 / GSTR-3B · GSTN',
    icon: 'ReceiptText',
    coverageMonths: 12,
    lastSyncDays: 2,
    connected: false,
    dim: 'momentum',
  },
  {
    id: 'upi',
    name: 'UPI Transactions',
    short: 'UPI',
    provider: 'via PSP / merchant feed',
    icon: 'Smartphone',
    coverageMonths: 12,
    lastSyncDays: 1,
    connected: false,
    dim: 'digital',
  },
  {
    id: 'epfo',
    name: 'EPFO Records',
    short: 'EPFO',
    provider: 'Electronic Challan (ECR) · EPFO',
    icon: 'Users',
    coverageMonths: 12,
    lastSyncDays: 4,
    connected: false,
    dim: 'workforce',
  },
  {
    id: 'itr',
    name: 'Income Tax Returns',
    short: 'ITR / TDS',
    provider: 'Income Tax Dept.',
    icon: 'FileCheck2',
    coverageMonths: 24,
    lastSyncDays: 6,
    connected: false,
    dim: 'compliance',
  },
  {
    id: 'udyam',
    name: 'Udyam Registration',
    short: 'Udyam',
    provider: 'Udyam Registry · MoMSME',
    icon: 'BadgeCheck',
    coverageMonths: 0,
    lastSyncDays: 3,
    connected: false,
    dim: 'compliance',
  },
]

export interface ConsentTerms {
  purpose: string
  fiTypes: string[]
  duration: string
  frequency: string
  dataLife: string
  consentId: string
}

export const CONSENT_TERMS: ConsentTerms = {
  purpose: 'Credit assessment for a working-capital facility',
  fiTypes: ['Deposit', 'Term Deposit', 'GST returns', 'Recurring Deposit'],
  duration: '12 months (revocable anytime)',
  frequency: 'Periodic · up to once daily',
  dataLife: 'Purged 24 hours after decision',
  consentId: 'CONSENT-AA-7F3C9A21',
}
