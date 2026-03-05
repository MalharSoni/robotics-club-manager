'use client'

import { SkillLevel, SkillCategory } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Users, CheckCircle } from 'lucide-react'

interface SkillCardProps {
  skill: {
    id: string
    name: string
    description: string | null
    category: SkillCategory
    stats: {
      totalStudents: number
      avgProficiency: number
      proficiencyDistribution: {
        BEGINNER: number
        INTERMEDIATE: number
        ADVANCED: number
        EXPERT: number
      }
      verifiedCount: number
    }
  }
  onClick?: () => void
}

const CATEGORY_COLORS: Record<SkillCategory, string> = {
  MECHANICAL: 'bg-orange-100 text-orange-800',
  ELECTRICAL: 'bg-yellow-100 text-yellow-800',
  PROGRAMMING: 'bg-blue-100 text-blue-800',
  CAD_DESIGN: 'bg-purple-100 text-purple-800',
  PROJECT_MANAGEMENT: 'bg-green-100 text-green-800',
  COMMUNICATION: 'bg-pink-100 text-pink-800',
  LEADERSHIP: 'bg-indigo-100 text-indigo-800',
  PROBLEM_SOLVING: 'bg-teal-100 text-teal-800',
}

export function SkillCard({ skill, onClick }: SkillCardProps) {
  const { stats } = skill

  const getProficiencyPercentage = (level: SkillLevel) => {
    if (stats.totalStudents === 0) return 0
    return Math.round(
      (stats.proficiencyDistribution[level] / stats.totalStudents) * 100
    )
  }

  const getProficiencyLabel = (avg: number) => {
    if (avg >= 3.5) return 'Expert'
    if (avg >= 2.5) return 'Advanced'
    if (avg >= 1.5) return 'Intermediate'
    return 'Beginner'
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {skill.name}
          </CardTitle>
          <Badge className={CATEGORY_COLORS[skill.category]} variant="secondary">
            {skill.category.replace(/_/g, ' ')}
          </Badge>
        </div>
        {skill.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mt-2">
            {skill.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-gray-600">
            <Users className="h-4 w-4" />
            <span>{stats.totalStudents} students</span>
          </div>
          {stats.verifiedCount > 0 && (
            <div className="flex items-center gap-1.5 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>{stats.verifiedCount} verified</span>
            </div>
          )}
        </div>

        {/* Average Proficiency */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Avg Proficiency</span>
            <span className="text-gray-600">
              {stats.avgProficiency.toFixed(1)} - {getProficiencyLabel(stats.avgProficiency)}
            </span>
          </div>
          <Progress value={(stats.avgProficiency / 4) * 100} className="h-2" />
        </div>

        {/* Proficiency Distribution Bars */}
        {stats.totalStudents > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-600">Distribution</div>
            <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-gray-100">
              {stats.proficiencyDistribution.BEGINNER > 0 && (
                <div
                  className="bg-gray-500"
                  style={{
                    width: `${getProficiencyPercentage('BEGINNER')}%`,
                  }}
                  title={`Beginner: ${stats.proficiencyDistribution.BEGINNER}`}
                />
              )}
              {stats.proficiencyDistribution.INTERMEDIATE > 0 && (
                <div
                  className="bg-blue-500"
                  style={{
                    width: `${getProficiencyPercentage('INTERMEDIATE')}%`,
                  }}
                  title={`Intermediate: ${stats.proficiencyDistribution.INTERMEDIATE}`}
                />
              )}
              {stats.proficiencyDistribution.ADVANCED > 0 && (
                <div
                  className="bg-green-500"
                  style={{
                    width: `${getProficiencyPercentage('ADVANCED')}%`,
                  }}
                  title={`Advanced: ${stats.proficiencyDistribution.ADVANCED}`}
                />
              )}
              {stats.proficiencyDistribution.EXPERT > 0 && (
                <div
                  className="bg-purple-500"
                  style={{
                    width: `${getProficiencyPercentage('EXPERT')}%`,
                  }}
                  title={`Expert: ${stats.proficiencyDistribution.EXPERT}`}
                />
              )}
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Beginner</span>
              <span>Expert</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
