'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'

interface ProjectsTabProps {
  student: {
    id: string
    firstName: string
    lastName: string
    projectRoles: Array<{
      project: {
        id: string
        name: string
        description: string | null
        category: string
        status: string
        startDate: Date | null
        endDate: Date | null
      }
      role: string
      contributions: string | null
      hoursSpent: number | null
    }>
  }
}

const PROJECT_STATUS_COLORS = {
  PLANNING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  TESTING: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-gray-100 text-gray-800',
}

const PROJECT_CATEGORY_COLORS = {
  ROBOT: 'bg-blue-100 text-blue-800',
  MECHANISM: 'bg-green-100 text-green-800',
  AUTONOMOUS: 'bg-purple-100 text-purple-800',
  OUTREACH: 'bg-orange-100 text-orange-800',
  FUNDRAISING: 'bg-yellow-100 text-yellow-800',
  OTHER: 'bg-gray-100 text-gray-800',
}

const ROLE_COLORS = {
  LEAD: 'bg-purple-100 text-purple-800 border-purple-300',
  MEMBER: 'bg-blue-100 text-blue-800 border-blue-300',
  MENTOR: 'bg-green-100 text-green-800 border-green-300',
}

export function ProjectsTab({ student }: ProjectsTabProps) {
  // Separate active and completed projects
  const activeProjects = student.projectRoles.filter(
    (p) =>
      p.project.status === 'PLANNING' ||
      p.project.status === 'IN_PROGRESS' ||
      p.project.status === 'TESTING'
  )

  const completedProjects = student.projectRoles.filter(
    (p) => p.project.status === 'COMPLETED' || p.project.status === 'ARCHIVED'
  )

  const totalHours = student.projectRoles.reduce(
    (sum, p) => sum + (p.hoursSpent || 0),
    0
  )

  // Helper to determine role badge color
  const getRoleBadgeColor = (role: string): string => {
    const upperRole = role.toUpperCase()
    if (upperRole.includes('LEAD')) return ROLE_COLORS.LEAD
    if (upperRole.includes('MENTOR')) return ROLE_COLORS.MENTOR
    return ROLE_COLORS.MEMBER
  }

  return (
    <div className="space-y-6">
      {/* Project Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.projectRoles.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {activeProjects.length} active, {completedProjects.length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
            <p className="text-xs text-gray-500 mt-1">Logged across all projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Leadership Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {student.projectRoles.filter((p) => p.role.toUpperCase().includes('LEAD')).length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Lead positions held</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Active Projects</CardTitle>
          <CardDescription>Projects currently in progress</CardDescription>
        </CardHeader>
        <CardContent>
          {activeProjects.length === 0 ? (
            <p className="text-sm text-gray-500">No active projects</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Timeline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeProjects.map((projectRole) => (
                  <TableRow key={projectRole.project.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{projectRole.project.name}</p>
                        {projectRole.project.description && (
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {projectRole.project.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(projectRole.role)} variant="outline">
                        {projectRole.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          PROJECT_CATEGORY_COLORS[
                            projectRole.project.category as keyof typeof PROJECT_CATEGORY_COLORS
                          ]
                        }
                        variant="secondary"
                      >
                        {projectRole.project.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          PROJECT_STATUS_COLORS[
                            projectRole.project.status as keyof typeof PROJECT_STATUS_COLORS
                          ]
                        }
                        variant="secondary"
                      >
                        {projectRole.project.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{projectRole.hoursSpent || 0}</span> hrs
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-gray-500">
                        {projectRole.project.startDate && (
                          <div>
                            Started {format(new Date(projectRole.project.startDate), 'MMM d, yyyy')}
                          </div>
                        )}
                        {projectRole.project.endDate && (
                          <div>
                            Due {format(new Date(projectRole.project.endDate), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Completed Projects */}
      {completedProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Projects</CardTitle>
            <CardDescription>Past projects and contributions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Contributions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedProjects.map((projectRole) => (
                  <TableRow key={projectRole.project.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{projectRole.project.name}</p>
                        {projectRole.project.description && (
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {projectRole.project.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(projectRole.role)} variant="outline">
                        {projectRole.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          PROJECT_CATEGORY_COLORS[
                            projectRole.project.category as keyof typeof PROJECT_CATEGORY_COLORS
                          ]
                        }
                        variant="secondary"
                      >
                        {projectRole.project.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{projectRole.hoursSpent || 0}</span> hrs
                    </TableCell>
                    <TableCell>
                      {projectRole.contributions ? (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {projectRole.contributions}
                        </p>
                      ) : (
                        <span className="text-xs text-gray-400">No contributions noted</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* No Projects Message */}
      {student.projectRoles.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-gray-500">
              No projects assigned yet. Add this student to a project to track their involvement.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
