'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-helpers'
import {
  createReportCardSchema,
  updateReportCardSchema,
  bulkCreateReportCardsSchema,
  publishReportCardSchema,
  reportCardFilterSchema,
  sendReportCardSchema,
  type CreateReportCardInput,
  type UpdateReportCardInput,
  type BulkCreateReportCardsInput,
  type PublishReportCardInput,
  type ReportCardFilterInput,
  type SendReportCardInput,
} from '@/lib/validations/report-card'

// Helper to verify coach has access to team
async function verifyTeamAccess(teamId: string, userId: string) {
  const coach = await prisma.coachProfile.findUnique({
    where: { userId },
    include: { teams: true },
  })

  if (!coach) {
    throw new Error('Coach profile not found')
  }

  const hasAccess = coach.teams.some((tc) => tc.teamId === teamId)
  if (!hasAccess) {
    throw new Error('Unauthorized: You do not have access to this team')
  }

  return coach
}

// Get all report cards with filters
export async function getReportCards(filters?: ReportCardFilterInput) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const coach = await prisma.coachProfile.findUnique({
      where: { userId: user.id },
      include: { teams: true },
    })

    if (!coach || coach.teams.length === 0) {
      return { error: 'No team associated with coach' }
    }

    const teamIds = coach.teams.map((tc) => tc.teamId)
    const validatedFilters = filters ? reportCardFilterSchema.parse(filters) : {}

    const where: any = {
      teamId: { in: teamIds },
    }

    if (validatedFilters.studentId) {
      where.studentId = validatedFilters.studentId
    }

    if (validatedFilters.periodName) {
      where.periodName = { contains: validatedFilters.periodName, mode: 'insensitive' }
    }

    if (validatedFilters.published !== undefined) {
      where.published = validatedFilters.published
    }

    if (validatedFilters.search) {
      where.OR = [
        { student: { firstName: { contains: validatedFilters.search, mode: 'insensitive' } } },
        { student: { lastName: { contains: validatedFilters.search, mode: 'insensitive' } } },
        { periodName: { contains: validatedFilters.search, mode: 'insensitive' } },
      ]
    }

    const reportCards = await prisma.reportCard.findMany({
      where,
      include: {
        student: {
          include: {
            teams: {
              include: {
                team: true,
              },
            },
          },
        },
        team: true,
      },
      orderBy: [
        { endDate: 'desc' },
        { student: { lastName: 'asc' } },
      ],
    })

    // Get summary statistics
    const totalReports = reportCards.length
    const publishedReports = reportCards.filter((rc) => rc.published).length
    const draftReports = reportCards.filter((rc) => !rc.published).length

    // Calculate average attendance
    const attendanceValues = reportCards
      .filter((rc) => rc.attendance !== null)
      .map((rc) => rc.attendance!)
    const avgAttendance =
      attendanceValues.length > 0
        ? attendanceValues.reduce((a, b) => a + b, 0) / attendanceValues.length
        : 0

    return {
      success: true,
      reportCards,
      stats: {
        totalReports,
        publishedReports,
        draftReports,
        avgAttendance: Math.round(avgAttendance),
      },
    }
  } catch (error) {
    console.error('Error fetching report cards:', error)
    return { error: 'Failed to fetch report cards' }
  }
}

// Get report card by ID
export async function getReportCardById(id: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const reportCard = await prisma.reportCard.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            teams: {
              include: {
                team: true,
              },
            },
          },
        },
        team: {
          include: {
            coaches: true,
          },
        },
      },
    })

    if (!reportCard) {
      return { error: 'Report card not found' }
    }

    // Verify access
    const hasAccess = reportCard.team.coaches.some((tc) => tc.coachId === user.id)
    if (!hasAccess) {
      return { error: 'Unauthorized: You do not have access to this report card' }
    }

    return { success: true, reportCard }
  } catch (error) {
    console.error('Error fetching report card:', error)
    return { error: 'Failed to fetch report card' }
  }
}

