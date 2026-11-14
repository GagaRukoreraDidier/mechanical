// Design-system class constants for MHSG Rwanda
// All pixel sizes are exact (e.g. text-[13px]) per design spec

export const pageWrapper =
  'min-h-screen bg-[#f5f6f8] p-4 sm:p-6 lg:p-8 [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed'

export const pageTitle = 'text-[22px] font-bold text-[#010313] sm:text-[26px]'
export const pageSubtitle = 'mt-1 text-[13px] text-[#6b7280]'

export const card = 'overflow-hidden rounded-2xl border border-[#ececf0] bg-white shadow-sm'
export const cardHeaderBar =
  'flex items-start justify-between gap-3 border-b border-[#f1f5f9] px-4 py-3'
export const cardHeaderLeft = 'flex min-w-0 items-center gap-2.5'
export const cardTitle = 'truncate text-[14px] font-semibold text-[#010313]'
export const cardSubtitle = 'truncate text-[12px] text-[#6b7280]'

export const statCard =
  'flex items-center gap-3 rounded-2xl border border-[#ececf0] bg-white p-4 shadow-sm'
export const statLabel = 'text-[12px] text-[#6b7280]'
export const statValue = 'text-[24px] font-bold leading-none text-[#010313] tabular-nums'

// Buttons
export const btnBase =
  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold shadow-sm transition-all duration-200 ease-out disabled:opacity-60 enabled:hover:-translate-y-0.5 enabled:hover:shadow-md enabled:active:translate-y-0'
export const btnPrimary =
  btnBase +
  ' border border-[#23A6BD] bg-[#23A6BD] text-[#010313] hover:border-[#1a879c] hover:bg-[#1a879c]'
export const btnOutline =
  btnBase +
  ' border border-[#23A6BD] bg-white text-[#1a6c80] hover:bg-[#23A6BD] hover:text-[#010313]'
export const btnGhost =
  btnBase +
  ' border border-[#e5e7eb] bg-white text-[#1a6c80] hover:border-[#23A6BD] hover:bg-[#23A6BD] hover:text-[#010313]'
export const btnDanger =
  btnBase +
  ' border border-rose-200 bg-white text-rose-700 hover:bg-rose-600 hover:text-white'
export const btnCompact = 'px-2 py-1 text-[11px]'

// Badge
export const badgeBase =
  'inline-flex w-fit shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase'

export const badgeTones: Record<string, { bg: string; text: string }> = {
  brand: { bg: '#eefbfc', text: '#1a6c80' },
  green: { bg: '#ecfdf5', text: '#047857' },
  amber: { bg: '#fef3c7', text: '#92400e' },
  rose: { bg: '#fff1f2', text: '#be123c' },
  gray: { bg: '#f3f4f6', text: '#4b5563' },
  blue: { bg: '#eff6ff', text: '#1d4ed8' },
}

// Search input
export const searchWrapper = 'relative'
export const searchInput =
  'w-full sm:w-[260px] rounded-lg border border-[#e5e7eb] py-1.5 pl-8 pr-3 text-[12px] text-[#010313] placeholder:text-[#9ca3af] focus:border-[#23A6BD] focus:outline-none focus:ring-2 focus:ring-[#23A6BD]/15'

// Table
export const tableHeaderCell =
  'border-b border-[#eef0f3] bg-[#fafbfc] px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide text-[#9ca3af] text-left'
export const tableBodyRow = 'align-top hover:bg-[#fafbfc]'
export const tableCell = 'px-4 py-4'

// Empty state
export const emptyState =
  'flex flex-col items-center justify-center gap-3 py-16 text-center text-[#9ca3af]'

// Typography helpers
export const sectionLabel = 'text-[11px] font-bold uppercase tracking-wide text-[#9ca3af]'
export const overline = 'text-[10px] font-bold uppercase tracking-wide text-[#9ca3af]'
export const link = 'text-[#1a6c80] hover:text-[#23A6BD] transition-colors underline-offset-2'
export const linkSm = 'text-[12px] text-[#1a6c80] hover:text-[#23A6BD] transition-colors'

// Status helpers
import type { RequestStatus } from '@/types'

export function statusTone(status: RequestStatus): string {
  switch (status) {
    case 'DRAFT': return 'gray'
    case 'AWAITING_REQUEST_PAYMENT': return 'amber'
    case 'SUBMITTED': return 'blue'
    case 'UNDER_REVIEW': return 'amber'
    case 'NEEDS_INFORMATION': return 'amber'
    case 'REJECTED': return 'rose'
    case 'READY_TO_PUBLISH': return 'brand'
    case 'PUBLISHED': return 'brand'
    case 'OFFERS_RECEIVED': return 'blue'
    case 'AWAITING_CUSTOMER_APPROVAL': return 'amber'
    case 'CUSTOMER_APPROVED': return 'green'
    case 'AWAITING_CONNECTION_PAYMENT': return 'amber'
    case 'CONNECTION_UNLOCKED': return 'green'
    case 'CONNECTED': return 'green'
    case 'IN_PROGRESS_OR_ARRANGED': return 'blue'
    case 'COMPLETED': return 'green'
    case 'CANCELLED': return 'rose'
    case 'REPORTED': return 'rose'
    case 'CLOSED': return 'gray'
    default: return 'gray'
  }
}

export function statusLabel(status: RequestStatus): string {
  return status.replace(/_/g, ' ')
}

export const CHART_COLORS = [
  '#23A6BD',
  '#1a6c80',
  '#3ac2ce',
  '#a9e9ef',
  '#6b7280',
  '#9ca3af',
]

export const barGrow = 'transition-all duration-700 ease-out'
