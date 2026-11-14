import React from 'react'
import { cn } from '@/lib/utils'
import { emptyState } from '@/lib/variants/ds'

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({ icon, title, description, action, actionLabel, onAction, className }: EmptyStateProps) {
  const isComponent = typeof icon === 'function' || (typeof icon === 'object' && icon !== null && 'render' in icon)
  return (
    <div className={cn(emptyState, className)}>
      {icon && (
        <div className="rounded-2xl bg-[#f3f4f6] p-4 text-[#9ca3af]">
          {isComponent ? (
            // @ts-ignore
            React.createElement(icon, { className: 'h-8 w-8 text-[#9ca3af]' })
          ) : (
            (icon as React.ReactNode)
          )}
        </div>
      )}
      <div>
        <p className="text-[14px] font-semibold text-[#6b7280]">{title}</p>
        {description && <p className="mt-1 text-[12px]">{description}</p>}
      </div>
      {action ? (
        action
      ) : actionLabel && onAction ? (
        <button
          onClick={onAction}
          className="rounded-xl px-4 py-2 text-[13px] font-semibold text-[#010313] transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#23A6BD' }}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
