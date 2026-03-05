'use client'

import Link from 'next/link'
import { CurriculumModule, ProgressStatus } from '@prisma/client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  Clock,
  TrendingUp,
  Users,
  Award,
  Settings,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModuleCardProps {
  module: CurriculumModule & {
    stats: {
      totalStudents: number
      completedCount: number
      inProgressCount: number
      completionRate: number
    }
    lessons?: any[]
    progress?: any[]
  }
  onEdit?: (module: any) => void
  showActions?: boolean
}

const categoryColors: Record<string, string> = {
  MECHANICAL: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  ELECTRICAL: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  PROGRAMMING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  CAD_DESIGN: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  NOTEBOOK: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  SOFT_SKILLS: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  COMPETITION_STRATEGY: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  SAFETY: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
}

const levelColors: Record<string, string> = {
  BEGINNER: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  INTERMEDIATE: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
  ADVANCED: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
  EXPERT: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
}

const categoryLabels: Record<string, string> = {
  MECHANICAL: 'Mechanical',
  ELECTRICAL: 'Electrical',
  PROGRAMMING: 'Programming',
  CAD_DESIGN: 'CAD/Design',
  NOTEBOOK: 'Notebook',
  SOFT_SKILLS: 'Soft Skills',
  COMPETITION_STRATEGY: 'Strategy',
  SAFETY: 'Safety',
}

const levelLabels: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  EXPERT: 'Expert',
}

export function ModuleCard({ module, onEdit, showActions = true }: ModuleCardProps) {
  const completionRate = module.stats.completionRate

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <CardTitle className="text-xl line-clamp-2">
              {module.title}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge className={cn('text-xs', categoryColors[module.category])}>
                {categoryLabels[module.category]}
              </Badge>
              <Badge className={cn('text-xs', levelColors[module.level])}>
                {levelLabels[module.level]}
              </Badge>
            </div>
          </div>
          {showActions && onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(module)}
              className="ml-2"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
        {module.description && (
          <CardDescription className="line-clamp-2">
            {module.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Team Progress</span>
            <span className="font-medium">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{module.stats.completedCount} completed</span>
            <span>{module.stats.inProgressCount} in progress</span>
          </div>
        </div>

        {/* Learning Objectives */}
        {module.objectives && module.objectives.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span>Learning Objectives</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              {module.objectives.slice(0, 3).map((objective, index) => (
                <li key={index} className="line-clamp-1">
                  {objective}
                </li>
              ))}
              {module.objectives.length > 3 && (
                <li className="text-xs italic">
                  +{module.objectives.length - 3} more...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Module Stats */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t">
          <div className="flex flex-col items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{module.stats.totalStudents}</span>
            <span className="text-xs text-muted-foreground">Students</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{module.lessons?.length || 0}</span>
            <span className="text-xs text-muted-foreground">Lessons</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {module.estimatedHours ? `${module.estimatedHours}h` : 'N/A'}
            </span>
            <span className="text-xs text-muted-foreground">Duration</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Link href={`/dashboard/curriculum/${module.id}`} className="w-full">
          <Button variant="outline" className="w-full group">
            View Details
            <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
