import { cn } from '@/lib/utils'
import { badgeTones, badgeBase } from '@/lib/variants/ds'

type Tone = 'brand' | 'green' | 'amber' | 'rose' | 'gray' | 'blue'

interface BadgeProps {
  tone?: Tone
  variant?: 'success' | 'danger' | 'info' | 'warning' | 'brand' | 'default' | string
  children: React.ReactNode
  className?: string
}

const variantToTone: Record<string, Tone> = {
  success: 'green',
  danger: 'rose',
  info: 'blue',
  warning: 'amber',
  brand: 'brand',
  default: 'gray',
}

export function Badge({ tone, variant, children, className }: BadgeProps) {
  const resolvedTone: Tone = tone || (variant ? variantToTone[variant] || 'gray' : 'gray')
  const { bg, text } = badgeTones[resolvedTone] || badgeTones.gray
  return (
    <span
      className={cn(badgeBase, className)}
      style={{ backgroundColor: bg, color: text }}
    >
      {children}
    </span>
  )
}
