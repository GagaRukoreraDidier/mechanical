import { Badge } from './Badge'
import { statusTone, statusLabel } from '@/lib/variants/ds'
import type { RequestStatus } from '@/types'

interface StatusBadgeProps {
  status: RequestStatus | string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const tone = statusTone(status as RequestStatus) as 'brand' | 'green' | 'amber' | 'rose' | 'gray' | 'blue'
  return (
    <Badge tone={tone} className={className}>
      {statusLabel(status as RequestStatus)}
    </Badge>
  )
}
