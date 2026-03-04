'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-helpers'
import {
  createStudentSchema,
  updateStudentSchema,
  studentFilterSchema,
  assignSkillSchema,
  assignTaskSchema,
  type CreateStudentInput,
  type UpdateStudentInput,
  type StudentFilterInput,
  type AssignSkillInput,
  type AssignTaskInput,
} from '@/lib/validations/student'

// Helper to verify coach has access to team
async function verifyTeamAccess(teamId: string, coachId: string) {
  const coach = await prisma.coachProfile.findUnique({
    where: { userId: coachId },
    include: { teams: true },
  })

  if (!coach) {
    throw new Error('Coach profile not found')
  }

  const hasAccess = coach.teams.some((team) => team.id === teamId)
  if (!hasAccess) {
    throw new Error('Unauthorized: You do not have access to this team')
  }

  return coach
}

export async function createStudent(data: CreateStudentInput) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const validatedData = createStudentSchema.parse(data)

    const coach = await prisma.coachProfile.findUnique({
      where: { userId: user.id },
      include: { teams: true },
    })

    if (!coach || coach.teams.length === 0) {
      return { error: 'No team associated with coach' }
    }

    const teamId = coach.teams[0].id

    const student = await prisma.student.create({
      data: {
        ...validatedData,
        teams: {
          create: {
            teamId,
            primaryRole: validatedData.primaryRole || 'BUILDER',
          },
        },
      },
      include: {
        teams: {
          include: {
            team: true,
          },
        },
      },
    })

    revalidatePath('/dashboard/students')
    return { success: true, student }
  } catch (error) {
    console.error('Error creating student:', error)
    return { error: 'Failed to create student' }
  }
}

export async function updateStudent(data: UpdateStudentInput) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const validatedData = updateStudentSchema.parse(data)
    const { id, ...updateData } = validatedData

    // Verify the student belongs to the coach's team
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        teams: {
          include: { team: { include: { coaches: { include: { coach: true } } } } },
        },
      },
    })

    if (!student) {
      return { error: 'Student not found' }
    }

    const hasAccess = student.teams.some((teamMember) =>
      teamMember.team.coaches.some((coach) => coach.coach.userId === user.id)
    )

    if (!hasAccess) {
      return { error: 'Unauthorized: You do not have access to this student' }
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: updateData,
      include: {
        teams: {
          include: {
            team: true,
          },
        },
      },
    })

    revalidatePath('/dashboard/students')
    revalidatePath(`/dashboard/students/${id}`)
    return { success: true, student: updatedStudent }
  } catch (error) {
    console.error('Error updating student:', error)
    return { error: 'Failed to update student' }
  }
}

export async function deleteStudent(studentId: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    // Verify the student belongs to the coach's team
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        teams: {
          include: { team: { include: { coaches: { include: { coach: true } } } } },
        },
      },
    })

    if (!student) {
      return { error: 'Student not found' }
    }

    const hasAccess = student.teams.some((teamMember) =>
      teamMember.team.coaches.some((tc) => tc.coach.userId === user.id)
    )

    if (!hasAccess) {
      return { error: 'Unauthorized: You do not have access to this student' }
    }

    await prisma.student.delete({
      where: { id: studentId },
    })

    revalidatePath('/dashboard/students')
    return { success: true }
  } catch (error) {
    console.error('Error deleting student:', error)
    return { error: 'Failed to delete student' }
  }
}

