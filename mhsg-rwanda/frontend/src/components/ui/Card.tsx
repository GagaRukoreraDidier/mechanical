import { cn } from '@/lib/utils'
import { card, cardHeaderBar, cardHeaderLeft, cardTitle, cardSubtitle } from '@/lib/variants/ds'

interface CardHeaderProps {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

interface CardProps {
  header?: CardHeaderProps
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}

export function Card({ header, children, className, bodyClassName }: CardProps) {
  return (
    <div className={cn(card, className)}>
      {header && (
        <div className={cardHeaderBar}>
          <div className={cardHeaderLeft}>
            {header.icon && (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eefbfc] text-[#1a6c80]">
                <header.icon className="h-4 w-4" />
              </span>
            )}
            <div className="min-w-0">
              <h2 className={cardTitle}>{header.title}</h2>
              {header.subtitle && <p className={cardSubtitle}>{header.subtitle}</p>}
            </div>
          </div>
          {header.actions && <div className="shrink-0">{header.actions}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  )
}
