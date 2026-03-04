'use client'
import Link from 'next/link'
import { Student, CurriculumProgress, ProjectRole, Project, CurriculumModule } from '@prisma/client'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Clock } from 'lucide-react'

type StudentWithProgress = Student & {
  curriculumProgress: (CurriculumProgress & { module: CurriculumModule })[]
  projectRoles: (ProjectRole & { project: Project })[]
}

const TOTAL_BOOTCAMP_MILESTONES = 7

export function StudentProgressList({ students }: { students: StudentWithProgress[] }) {
  const getInitials = (firstName: string, lastName: string) =>
    `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()

  const calculateBootcampProgress = (student: StudentWithProgress) => {
    const completed = student.curriculumProgress.filter(
      (p) => p.status === 'COMPLETED' || p.status === 'MASTERED'
    ).length
    return {
      completed,
      total: TOTAL_BOOTCAMP_MILESTONES,
      percentage: Math.round((completed / TOTAL_BOOTCAMP_MILESTONES) * 100),
    }
  }

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'PLANNING':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'TESTING':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No students found. Add students to start tracking progress.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {students.map((student) => {
        const bootcampProgress = calculateBootcampProgress(student)
        const activeProjects = student.projectRoles.filter(
          (role) => role.project && (role.project.status === 'IN_PROGRESS' || role.project.status === 'PLANNING' || role.project.status === 'TESTING')
        )

        return (
          <Link
            key={student.id}
            href={`/dashboard/students/${student.id}/progress`}
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={student.avatar || undefined} />
                    <AvatarFallback className="bg-blue-100 text-blue-800 font-semibold">
                      {getInitials(student.firstName, student.lastName)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-base">
                        {student.firstName} {student.lastName}
                      </h3>
                      {student.grade && (
                        <span className="text-sm text-gray-500">Grade {student.grade}</span>
                      )}
                    </div>

                    {/* Bootcamp Progress */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 max-w-xs">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span className="font-medium">Bootcamp</span>
                          <span>
                            {bootcampProgress.completed}/{bootcampProgress.total} milestones
                          </span>
                        </div>
                        <Progress value={bootcampProgress.percentage} className="h-2" />
                      </div>
                      {bootcampProgress.completed === bootcampProgress.total && (
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      )}
                    </div>

                    {/* Active Projects */}
                    {activeProjects.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-500 font-medium">Projects:</span>
                        {activeProjects.map((role) => (
                          <Badge
                            key={role.id}
                            className={getProjectStatusColor(role.project.status)}
                            variant="outline"
                          >
                            {role.project.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