export async function getStudents(filters?: StudentFilterInput) {
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

    const teamIds = coach.teams.map((team) => team.id)
    const validatedFilters = filters ? studentFilterSchema.parse(filters) : {}

    const where: any = {
      teams: {
        some: {
          teamId: { in: teamIds },
        },
      },
    }

    if (validatedFilters.search) {
      where.OR = [
        { firstName: { contains: validatedFilters.search, mode: 'insensitive' } },
        { lastName: { contains: validatedFilters.search, mode: 'insensitive' } },
        { email: { contains: validatedFilters.search, mode: 'insensitive' } },
      ]
    }

    if (validatedFilters.grade) {
      where.grade = validatedFilters.grade
    }

    if (validatedFilters.role) {
      where.teams = {
        some: {
          teamId: { in: teamIds },
          primaryRole: validatedFilters.role,
        },
      }
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        teams: {
          include: {
            team: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        tasks: {
          include: {
            task: true,
          },
        },
      },
      orderBy: [{ grade: 'desc' }, { lastName: 'asc' }],
    })

    return { success: true, students }
  } catch (error) {
    console.error('Error fetching students:', error)
    return { error: 'Failed to fetch students' }
  }
}

export async function getStudentById(studentId: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        teams: {
          include: {
            team: {
              include: {
                coaches: { include: { coach: true } },
              },
            },
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        tasks: {
          include: {
            task: true,
          },
        },
        projectRoles: {
          include: {
            project: true,
          },
        },
        curriculumProgress: {
          include: {
            module: true,
          },
        },
        reportCards: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!student) {
      return { error: 'Student not found' }
    }

    // Verify access
    const hasAccess = student.teams.some((teamMember) =>
      teamMember.team.coaches.some((tc) => tc.coach.userId === user.id)
    )

    if (!hasAccess) {
      return { error: 'Unauthorized: You do not have access to this student' }
    }

    return { success: true, student }
  } catch (error) {
    console.error('Error fetching student:', error)
    return { error: 'Failed to fetch student' }
  }
}

export async function assignSkillToStudent(data: AssignSkillInput) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const validatedData = assignSkillSchema.parse(data)

    // Verify student access
    const student = await prisma.student.findUnique({
      where: { id: validatedData.studentId },
      include: {
        teams: {
          include: { team: { include: { coaches: { include: { coach: true } } } } },
        },
      },
    })

    if (!student) {
      return { error: 'Student not found' }
    }

    const hasAccess = student.teams.some((teamMember) =>
      teamMember.team.coaches.some((tc) => tc.coach.userId === user.id)
    )

    if (!hasAccess) {
      return { error: 'Unauthorized' }
    }

    const skillAssignment = await prisma.studentSkill.upsert({
      where: {
        studentId_skillId: {
          studentId: validatedData.studentId,
          skillId: validatedData.skillId,
        },
      },
      update: {
        proficiency: validatedData.proficiency,
        notes: validatedData.notes,
      },
      create: {
        student: { connect: { id: validatedData.studentId } },
        skill: { connect: { id: validatedData.skillId } },
        proficiency: validatedData.proficiency,
        notes: validatedData.notes,
      },
    })

    revalidatePath(`/dashboard/students/${validatedData.studentId}`)
    return { success: true, skillAssignment }
  } catch (error) {
    console.error('Error assigning skill:', error)
    return { error: 'Failed to assign skill' }
  }
}

export async function assignTaskToStudent(data: AssignTaskInput) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const validatedData = assignTaskSchema.parse(data)

    // Verify student access
    const student = await prisma.student.findUnique({
      where: { id: validatedData.studentId },
      include: {
        teams: {
          include: { team: { include: { coaches: { include: { coach: true } } } } },
        },
      },
    })

    if (!student) {
      return { error: 'Student not found' }
    }

    const hasAccess = student.teams.some((teamMember) =>
      teamMember.team.coaches.some((tc) => tc.coach.userId === user.id)
    )

    if (!hasAccess) {
      return { error: 'Unauthorized' }
    }

    const taskAssignment = await prisma.taskAssignment.create({
      data: {
        task: { connect: { id: validatedData.taskId } },
        student: { connect: { id: validatedData.studentId } },
      },
    })

    revalidatePath(`/dashboard/students/${validatedData.studentId}`)
    revalidatePath('/dashboard/tasks')
    return { success: true, taskAssignment }
  } catch (error) {
    console.error('Error assigning task:', error)
    return { error: 'Failed to assign task' }
  }
}
