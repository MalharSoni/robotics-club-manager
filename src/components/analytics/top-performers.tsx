'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrophyIcon, MedalIcon, AwardIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Performer {
  id: string
  name: string
  value: number
  details: string
}

interface TopPerformersProps {
  title: string
  description?: string
  performers: Performer[]
  metric: string
  className?: string
}

export function TopPerformers({
  title,
  description,
  performers,
  metric,
  className,
}: TopPerformersProps) {
  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0:
        return <TrophyIcon className="h-5 w-5 text-yellow-500" />
      case 1:
        return <MedalIcon className="h-5 w-5 text-gray-400" />
      case 2:
        return <MedalIcon className="h-5 w-5 text-amber-600" />
      default:
        return <AwardIcon className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getMedalBgColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-yellow-50 dark:bg-yellow-950'
      case 1:
        return 'bg-gray-50 dark:bg-gray-900'
      case 2:
        return 'bg-amber-50 dark:bg-amber-950'
      default:
        return 'bg-muted/50'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {performers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No data available
            </p>
          ) : (
            performers.map((performer, index) => (
              <div
                key={performer.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg transition-colors',
                  getMedalBgColor(index)
                )}
              >
                <div className="flex-shrink-0">{getMedalIcon(index)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{performer.name}</p>
                  <p className="text-xs text-muted-foreground">{performer.details}</p>
                </div>
                <Badge variant="secondary" className="flex-shrink-0">
                  {performer.value}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
