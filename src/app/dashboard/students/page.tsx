import { prisma } from '@/lib/prisma'
import { StudentProgressList } from '@/components/progress/student-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function StudentsPage() {
  // Fetch all active students with progress and project data
  const students = await prisma.student.findMany({
    where: { active: true },
    include: {
      curriculumProgress: {
        where: {
          module: {
            order: { gte: 1, lte: 7 }, // Bootcamp milestones only
          },
        },
        include: {
          module: true,
        },
      },
      projectRoles: {
        include: {
          project: {
            where: {
              status: { in: ['PLANNING', 'IN_PROGRESS', 'TESTING'] },
            },
          },
        },
      },
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Progress Tracking</CardTitle>
          <p className="text-sm text-gray-600">
            View bootcamp completion and portfolio project progress for all students
          </p>
        </CardHeader>
        <CardContent>
          <StudentProgressList students={students} />
        </CardContent>
      </Card>
    </div>
  )
}
