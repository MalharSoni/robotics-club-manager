import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ParentGalleryView } from '@/components/sharing/parent-gallery-view'

export default async function SharedGalleryPage({
  params,
}: {
  params: { token: string }
}) {
  // Validate token
  const exportToken = await prisma.exportToken.findUnique({
    where: {
      token: params.token,
    },
  })

  // Check if token is valid and active
  if (
    !exportToken ||
    !exportToken.active ||
    exportToken.entityType !== 'STUDENT_PORTFOLIO' ||
    (exportToken.expiresAt && exportToken.expiresAt < new Date())
  ) {
    notFound()
  }

  // Increment access count and update last accessed
  await prisma.exportToken.update({
    where: { id: exportToken.id },
    data: {
      accessCount: { increment: 1 },
      lastAccessedAt: new Date(),
    },
  })

  // Fetch student data with projects and media
  const student = await prisma.student.findUnique({
    where: { id: exportToken.entityId },
    include: {
      projectRoles: {
        include: {
          project: {
            include: {
              media: {
                orderBy: { uploadedAt: 'asc' },
              },
            },
          },
        },
        where: {
          project: {
            status: { notIn: ['ARCHIVED'] }, // Don't show archived projects
          },
        },
      },
    },
  })

  if (!student) {
    notFound()
  }

  return (
    <ParentGalleryView
      student={student}
      token={exportToken}
    />
  )
}
