'use client'

import Link from 'next/link'
import { Project, Team, Season, Student, ProjectRole } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, Users, Target, Clock } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

type ProjectWithRelations = Project & {
  team: Team & {
    season: Season | null
  }
  roles: Array<
    ProjectRole & {
      student: Student
    }
  >
}

interface ProjectCardProps {
  project: ProjectWithRelations
}

export function ProjectCard({ project }: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNING':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'TESTING':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'ARCHIVED':
        return 'bg-slate-100 text-slate-600 border-slate-300'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ROBOT':
        return 'bg-orange-100 text-orange-800'
      case 'MECHANISM':
        return 'bg-blue-100 text-blue-800'
      case 'AUTONOMOUS':
        return 'bg-purple-100 text-purple-800'
      case 'OUTREACH':
        return 'bg-green-100 text-green-800'
      case 'FUNDRAISING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace('_', ' ')
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  const leadMembers = project.roles.filter((role) => role.role.toUpperCase().includes('LEAD'))
  const totalMembers = project.roles.length
  const totalHours = project.roles.reduce((sum, role) => sum + (role.hoursSpent || 0), 0)

  const daysUntilEnd = project.endDate
    ? Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <Link href={`/dashboard/projects/${project.id}`}>
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex gap-2 flex-wrap">
              <Badge className={getStatusColor(project.status)}>
                {formatStatus(project.status)}
              </Badge>
              <Badge variant="outline" className={getCategoryColor(project.category)}>
                {project.category}
              </Badge>
            </div>
            {project.team.season && (
              <Badge variant="secondary" className="text-xs">
                {project.team.season.name}
              </Badge>
            )}
          </div>
          <CardTitle className="text-xl line-clamp-1">{project.name}</CardTitle>
          <CardDescription className="line-clamp-2 min-h-[2.5rem]">
            {project.description || 'No description'}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Goals Summary */}
            {project.goals && project.goals.length > 0 && (
              <div className="flex items-start gap-2 text-sm">
                <Target className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-gray-500">Goals:</span>
                  <span className="ml-1 font-medium">{project.goals.length}</span>
                </div>
              </div>
            )}

            {/* Timeline */}
            {(project.startDate || project.endDate) && (
              <div className="flex items-start gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  {project.startDate && (
                    <div className="text-gray-700">
                      <span className="text-gray-500">Start:</span>
                      <span className="ml-1">{format(new Date(project.startDate), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  {project.endDate && (
                    <div className="text-gray-700">
                      <span className="text-gray-500">End:</span>
                      <span className="ml-1">{format(new Date(project.endDate), 'MMM d, yyyy')}</span>
                      {daysUntilEnd !== null && daysUntilEnd > 0 && (
                        <span className="ml-1 text-xs text-gray-500">
                          ({daysUntilEnd}d left)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Team Members */}
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <div className="flex items-center gap-2 flex-1">
                <div className="flex -space-x-2">
                  {project.roles.slice(0, 3).map((role) => (
                    <Avatar key={role.id} className="h-8 w-8 border-2 border-white">
                      <AvatarFallback className="bg-blue-600 text-white text-xs">
                        {getInitials(role.student.firstName, role.student.lastName)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-gray-700">
                  {totalMembers} {totalMembers === 1 ? 'member' : 'members'}
                  {leadMembers.length > 0 && (
                    <span className="text-gray-500 ml-1">
                      ({leadMembers.length} lead{leadMembers.length > 1 ? 's' : ''})
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Hours Logged */}
            {totalHours > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <div>
                  <span className="text-gray-700 font-medium">{totalHours.toFixed(1)}</span>
                  <span className="text-gray-500 ml-1">hours logged</span>
                </div>
              </div>
            )}
          </div>

          {/* Updated timestamp */}
          <div className="mt-4 pt-3 border-t text-xs text-gray-500">
            Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
