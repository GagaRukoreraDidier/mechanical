'use client'

import { cn } from '@/lib/utils'
import { btnBase, btnPrimary, btnOutline, btnGhost, btnDanger, btnCompact } from '@/lib/variants/ds'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'default' | 'compact' | 'sm'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: React.ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary: btnPrimary,
  secondary: btnOutline,
  outline: btnOutline,
  ghost: btnGhost,
  danger: btnDanger,
}

export function Button({
  variant = 'primary',
  size = 'default',
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        variantClasses[variant],
        (size === 'compact' || size === 'sm') && btnCompact,
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  )
}
