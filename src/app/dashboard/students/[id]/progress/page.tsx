import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { StudentProgressDetail } from '@/components/progress/student-progress-detail'
import { getStudentBootcampProgress } from '@/app/actions/progress'

export default async function StudentProgressPage({
  params,
}: {
  params: { id: string }
}) {
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
    <StudentProgressDetail
      student={student}
      bootcampProgress={bootcampProgress}
    />
  )
}