// Create report card
export async function createReportCard(data: CreateReportCardInput) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const validatedData = createReportCardSchema.parse(data)

    // Verify team access
    await verifyTeamAccess(validatedData.teamId, user.id)

    // Check if report card already exists for this period
    const existing = await prisma.reportCard.findUnique({
      where: {
        studentId_teamId_periodName: {
          studentId: validatedData.studentId,
          teamId: validatedData.teamId,
          periodName: validatedData.periodName,
        },
      },
    })

    if (existing) {
      return { error: 'Report card already exists for this student and period' }
    }

    const reportCard = await prisma.reportCard.create({
      data: {
        studentId: validatedData.studentId,
        teamId: validatedData.teamId,
        periodName: validatedData.periodName,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        technicalSkills: validatedData.technicalSkills,
        teamwork: validatedData.teamwork,
        leadership: validatedData.leadership,
        communication: validatedData.communication,
        problemSolving: validatedData.problemSolving,
        initiative: validatedData.initiative,
        attendance: validatedData.attendance,
        strengths: validatedData.strengths,
        areasForGrowth: validatedData.areasForGrowth,
        coachComments: validatedData.coachComments,
        goals: validatedData.goals,
        overallGrade: validatedData.overallGrade,
      },
      include: {
        student: true,
        team: true,
      },
    })

    revalidatePath('/dashboard/reports')
    return { success: true, reportCard }
  } catch (error) {
    console.error('Error creating report card:', error)
    return { error: 'Failed to create report card' }
  }
}

// Update report card
export async function updateReportCard(data: UpdateReportCardInput) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const validatedData = updateReportCardSchema.parse(data)
    const { id, ...updateData } = validatedData

    // Verify access
    const reportCard = await prisma.reportCard.findUnique({
      where: { id },
      include: {
        team: {
          include: {
            coaches: true,
          },
        },
      },
    })

    if (!reportCard) {
      return { error: 'Report card not found' }
    }

    const hasAccess = reportCard.team.coaches.some((tc) => tc.coachId === user.id)
    if (!hasAccess) {
      return { error: 'Unauthorized' }
    }

    // Don't allow editing published reports unless unpublishing
    if (reportCard.published) {
      return { error: 'Cannot edit a published report card. Unpublish it first.' }
    }

    const updatedReportCard = await prisma.reportCard.update({
      where: { id },
      data: updateData,
      include: {
        student: true,
        team: true,
      },
    })

    revalidatePath('/dashboard/reports')
    revalidatePath(`/dashboard/reports/${id}`)
    return { success: true, reportCard: updatedReportCard }
  } catch (error) {
    console.error('Error updating report card:', error)
    return { error: 'Failed to update report card' }
  }
}

// Publish report card
export async function publishReportCard(data: PublishReportCardInput) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const validatedData = publishReportCardSchema.parse(data)

    // Verify access
    const reportCard = await prisma.reportCard.findUnique({
      where: { id: validatedData.id },
      include: {
        team: {
          include: {
            coaches: true,
          },
        },
      },
    })

    if (!reportCard) {
      return { error: 'Report card not found' }
    }

    const hasAccess = reportCard.team.coaches.some((tc) => tc.coachId === user.id)
    if (!hasAccess) {
      return { error: 'Unauthorized' }
    }

    // Validate required fields before publishing
    if (!reportCard.technicalSkills || !reportCard.teamwork) {
      return { error: 'Please complete all required ratings before publishing' }
    }

    const updatedReportCard = await prisma.reportCard.update({
      where: { id: validatedData.id },
      data: {
        published: true,
        publishedAt: new Date(),
      },
      include: {
        student: true,
        team: true,
      },
    })

    revalidatePath('/dashboard/reports')
    revalidatePath(`/dashboard/reports/${validatedData.id}`)
    return { success: true, reportCard: updatedReportCard }
  } catch (error) {
    console.error('Error publishing report card:', error)
    return { error: 'Failed to publish report card' }
  }
}

// Unpublish report card
export async function unpublishReportCard(id: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    // Verify access
    const reportCard = await prisma.reportCard.findUnique({
      where: { id },
      include: {
        team: {
          include: {
            coaches: true,
          },
        },
      },
    })

    if (!reportCard) {
      return { error: 'Report card not found' }
    }

    const hasAccess = reportCard.team.coaches.some((tc) => tc.coachId === user.id)
    if (!hasAccess) {
      return { error: 'Unauthorized' }
    }

    const updatedReportCard = await prisma.reportCard.update({
      where: { id },
      data: {
        published: false,
        publishedAt: null,
      },
      include: {
        student: true,
        team: true,
      },
    })

    revalidatePath('/dashboard/reports')
    revalidatePath(`/dashboard/reports/${id}`)
    return { success: true, reportCard: updatedReportCard }
  } catch (error) {
    console.error('Error unpublishing report card:', error)
    return { error: 'Failed to unpublish report card' }
  }
}

