import { cn } from '@/lib/utils'
import { badgeTones } from '@/lib/variants/ds'

type Tone = 'brand' | 'green' | 'amber' | 'rose' | 'gray' | 'blue'

interface ProgressBarProps {
  value: number // 0-100
  tone?: Tone
  className?: string
  showLabel?: boolean
}

export function ProgressBar({ value, tone = 'brand', className, showLabel = false }: ProgressBarProps) {
  const { text: fillColor } = badgeTones[tone]
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="h-1.5 flex-1 rounded-full bg-[#f1f5f9]">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${clampedValue}%`, backgroundColor: fillColor }}
        />
      </div>
      {showLabel && (
        <span className="tabular-nums text-[11px] text-[#6b7280]">{clampedValue}%</span>
      )}
    </div>
  )
}
