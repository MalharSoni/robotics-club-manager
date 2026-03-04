'use server'
import { prisma } from '@/lib/prisma'
import { addDays } from 'date-fns'

export async function generateParentShareLink(studentId: string, coachUserId: string) {
  try {
    // Validate student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, firstName: true, lastName: true },
    })

    if (!student) {
      return {
        success: false,
        error: 'Student not found',
      }
    }

    // Check if active token already exists for this student
    const existingToken = await prisma.exportToken.findFirst({
      where: {
        entityType: 'STUDENT_PORTFOLIO',
        entityId: studentId,
        active: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } },
        ],
      },
    })

    // If valid token exists, return it instead of creating duplicate
    if (existingToken) {
      const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/share/${existingToken.token}`
      return {
        success: true,
        shareUrl,
        token: existingToken.token,
        expiresAt: existingToken.expiresAt,
        existing: true,
      }
    }

    // Create new token
    const token = await prisma.exportToken.create({
      data: {
        entityType: 'STUDENT_PORTFOLIO',
        entityId: studentId,
        expiresAt: addDays(new Date(), 90), // 90-day expiry
        purpose: `Parent portfolio gallery for ${student.firstName} ${student.lastName}`,
        createdBy: coachUserId,
        active: true,
      },
    })

    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/share/${token.token}`

    return {
      success: true,
      shareUrl,
      token: token.token,
      expiresAt: token.expiresAt,
      existing: false,
    }
  } catch (error) {
    console.error('Error generating share link:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate share link',
    }
  }
}

export async function getShareLinkForStudent(studentId: string) {
  try {
    const token = await prisma.exportToken.findFirst({
      where: {
        entityType: 'STUDENT_PORTFOLIO',
        entityId: studentId,
        active: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } },
        ],
      },
    })

    if (!token) {
      return {
        success: true,
        exists: false,
      }
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/share/${token.token}`

    return {
      success: true,
      exists: true,
      shareUrl,
      token: token.token,
      expiresAt: token.expiresAt,
      accessCount: token.accessCount,
    }
  } catch (error) {
    console.error('Error fetching share link:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch share link',
    }
  }
}

export async function deactivateShareLink(tokenId: string) {
  try {
    await prisma.exportToken.update({
      where: { id: tokenId },
      data: { active: false },
    })

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error deactivating share link:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deactivate share link',
    }
  }
}