// Bulk create report cards
export async function bulkCreateReportCards(data: BulkCreateReportCardsInput) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const validatedData = bulkCreateReportCardsSchema.parse(data)

    // Verify team access
    await verifyTeamAccess(validatedData.teamId, user.id)

    // Verify all students belong to the team
    const students = await prisma.student.findMany({
      where: {
        id: { in: validatedData.studentIds },
        teams: {
          some: {
            teamId: validatedData.teamId,
          },
        },
      },
    })

    if (students.length !== validatedData.studentIds.length) {
      return { error: 'Some students do not belong to this team' }
    }

    // Check for existing report cards
    const existing = await prisma.reportCard.findMany({
      where: {
        studentId: { in: validatedData.studentIds },
        teamId: validatedData.teamId,
        periodName: validatedData.periodName,
      },
    })

    if (existing.length > 0) {
      return {
        error: `${existing.length} report card(s) already exist for this period. Please remove them first or choose different students.`,
      }
    }

    // Create report cards
    const reportCards = await prisma.$transaction(
      validatedData.studentIds.map((studentId) =>
        prisma.reportCard.create({
          data: {
            studentId,
            teamId: validatedData.teamId,
            periodName: validatedData.periodName,
            startDate: validatedData.startDate,
            endDate: validatedData.endDate,
            ...(validatedData.templateRatings || {}),
          },
          include: {
            student: true,
            team: true,
          },
        })
      )
    )

    revalidatePath('/dashboard/reports')
    return { success: true, reportCards, count: reportCards.length }
  } catch (error) {
    console.error('Error bulk creating report cards:', error)
    return { error: 'Failed to create report cards' }
  }
}

// Delete report card
export async function deleteReportCard(id: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    // Verify access
    const reportCard = await prisma.reportCard.findUnique({
      where: { id },
      include: {
        team: {
          include: {
            coaches: true,
          },
        },
      },
    })

    if (!reportCard) {
      return { error: 'Report card not found' }
    }

    const hasAccess = reportCard.team.coaches.some((tc) => tc.coachId === user.id)
    if (!hasAccess) {
      return { error: 'Unauthorized' }
    }

    // Don't allow deleting published reports
    if (reportCard.published) {
      return { error: 'Cannot delete a published report card. Unpublish it first.' }
    }

    await prisma.reportCard.delete({
      where: { id },
    })

    revalidatePath('/dashboard/reports')
    return { success: true }
  } catch (error) {
    console.error('Error deleting report card:', error)
    return { error: 'Failed to delete report card' }
  }
}

// Send report card (placeholder for email functionality)
export async function sendReportCard(data: SendReportCardInput) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const validatedData = sendReportCardSchema.parse(data)

    // Verify access
    const reportCard = await prisma.reportCard.findUnique({
      where: { id: validatedData.id },
      include: {
        student: true,
        team: {
          include: {
            coaches: true,
          },
        },
      },
    })

    if (!reportCard) {
      return { error: 'Report card not found' }
    }

    const hasAccess = reportCard.team.coaches.some((tc) => tc.coachId === user.id)
    if (!hasAccess) {
      return { error: 'Unauthorized' }
    }

    // Only send published reports
    if (!reportCard.published) {
      return { error: 'Report card must be published before sending' }
    }

    // TODO: Implement actual email sending
    // For now, just return success
    console.log('Sending report card to:', validatedData.recipientEmail)
    console.log('Student:', reportCard.student.firstName, reportCard.student.lastName)
    console.log('Message:', validatedData.message)

    return {
      success: true,
      message: `Report card sent to ${validatedData.recipientEmail}`,
    }
  } catch (error) {
    console.error('Error sending report card:', error)
    return { error: 'Failed to send report card' }
  }
}

// Generate PDF (placeholder)
export async function generateReportCardPDF(id: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    // Verify access and get report card
    const reportCard = await prisma.reportCard.findUnique({
      where: { id },
      include: {
        student: true,
        team: {
          include: {
            coaches: true,
          },
        },
      },
    })

    if (!reportCard) {
      return { error: 'Report card not found' }
    }

    const hasAccess = reportCard.team.coaches.some((tc) => tc.coachId === user.id)
    if (!hasAccess) {
      return { error: 'Unauthorized' }
    }

    // TODO: Implement actual PDF generation
    // For now, just return success with a placeholder URL
    console.log('Generating PDF for report card:', id)

    return {
      success: true,
      message: 'PDF generation not yet implemented. Use browser print for now.',
    }
  } catch (error) {
    console.error('Error generating PDF:', error)
    return { error: 'Failed to generate PDF' }
  }
}
