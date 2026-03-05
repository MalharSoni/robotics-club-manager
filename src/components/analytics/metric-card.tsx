'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: number
  trendLabel?: string
  icon?: React.ReactNode
  className?: string
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon,
  className,
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (trend === undefined || trend === 0) {
      return <MinusIcon className="h-4 w-4 text-muted-foreground" />
    }
    if (trend > 0) {
      return <ArrowUpIcon className="h-4 w-4 text-green-600" />
    }
    return <ArrowDownIcon className="h-4 w-4 text-red-600" />
  }

  const getTrendColor = () => {
    if (trend === undefined || trend === 0) return 'text-muted-foreground'
    return trend > 0 ? 'text-green-600' : 'text-red-600'
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {trend !== undefined && (
          <div className={cn('flex items-center text-xs mt-2', getTrendColor())}>
            {getTrendIcon()}
            <span className="ml-1">
              {Math.abs(trend).toFixed(1)}%{' '}
              {trendLabel || 'from last period'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
