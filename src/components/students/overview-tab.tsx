'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

interface OverviewTabProps {
  student: {
    id: string
    firstName: string
    lastName: string
    tasks: Array<{
      task: {
        id: string
        title: string
        description: string | null
        priority: string
        status: string
        dueDate: Date | null
      }
      status: string
      notes: string | null
      assignedAt: Date
    }>
    skills: Array<{
      skill: {
        id: string
        name: string
        category: string
      }
      proficiency: string
      verified: boolean
    }>
    projectRoles: Array<{
      project: {
        id: string
        name: string
        status: string
      }
      role: string
    }>
  }
}

const PROFICIENCY_LEVELS = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
}

export function OverviewTab({ student }: OverviewTabProps) {
  // Calculate stats
  const activeTasks = student.tasks.filter(
    (t) => t.status === 'TODO' || t.status === 'IN_PROGRESS'
  ).length
  const completedTasks = student.tasks.filter((t) => t.status === 'COMPLETED').length

  const skillsMastered = student.skills.filter(
    (s) => s.proficiency === 'ADVANCED' || s.proficiency === 'EXPERT'
  ).length

  const activeProjects = student.projectRoles.filter(
    (p) => p.project.status === 'IN_PROGRESS' || p.project.status === 'PLANNING'
  ).length

  // Recent activity (last 5 tasks)
  const recentTasks = [...student.tasks]
    .sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime())
    .slice(0, 5)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'TODO':
        return 'bg-gray-100 text-gray-800'
      case 'BLOCKED':
        return 'bg-red-100 text-red-800'
      case 'REVIEW':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'LOW':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{activeTasks}</span>
                <span className="text-sm text-gray-500">active</span>
              </div>
              <div className="text-xs text-gray-500">{completedTasks} completed</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{skillsMastered}</span>
                <span className="text-sm text-gray-500">mastered</span>
              </div>
              <div className="text-xs text-gray-500">{student.skills.length} total</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{activeProjects}</span>
                <span className="text-sm text-gray-500">active</span>
              </div>
              <div className="text-xs text-gray-500">{student.projectRoles.length} total</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Last 5 task assignments and updates</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTasks.length === 0 ? (
            <p className="text-sm text-gray-500">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {recentTasks.map((taskAssignment) => (
                <div
                  key={taskAssignment.task.id}
                  className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{taskAssignment.task.title}</p>
                      <Badge className={getStatusColor(taskAssignment.status)} variant="secondary">
                        {taskAssignment.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(taskAssignment.task.priority)} variant="secondary">
                        {taskAssignment.task.priority}
                      </Badge>
                    </div>
                    {taskAssignment.task.description && (
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {taskAssignment.task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Assigned {format(new Date(taskAssignment.assignedAt), 'MMM d, yyyy')}</span>
                      {taskAssignment.task.dueDate && (
                        <span>Due {format(new Date(taskAssignment.task.dueDate), 'MMM d, yyyy')}</span>
                      )}
                    </div>
                    {taskAssignment.notes && (
                      <p className="text-sm text-gray-600 italic">{taskAssignment.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Tasks Section */}
      <Card>
        <CardHeader>
          <CardTitle>Active Tasks</CardTitle>
          <CardDescription>Tasks currently in progress or pending</CardDescription>
        </CardHeader>
        <CardContent>
          {activeTasks === 0 ? (
            <p className="text-sm text-gray-500">No active tasks</p>
          ) : (
            <div className="space-y-3">
              {student.tasks
                .filter((t) => t.status === 'TODO' || t.status === 'IN_PROGRESS')
                .slice(0, 5)
                .map((taskAssignment) => (
                  <div
                    key={taskAssignment.task.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{taskAssignment.task.title}</p>
                        <Badge className={getStatusColor(taskAssignment.status)} variant="secondary">
                          {taskAssignment.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      {taskAssignment.task.dueDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          Due {format(new Date(taskAssignment.task.dueDate), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                    <Badge className={getPriorityColor(taskAssignment.task.priority)} variant="secondary">
                      {taskAssignment.task.priority}
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
