'use client'

import { SkillLevel } from '@prisma/client'
import { Progress } from '@/components/ui/progress'

interface ProficiencyChartProps {
  distribution: {
    BEGINNER: number
    INTERMEDIATE: number
    ADVANCED: number
    EXPERT: number
  }
  total: number
  showLabels?: boolean
  orientation?: 'horizontal' | 'vertical'
}

const PROFICIENCY_CONFIG = {
  BEGINNER: {
    label: 'Beginner',
    color: 'bg-gray-500',
    lightColor: 'bg-gray-100',
  },
  INTERMEDIATE: {
    label: 'Intermediate',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-100',
  },
  ADVANCED: {
    label: 'Advanced',
    color: 'bg-green-500',
    lightColor: 'bg-green-100',
  },
  EXPERT: {
    label: 'Expert',
    color: 'bg-purple-500',
    lightColor: 'bg-purple-100',
  },
}

export function ProficiencyChart({
  distribution,
  total,
  showLabels = true,
  orientation = 'horizontal',
}: ProficiencyChartProps) {
  const getPercentage = (count: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0
  }

  if (orientation === 'vertical') {
    return (
      <div className="flex gap-2">
        {Object.entries(distribution).map(([level, count]) => {
          const percentage = getPercentage(count)
          const config = PROFICIENCY_CONFIG[level as SkillLevel]

          return (
            <div key={level} className="flex-1">
              <div className="flex flex-col items-center gap-1">
                <div className="h-24 w-full bg-gray-100 rounded-lg overflow-hidden flex flex-col-reverse">
                  <div
                    className={`${config.color} transition-all duration-300`}
                    style={{ height: `${percentage}%` }}
                  />
                </div>
                {showLabels && (
                  <div className="text-center">
                    <div className="text-xs font-medium text-gray-700">{count}</div>
                    <div className="text-xs text-gray-500">{config.label}</div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {Object.entries(distribution).map(([level, count]) => {
        const percentage = getPercentage(count)
        const config = PROFICIENCY_CONFIG[level as SkillLevel]

        return (
          <div key={level} className="space-y-1">
            {showLabels && (
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{config.label}</span>
                <span className="text-gray-500">
                  {count} ({percentage}%)
                </span>
              </div>
            )}
            <div className="relative">
              <Progress value={percentage} className="h-2" />
              <div
                className={`absolute inset-0 h-2 rounded-full ${config.color} transition-all duration-300`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function ProficiencyBadge({ level }: { level: SkillLevel }) {
  const config = PROFICIENCY_CONFIG[level]

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.lightColor} text-gray-800`}
    >
      {config.label}
    </span>
  )
}

export function ProficiencyDot({ level }: { level: SkillLevel }) {
  const config = PROFICIENCY_CONFIG[level]

  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${config.color}`}
      title={config.label}
    />
  )
}
