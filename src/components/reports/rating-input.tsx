'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingInputProps {
  value?: number
  onChange?: (value: number) => void
  label: string
  disabled?: boolean
  maxRating?: number
}

export function RatingInput({
  value = 0,
  onChange,
  label,
  disabled = false,
  maxRating = 5,
}: RatingInputProps) {
  const handleClick = (rating: number) => {
    if (!disabled && onChange) {
      onChange(rating)
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-1">
        {Array.from({ length: maxRating }, (_, i) => i + 1).map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => handleClick(rating)}
            disabled={disabled}
            className={cn(
              'transition-all',
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'
            )}
          >
            <Star
              className={cn(
                'h-6 w-6 transition-colors',
                rating <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-300'
              )}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {value > 0 ? `${value}/${maxRating}` : 'Not rated'}
        </span>
      </div>
    </div>
  )
}
