'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-helpers'
import {
  createSkillSchema,
  updateSkillSchema,
  assessmentSchema,
  bulkAssessmentSchema,
  skillFilterSchema,
  type CreateSkillInput,
  type UpdateSkillInput,
  type AssessmentInput,
  type BulkAssessmentInput,
  type SkillFilterInput,
} from '@/lib/validations/skill'
import { SkillCategory, SkillLevel } from '@prisma/client'

// Helper to verify coach has access
async function verifyCoachAccess(userId: string) {
  const coach = await prisma.coachProfile.findUnique({
    where: { userId },
    include: { teams: true },
  })

  if (!coach) {
    throw new Error('Coach profile not found')
  }

  return coach
}

// Helper to verify team access
async function verifyTeamAccess(teamId: string, coachId: string) {
  const coach = await verifyCoachAccess(coachId)

  const hasAccess = coach.teams.some((team) => team.teamId === teamId)
  if (!hasAccess) {
    throw new Error('Unauthorized: You do not have access to this team')
  }

  return coach
}

export async function getSkills(filters?: SkillFilterInput) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const validatedFilters = filters ? skillFilterSchema.parse(filters) : {}

    const where: any = {
      active: true,
    }

    if (validatedFilters.category) {
      where.category = validatedFilters.category
    }

    if (validatedFilters.search) {
      where.OR = [
        { name: { contains: validatedFilters.search, mode: 'insensitive' } },
        { description: { contains: validatedFilters.search, mode: 'insensitive' } },
      ]
    }

    const skills = await prisma.skill.findMany({
      where,
      include: {
        students: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          where: validatedFilters.verified !== undefined
            ? { verified: validatedFilters.verified }
            : undefined,
        },
        _count: {
          select: { students: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    // Calculate stats for each skill
    const skillsWithStats = skills.map((skill) => {
      const studentSkills = skill.students
      const totalStudents = studentSkills.length

      const proficiencyCount = {
        BEGINNER: studentSkills.filter((s) => s.proficiency === 'BEGINNER').length,
        INTERMEDIATE: studentSkills.filter((s) => s.proficiency === 'INTERMEDIATE').length,
        ADVANCED: studentSkills.filter((s) => s.proficiency === 'ADVANCED').length,
        EXPERT: studentSkills.filter((s) => s.proficiency === 'EXPERT').length,
      }

      const proficiencyValues = {
        BEGINNER: 1,
        INTERMEDIATE: 2,
        ADVANCED: 3,
        EXPERT: 4,
      }

      const avgProficiency = totalStudents > 0
        ? studentSkills.reduce((sum, s) => sum + proficiencyValues[s.proficiency], 0) / totalStudents
        : 0

      const verifiedCount = studentSkills.filter((s) => s.verified).length

      return {
        ...skill,
        stats: {
          totalStudents,
          avgProficiency: Number(avgProficiency.toFixed(2)),
          proficiencyDistribution: proficiencyCount,
          verifiedCount,
        },
      }
    })

    // Apply proficiency filter if specified
    let filteredSkills = skillsWithStats
    if (validatedFilters.proficiency) {
      filteredSkills = skillsWithStats.filter((skill) =>
        skill.students.some((s) => s.proficiency === validatedFilters.proficiency)
      )
    }

    return { skills: filteredSkills }
  } catch (error) {
    console.error('Error fetching skills:', error)
    return { error: 'Failed to fetch skills' }
  }
}

export async function getSkillById(id: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const skill = await prisma.skill.findUnique({
      where: { id },
      include: {
        students: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
                grade: true,
                teams: {
                  include: {
                    team: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: [
            { proficiency: 'desc' },
            { updatedAt: 'desc' },
          ],
        },
      },
    })

    if (!skill) {
      return { error: 'Skill not found' }
    }

    return { skill }
  } catch (error) {
    console.error('Error fetching skill:', error)
    return { error: 'Failed to fetch skill details' }
  }
}

export async function createSkill(data: CreateSkillInput) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    await verifyCoachAccess(user.id)

    const validatedData = createSkillSchema.parse(data)

    // Check if skill already exists
    const existing = await prisma.skill.findFirst({
      where: {
        name: { equals: validatedData.name, mode: 'insensitive' },
      },
    })

    if (existing) {
      return { error: 'A skill with this name already exists' }
    }

    const skill = await prisma.skill.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        category: validatedData.category,
        icon: validatedData.icon,
        color: validatedData.color,
      },
    })

    revalidatePath('/dashboard/skills')
    return { skill, success: 'Skill created successfully' }
  } catch (error) {
    console.error('Error creating skill:', error)
    return { error: 'Failed to create skill' }
  }
}

export async function updateSkill(data: UpdateSkillInput) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    await verifyCoachAccess(user.id)

    const validatedData = updateSkillSchema.parse(data)
    const { id, ...updateData } = validatedData

    // Check if another skill has the same name
    if (updateData.name) {
      const existing = await prisma.skill.findFirst({
        where: {
          name: { equals: updateData.name, mode: 'insensitive' },
          id: { not: id },
        },
      })

      if (existing) {
        return { error: 'A skill with this name already exists' }
      }
    }

    const skill = await prisma.skill.update({
      where: { id },
      data: updateData,
    })

    revalidatePath('/dashboard/skills')
    return { skill, success: 'Skill updated successfully' }
  } catch (error) {
    console.error('Error updating skill:', error)
    return { error: 'Failed to update skill' }
  }
}

