import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { StudentProgressDetail } from '@/components/progress/student-progress-detail'
import { getStudentBootcampProgress } from '@/app/actions/progress'
import { ShareLinkManager } from '@/components/progress/share-link-manager'
import { auth } from '@/lib/auth'

export default async function StudentProgressPage({
  params,
}: {
  params: { id: string }
}) {
  // Get current user from auth
  const session = await auth()
  const coachUserId = session?.user?.id

  // Fetch student data
  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: {
      projectRoles: {
        include: {
          project: {
            include: {
              media: {
                orderBy: { order: 'asc' },
                take: 10, // Show first 10 media items per project
              },
            },
          },
        },
        where: {
          project: {
            status: { notIn: ['ARCHIVED'] }, // Exclude archived projects
          },
        },
      },
    },
  })

  if (!student) {
    notFound()
  }

  // Fetch bootcamp progress
  const bootcampProgress = await getStudentBootcampProgress(student.id)

  return (
    <div className="space-y-6">
      <StudentProgressDetail
        student={student}
        bootcampProgress={bootcampProgress}
      />

      {/* Parent Share Link Manager - only show if coach is authenticated */}
      {coachUserId && (
        <div className="max-w-5xl">
          <ShareLinkManager
            studentId={student.id}
            studentName={`${student.firstName} ${student.lastName}`}
            coachUserId={coachUserId}
          />
        </div>
      )}
    </div>
  )
}
