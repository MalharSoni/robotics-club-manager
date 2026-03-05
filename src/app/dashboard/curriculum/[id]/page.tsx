'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CurriculumModule, CurriculumProgress, Student } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { StudentProgressTable } from '@/components/curriculum/student-progress-table'
import { ModuleFormDialog } from '@/components/curriculum/module-form-dialog'
import { getModuleById } from '@/app/actions/curriculum'
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Users,
  TrendingUp,
  Award,
  Settings,
  GraduationCap,
  Target,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

interface ModuleDetailData extends CurriculumModule {
  stats: {
    totalStudents: number
    completedCount: number
    inProgressCount: number
    completionRate: number
    avgQuizScore: number | null
  }
  progress: (CurriculumProgress & {
    student: Pick<Student, 'id' | 'firstName' | 'lastName' | 'email' | 'avatar' | 'grade'>
  })[]
  lessons: any[]
  subModules: any[]
  parent: any
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

export default function ModuleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const moduleId = params.id as string

  const [module, setModule] = useState<ModuleDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const fetchModule = async () => {
    setLoading(true)
    try {
      const result = await getModuleById(moduleId)
      if (result.module) {
        setModule(result.module as ModuleDetailData)
      } else if (result.error) {
        console.error(result.error)
      }
    } catch (error) {
      console.error('Error fetching module:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (moduleId) {
      fetchModule()
    }
  }, [moduleId])

  const handleEditSuccess = () => {
    fetchModule()
    setEditDialogOpen(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!module) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <Card className="p-12">
          <div className="text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Module not found</h3>
            <p className="text-muted-foreground mb-4">
              The curriculum module you're looking for doesn't exist.
            </p>
            <Button onClick={() => router.push('/dashboard/curriculum')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Curriculum
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/curriculum')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Curriculum
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-4xl font-bold tracking-tight">{module.title}</h1>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className={cn('text-sm', categoryColors[module.category])}>
                {categoryLabels[module.category]}
              </Badge>
              <Badge className={cn('text-sm', levelColors[module.level])}>
                {levelLabels[module.level]}
              </Badge>
              {module.estimatedHours && (
                <Badge variant="outline" className="text-sm">
                  <Clock className="h-3 w-3 mr-1" />
                  {module.estimatedHours}h
                </Badge>
              )}
            </div>
            {module.description && (
              <p className="text-lg text-muted-foreground">{module.description}</p>
            )}
          </div>
          <Button onClick={() => setEditDialogOpen(true)} size="lg" variant="outline">
            <Settings className="mr-2 h-5 w-5" />
            Edit Module
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold">{module.stats.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-3xl font-bold">{module.stats.completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold">{module.stats.completedCount}</p>
              </div>
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Quiz Score</p>
                <p className="text-3xl font-bold">
                  {module.stats.avgQuizScore !== null ? `${module.stats.avgQuizScore}%` : 'N/A'}
                </p>
              </div>
              <GraduationCap className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Team Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Completion</span>
                <span className="text-sm font-medium">{module.stats.completionRate}%</span>
              </div>
              <Progress value={module.stats.completionRate} className="h-3" />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{module.stats.completedCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{module.stats.inProgressCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Not Started</p>
                <p className="text-2xl font-bold text-slate-600">
                  {module.stats.totalStudents -
                    module.stats.completedCount -
                    module.stats.inProgressCount}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Learning Objectives */}
        {module.objectives && module.objectives.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Learning Objectives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {module.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="flex-1 pt-0.5">{objective}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Lessons */}
        {module.lessons && module.lessons.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Lessons ({module.lessons.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {module.lessons.map((lesson) => (
                  <li key={lesson.id} className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{lesson.title}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Student Progress Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Progress</CardTitle>
          <CardDescription>
            Track and manage individual student progress through this module
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StudentProgressTable
            moduleId={moduleId}
            progress={module.progress}
            onUpdate={fetchModule}
          />
        </CardContent>
      </Card>

      {/* Edit Module Dialog */}
      <ModuleFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleEditSuccess}
        module={module}
      />
    </div>
  )
}