export async function deleteSkill(id: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    await verifyCoachAccess(user.id)

    // Soft delete by marking as inactive
    await prisma.skill.update({
      where: { id },
      data: { active: false },
    })

    revalidatePath('/dashboard/skills')
    return { success: 'Skill deleted successfully' }
  } catch (error) {
    console.error('Error deleting skill:', error)
    return { error: 'Failed to delete skill' }
  }
}

export async function assessStudentSkill(data: AssessmentInput) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const coach = await verifyCoachAccess(user.id)
    const validatedData = assessmentSchema.parse(data)

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: validatedData.studentId },
    })

    if (!student) {
      return { error: 'Student not found' }
    }

    // Verify skill exists
    const skill = await prisma.skill.findUnique({
      where: { id: validatedData.skillId },
    })

    if (!skill) {
      return { error: 'Skill not found' }
    }

    // Upsert student skill assessment
    const studentSkill = await prisma.studentSkill.upsert({
      where: {
        studentId_skillId: {
          studentId: validatedData.studentId,
          skillId: validatedData.skillId,
        },
      },
      update: {
        proficiency: validatedData.proficiency,
        notes: validatedData.notes,
        verified: validatedData.verified,
        verifiedAt: validatedData.verified ? new Date() : null,
        evidenceUrl: validatedData.evidenceUrl,
        updatedAt: new Date(),
      },
      create: {
        studentId: validatedData.studentId,
        skillId: validatedData.skillId,
        proficiency: validatedData.proficiency,
        notes: validatedData.notes,
        verified: validatedData.verified,
        verifiedAt: validatedData.verified ? new Date() : null,
        evidenceUrl: validatedData.evidenceUrl,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        skill: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    revalidatePath('/dashboard/skills')
    revalidatePath(`/dashboard/students/${validatedData.studentId}`)
    return { studentSkill, success: 'Skill assessment recorded successfully' }
  } catch (error) {
    console.error('Error assessing student skill:', error)
    return { error: 'Failed to record skill assessment' }
  }
}

export async function bulkAssessSkills(data: BulkAssessmentInput) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    await verifyCoachAccess(user.id)
    const validatedData = bulkAssessmentSchema.parse(data)

    const results = []

    for (const assessment of validatedData.assessments) {
      const result = await assessStudentSkill(assessment)
      if (result.error) {
        results.push({ ...assessment, error: result.error })
      } else {
        results.push({ ...assessment, success: true })
      }
    }

    const successCount = results.filter((r) => 'success' in r && r.success).length
    const errorCount = results.filter((r) => 'error' in r && r.error).length

    revalidatePath('/dashboard/skills')
    return {
      results,
      success: `${successCount} assessments recorded successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
    }
  } catch (error) {
    console.error('Error bulk assessing skills:', error)
    return { error: 'Failed to record bulk assessments' }
  }
}

export async function getSkillsByCategory(category: SkillCategory) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const skills = await prisma.skill.findMany({
      where: {
        category,
        active: true,
      },
      include: {
        students: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return { skills }
  } catch (error) {
    console.error('Error fetching skills by category:', error)
    return { error: 'Failed to fetch skills' }
  }
}

export async function getTeamProficiencyStats(teamId: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    await verifyTeamAccess(teamId, user.id)

    // Get all students on the team
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        teamId,
        active: true,
      },
      include: {
        student: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
      },
    })

    const totalStudents = teamMembers.length
    const allSkillAssessments = teamMembers.flatMap((m) => m.student.skills)

    // Calculate stats
    const totalSkills = new Set(allSkillAssessments.map((s) => s.skillId)).size

    const expertCount = allSkillAssessments.filter((s) => s.proficiency === 'EXPERT').length

    const proficiencyValues = {
      BEGINNER: 1,
      INTERMEDIATE: 2,
      ADVANCED: 3,
      EXPERT: 4,
    }

    const avgProficiency = allSkillAssessments.length > 0
      ? allSkillAssessments.reduce((sum, s) => sum + proficiencyValues[s.proficiency], 0) / allSkillAssessments.length
      : 0

    // Get skills added this season (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const recentSkills = await prisma.skill.count({
      where: {
        createdAt: { gte: sixMonthsAgo },
        active: true,
      },
    })

    // Category breakdown
    const categoryStats = await prisma.skill.groupBy({
      by: ['category'],
      where: { active: true },
      _count: { category: true },
    })

    return {
      stats: {
        totalSkills,
        avgTeamProficiency: Number(avgProficiency.toFixed(2)),
        skillsAddedThisSeason: recentSkills,
        studentsAtExpertLevel: expertCount,
        totalStudents,
        categoryBreakdown: categoryStats.map((c) => ({
          category: c.category,
          count: c._count.category,
        })),
      },
    }
  } catch (error) {
    console.error('Error fetching team proficiency stats:', error)
    return { error: 'Failed to fetch team stats' }
  }
}

export async function getStudentSkills(studentId: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const skills = await prisma.studentSkill.findMany({
      where: { studentId },
      include: {
        skill: true,
      },
      orderBy: [
        { proficiency: 'desc' },
        { updatedAt: 'desc' },
      ],
    })

    return { skills }
  } catch (error) {
    console.error('Error fetching student skills:', error)
    return { error: 'Failed to fetch student skills' }
  }
}
