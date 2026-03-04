'use client'
import { useState } from 'react'
import { Student, ProjectRole, Project, ProjectMedia } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BootcampMilestoneChecklist } from '@/components/progress/bootcamp-milestone-checklist'
import { Calendar, Mail, Phone, User, CheckCircle2, Circle } from 'lucide-react'

type StudentWithProjects = Student & {
  projectRoles: (ProjectRole & {
    project: Project & {
      media: ProjectMedia[]
    }
  })[]
}

type BootcampProgress = {
  milestones: Array<{
    id: string
    title: string
    description: string | null
    category: string
    order: number
    completed: boolean
    completedAt: Date | null
    status: string
    evidenceMedia: {
      id: string
      url: string
      type: string
      title: string | null
    } | null
  }>
  completed: number
  total: number
  percentage: number
}

type ProjectGoal = {
  id: string
  description: string
  completed: boolean
}

export function StudentProgressDetail({
  student,
  bootcampProgress,
}: {
  student: StudentWithProjects
  bootcampProgress: BootcampProgress
}) {
  const [activeTab, setActiveTab] = useState('bootcamp')

  const getInitials = (firstName: string, lastName: string) =>
    `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()

  const getProjectStatusBadge = (status: string) => {
    const variants = {
      PLANNING: 'bg-gray-100 text-gray-800 border-gray-200',
      IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
      TESTING: 'bg-purple-100 text-purple-800 border-purple-200',
      COMPLETED: 'bg-green-100 text-green-800 border-green-200',
    }
    return variants[status as keyof typeof variants] || variants.PLANNING
  }

  const parseProjectGoals = (goalsJson: unknown): ProjectGoal[] => {
    try {
      if (!goalsJson) return []
      if (Array.isArray(goalsJson)) {
        // Validate structure
        return goalsJson.filter(
          (goal): goal is ProjectGoal =>
            typeof goal === 'object' &&
            goal !== null &&
            'id' in goal &&
            'description' in goal &&
            'completed' in goal &&
            typeof goal.id === 'string' &&
            typeof goal.description === 'string' &&
            typeof goal.completed === 'boolean'
        )
      }
      return []
    } catch (error) {
      console.warn('Failed to parse project goals:', error)
      return []
    }
  }

  const calculateGoalProgress = (goals: ProjectGoal[]) => {
    if (goals.length === 0) return { completed: 0, total: 0, percentage: 0 }
    const completed = goals.filter((g) => g.completed).length
    return {
      completed,
      total: goals.length,
      percentage: Math.round((completed / goals.length) * 100),
    }
  }

  return (
    <div className="space-y-6">
      {/* Student Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={student.avatar || undefined} />
              <AvatarFallback className="bg-blue-100 text-blue-800 font-semibold text-xl">
                {getInitials(student.firstName, student.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {student.firstName} {student.lastName}
              </h1>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                {student.grade && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Grade {student.grade}
                  </div>
                )}
                {student.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {student.email}
                  </div>
                )}
                {student.gradYear && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Class of {student.gradYear}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bootcamp">
            Bootcamp ({bootcampProgress.completed}/{bootcampProgress.total})
          </TabsTrigger>
          <TabsTrigger value="projects">
            Projects ({student.projectRoles.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bootcamp" className="space-y-4">
          <BootcampMilestoneChecklist
            studentId={student.id}
            milestones={bootcampProgress.milestones}
          />
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          {student.projectRoles.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">
                  No portfolio projects yet. Student will select a project after completing bootcamp.
                </p>
              </CardContent>
            </Card>
          ) : (
            student.projectRoles.map((role) => {
              const goals = parseProjectGoals(role.project.goals)
              const progress = calculateGoalProgress(goals)
              const hasGoals = goals.length > 0
              const allComplete = hasGoals && progress.completed === progress.total

              return (
                <Card key={role.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{role.project.name}</CardTitle>
                      <Badge className={getProjectStatusBadge(role.project.status)} variant="outline">
                        {role.project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    {role.project.description && (
                      <p className="text-sm text-gray-600">{role.project.description}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium">Role:</span>{' '}
                        <span className="text-sm text-gray-600">{role.role}</span>
                      </div>

                      {/* Milestones Section */}
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium">Project Milestones</span>
                          {hasGoals && (
                            <Badge
                              variant={allComplete ? 'default' : 'secondary'}
                              className={allComplete ? 'bg-green-600 text-white' : ''}
                            >
                              {progress.completed}/{progress.total} Complete
                            </Badge>
                          )}
                        </div>

                        {!hasGoals ? (
                          <p className="text-sm text-gray-500 py-2">
                            No milestones defined for this project
                          </p>
                        ) : (
                          <>
                            {/* Progress Bar */}
                            <div className="mb-4">
                              <Progress value={progress.percentage} className="h-2" />
                              <p className="text-xs text-gray-500 mt-1">
                                {progress.percentage}% complete
                              </p>
                            </div>

                            {/* Goal List */}
                            <div className="space-y-2">
                              {goals.map((goal) => (
                                <div
                                  key={goal.id}
                                  className={`flex items-start gap-3 p-2 rounded transition-colors ${
                                    goal.completed ? 'bg-green-50' : 'bg-gray-50'
                                  }`}
                                >
                                  {goal.completed ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                  ) : (
                                    <Circle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                  )}
                                  <span
                                    className={`text-sm ${
                                      goal.completed ? 'text-gray-600 line-through' : 'text-gray-900'
                                    }`}
                                  >
                                    {goal.description}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {allComplete && (
                              <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded">
                                <p className="text-sm text-green-800 font-medium">
                                  ✓ All milestones complete!
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Documentation Section */}
                      {role.project.media.length > 0 && (
                        <div className="border-t pt-4">
                          <span className="text-sm font-medium block mb-2">Documentation:</span>
                          <div className="grid grid-cols-4 gap-2">
                            {role.project.media.slice(0, 8).map((media) => (
                              <div key={media.id} className="aspect-square bg-gray-100 rounded overflow-hidden">
                                {media.type === 'IMAGE' ? (
                                  <img
                                    src={media.url}
                                    alt={media.title || 'Project media'}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                                    VIDEO
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          {role.project.media.length > 8 && (
                            <p className="text-xs text-gray-500 mt-2">
                              +{role.project.media.length - 8} more files
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
