'use client'

import React from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  value: string
  onChange: (value: any) => void
  placeholder?: string
  className?: string
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className }: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9ca3af]" />
      <input
        type="text"
        value={value}
        onChange={(e) => {
          if (typeof onChange === 'function') {
            onChange(e.target.value)
          }
        }}
        placeholder={placeholder}
        className={cn(
          'w-full sm:w-[260px] rounded-lg border border-[#e5e7eb] py-1.5 pl-8 pr-3 text-[12px] text-[#010313] placeholder:text-[#9ca3af] focus:border-[#23A6BD] focus:outline-none focus:ring-2 focus:ring-[#23A6BD]/15',
          className,
        )}
      />
    </div>
  )
}
