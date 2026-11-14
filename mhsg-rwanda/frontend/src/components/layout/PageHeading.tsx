import React from 'react'
import { cn } from '@/lib/utils'

interface PageHeadingProps {
  icon: React.ComponentType<{ className?: string }> | React.ReactNode
  title: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeading({ icon, title, subtitle, actions, className }: PageHeadingProps) {
  const isComponent = typeof icon === 'function' || (typeof icon === 'object' && icon !== null && 'render' in icon)
  return (
    <div className={cn('mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between', className)}>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eefbfc] text-[#1a6c80]">
          {isComponent ? (
            // @ts-ignore
            React.createElement(icon, { className: 'h-5 w-5' })
          ) : (
            (icon as React.ReactNode)
          )}
        </div>
        <div>
          <h1 className="text-[22px] font-bold text-[#010313] sm:text-[26px]">{title}</h1>
          {subtitle && <div className="mt-1 text-[13px] text-[#6b7280]">{subtitle}</div>}
        </div>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  )
}

export default PageHeading
