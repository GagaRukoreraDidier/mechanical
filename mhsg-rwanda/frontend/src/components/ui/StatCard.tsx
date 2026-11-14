import React from 'react'
import { cn } from '@/lib/utils'
import { statCard, statLabel, statValue } from '@/lib/variants/ds'

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }> | React.ReactNode
  label: string
  value: string | number
  hint?: string
  tone?: 'brand' | 'neutral' | 'success' | 'warn' | string
  className?: string
}

export function StatCard({ icon, label, value, hint, className }: StatCardProps) {
  const isComponent = typeof icon === 'function' || (typeof icon === 'object' && icon !== null && 'render' in icon)
  return (
    <div className={cn(statCard, className)}>
      <div className="rounded-xl p-2.5 bg-[#eefbfc] text-[#1a6c80] shrink-0">
        {isComponent ? (
          // @ts-ignore
          React.createElement(icon, { className: 'h-5 w-5' })
        ) : (
          (icon as React.ReactNode)
        )}
      </div>
      <div className="min-w-0">
        <p className={statLabel}>{label}</p>
        <p className={cn(statValue, 'tabular-nums')}>{value}</p>
        {hint && <p className="text-[11px] text-[#9ca3af] mt-0.5">{hint}</p>}
      </div>
    </div>
  )
}
