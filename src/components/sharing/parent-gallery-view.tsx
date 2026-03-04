'use client'
import { Student, ProjectRole, Project, ProjectMedia, ExportToken } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MediaGallery } from '@/components/media/media-gallery'
import { Calendar, Eye, Lock, Image as ImageIcon } from 'lucide-react'
import { format } from 'date-fns'

type StudentWithProjects = Student & {
  projectRoles: (ProjectRole & {
    project: Project & {
      media: ProjectMedia[]
    }
  })[]
}

export function ParentGalleryView({
  student,
  token,
}: {
  student: StudentWithProjects
  token: ExportToken
}) {
  const getInitials = (firstName: string, lastName: string) =>
    `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()

  const getProjectStatusBadge = (status: string) => {
    const variants = {
      PLANNING: 'bg-gray-100 text-gray-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      TESTING: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
    }
    return variants[status as keyof typeof variants] || variants.PLANNING
  }

  const totalMedia = student.projectRoles.reduce(
    (sum, role) => sum + role.project.media.length,
    0
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={student.avatar || undefined} />
              <AvatarFallback className="bg-blue-100 text-blue-800 font-semibold text-xl">
                {getInitials(student.firstName, student.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                {student.firstName} {student.lastName}'s Portfolio
              </h1>
              <p className="text-gray-600">
                CautionTape Robotics Club Project Gallery
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <ImageIcon className="h-4 w-4" />
              <span>
                {totalMedia} {totalMedia === 1 ? 'file' : 'files'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>Viewed {token.accessCount} times</span>
            </div>
            {token.expiresAt && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Expires {format(new Date(token.expiresAt), 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Projects */}
        {student.projectRoles.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-gray-500">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No projects to display yet.</p>
                <p className="text-sm mt-1">
                  Projects will appear here as {student.firstName} works on them.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {student.projectRoles.map((role) => (
              <Card key={role.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{role.project.name}</CardTitle>
                      {role.project.description && (
                        <CardDescription className="mt-2">
                          {role.project.description}
                        </CardDescription>
                      )}
                    </div>
                    <Badge className={getProjectStatusBadge(role.project.status)}>
                      {role.project.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                    <div>
                      <strong>Role:</strong> {role.role}
                    </div>
                    {role.project.startDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Started {format(new Date(role.project.startDate), 'MMM d, yyyy')}
                      </div>
                    )}
                    <div>
                      {role.project.media.length} {role.project.media.length === 1 ? 'file' : 'files'}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {role.project.media.length > 0 ? (
                    <MediaGallery media={role.project.media} />
                  ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No documentation uploaded yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t text-center text-sm text-gray-500">
          <div className="flex items-center justify-center gap-1 mb-2">
            <Lock className="h-4 w-4" />
            <span>Secure read-only link</span>
          </div>
          <p>
            This link was created for parent/guardian viewing. If you have questions about this portfolio, please contact the student's coach.
          </p>
        </div>
      </div>
    </div>
  )
}
