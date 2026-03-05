'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  AlertTriangleIcon,
  TrendingUpIcon,
  BookOpenIcon,
  CalendarIcon,
  ArrowRightIcon,
} from 'lucide-react'

interface SkillGap {
  skill: string
  category: string
  avgProficiency: number
}

interface StudentNeedingAttention {
  id: string
  name: string
  reason: string
}

interface RecommendedModule {
  id: string
  title: string
  category: string
  difficulty: string
}

interface UpcomingDeadline {
  id: string
  title: string
  dueDate: Date
  assignedTo: number
}

interface InsightsPanelProps {
  skillGaps: SkillGap[]
  studentsNeedingAttention: StudentNeedingAttention[]
  recommendedModules: RecommendedModule[]
  upcomingDeadlines: UpcomingDeadline[]
  className?: string
}

export function InsightsPanel({
  skillGaps,
  studentsNeedingAttention,
  recommendedModules,
  upcomingDeadlines,
  className,
}: InsightsPanelProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'advanced':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'expert':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5" />
            Team Insights
          </CardTitle>
          <CardDescription>
            AI-powered recommendations and alerts for your team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Skill Gaps */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <AlertTriangleIcon className="h-4 w-4 text-orange-500" />
              Skill Gaps to Address
            </h3>
            {skillGaps.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No significant skill gaps identified
              </p>
            ) : (
              <div className="space-y-2">
                {skillGaps.map((gap, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{gap.skill}</p>
                      <p className="text-xs text-muted-foreground">{gap.category}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Avg: {gap.avgProficiency.toFixed(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Students Needing Attention */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <AlertTriangleIcon className="h-4 w-4 text-red-500" />
              Students Needing Attention
            </h3>
            {studentsNeedingAttention.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                All students are on track
              </p>
            ) : (
              <div className="space-y-2">
                {studentsNeedingAttention.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.reason}</p>
                    </div>
                    <a href={`/dashboard/students/${student.id}`}>
                      <Button variant="ghost" size="sm">
                        <ArrowRightIcon className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Recommended Modules */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <BookOpenIcon className="h-4 w-4 text-blue-500" />
              Recommended Curriculum
            </h3>
            {recommendedModules.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recommendations at this time
              </p>
            ) : (
              <div className="space-y-2">
                {recommendedModules.map((module) => (
                  <div
                    key={module.id}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{module.title}</p>
                      <p className="text-xs text-muted-foreground">{module.category}</p>
                    </div>
                    <Badge className={getDifficultyColor(module.difficulty)}>
                      {module.difficulty}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Upcoming Deadlines */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-purple-500" />
              Upcoming Deadlines
            </h3>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming deadlines in the next 2 weeks
              </p>
            ) : (
              <div className="space-y-2">
                {upcomingDeadlines.map((deadline) => (
                  <div
                    key={deadline.id}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{deadline.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {deadline.assignedTo} student{deadline.assignedTo !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Badge variant="secondary">{formatDate(deadline.dueDate)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
