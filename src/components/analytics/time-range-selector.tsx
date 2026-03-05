'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type TimeRangePreset = 'WEEK' | 'MONTH' | 'SEASON' | 'ALL_TIME'

interface TimeRangeSelectorProps {
  value: TimeRangePreset
  onChange: (value: TimeRangePreset) => void
  className?: string
}

const timeRangeOptions: { value: TimeRangePreset; label: string }[] = [
  { value: 'WEEK', label: 'This Week' },
  { value: 'MONTH', label: 'This Month' },
  { value: 'SEASON', label: 'This Season' },
  { value: 'ALL_TIME', label: 'All Time' },
]

export function TimeRangeSelector({
  value,
  onChange,
  className,
}: TimeRangeSelectorProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      {timeRangeOptions.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
