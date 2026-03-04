import { notFound } from 'next/navigation'
import { getStudentById } from '@/app/actions/students'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProfileTabs } from '@/components/students/profile-tabs'
import { Mail, Phone, User, Calendar, GraduationCap, Users, Edit } from 'lucide-react'
import Link from 'next/link'

interface StudentProfilePageProps {
  params: {
    id: string
  }
}

export default async function StudentProfilePage({ params }: StudentProfilePageProps) {
  const result = await getStudentById(params.id)

  if ('error' in result || !result.student) {
    notFound()
  }

  const { student } = result

  // Get initials for avatar fallback
  const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase()

  // Calculate current grade year suffix
  const getGradeSuffix = (grade: number) => {
    if (grade === 11) return 'th'
    if (grade === 12) return 'th'
    const lastDigit = grade % 10
    if (lastDigit === 1) return 'st'
    if (lastDigit === 2) return 'nd'
    if (lastDigit === 3) return 'rd'
    return 'th'
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <Link
          href="/dashboard/students"
          className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block"
        >
          ← Back to Students
        </Link>
        <h1 className="text-3xl font-bold">Student Profile</h1>
        <p className="text-gray-500">View and manage student details</p>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar Section */}
            <div className="flex-shrink-0">
              <Avatar className="h-32 w-32">
                <AvatarImage src={student.avatar || undefined} alt={`${student.firstName} ${student.lastName}`} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
            </div>

            {/* Info Section */}
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {student.firstName} {student.lastName}
                  </h2>
                  {student.bio && <p className="text-gray-600 mt-1">{student.bio}</p>}
                </div>
                <Link href={`/dashboard/students/${student.id}/edit`}>
                  <Button>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </div>

              {/* Contact and Academic Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Info */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase">Contact Info</h3>
                  {student.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <a href={`mailto:${student.email}`} className="text-blue-600 hover:underline">
                        {student.email}
                      </a>
                    </div>
                  )}
                  {student.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <a href={`tel:${student.phone}`} className="text-blue-600 hover:underline">
                        {student.phone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Academic Info */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase">Academic Info</h3>
                  {student.grade && (
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="h-4 w-4 text-gray-500" />
                      <span>
                        {student.grade}
                        {getGradeSuffix(student.grade)} Grade
                      </span>
                    </div>
                  )}
                  {student.gradYear && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Class of {student.gradYear}</span>
                    </div>
                  )}
                </div>

                {/* Parent Contact (if available) */}
                {(student.parentName || student.parentEmail || student.parentPhone) && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase">Parent/Guardian</h3>
                    {student.parentName && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{student.parentName}</span>
                      </div>
                    )}
                    {student.parentEmail && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <a
                          href={`mailto:${student.parentEmail}`}
                          className="text-blue-600 hover:underline"
                        >
                          {student.parentEmail}
                        </a>
                      </div>
                    )}
                    {student.parentPhone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <a
                          href={`tel:${student.parentPhone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {student.parentPhone}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Team Memberships */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase">Team Memberships</h3>
                  {student.teams.length === 0 ? (
                    <p className="text-sm text-gray-500">Not assigned to any team</p>
                  ) : (
                    <div className="space-y-1">
                      {student.teams.map((teamMember) => (
                        <div key={teamMember.team.id} className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{teamMember.team.name}</span>
                            {teamMember.team.teamNumber && (
                              <span className="text-xs text-gray-500">
                                ({teamMember.team.teamNumber})
                              </span>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {teamMember.primaryRole.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Active Status */}
              <div className="pt-2">
                <Badge className={student.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} variant="outline">
                  {student.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <ProfileTabs student={student} />
    </div>
  )
}
