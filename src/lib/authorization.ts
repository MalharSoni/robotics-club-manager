/**
 * Authorization helpers for server actions
 * Implements row-level security for students and teams
 */

import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-helpers'
import { UnauthorizedError, ForbiddenError, NotFoundError } from '@/lib/errors'
import { CoachRole } from '@prisma/client'

/**
 * Get the current authenticated user or throw
 */
export async function requireUser() {
  const user = await getCurrentUser()
  if (!user?.id) {
    throw new UnauthorizedError('You must be logged in to perform this action')
  }
  return user
}

/**
 * Get the coach profile for the current user
 */
export async function getCoachProfile(userId: string) {
  const coach = await prisma.coachProfile.findUnique({
    where: { userId },
    include: {
      teams: {
        include: {
          team: true,
        },
      },
    },
  })

  if (!coach) {
    throw new NotFoundError('Coach profile')
  }

  return coach
}

/**
 * Get all team IDs accessible by a coach
 */
export async function getCoachTeamIds(coachId: string): Promise<string[]> {
  const teamCoaches = await prisma.teamCoach.findMany({
    where: {
      coachId,
    },
    select: {
      teamId: true,
    },
  })

  return teamCoaches.map((tc) => tc.teamId)
}

/**
 * Check if a coach has access to a specific team
 */
export async function verifyTeamAccess(
  coachId: string,
  teamId: string,
  requiredRole?: CoachRole
): Promise<void> {
  const teamCoach = await prisma.teamCoach.findUnique({
    where: {
      teamId_coachId: {
        teamId,
        coachId,
      },
    },
  })

  if (!teamCoach) {
    throw new ForbiddenError('You do not have access to this team')
  }

  // Check role if specified
  if (requiredRole) {
    const roleHierarchy = {
      [CoachRole.HEAD_COACH]: 3,
      [CoachRole.ASSISTANT]: 2,
      [CoachRole.OBSERVER]: 1,
    }

    const userRoleLevel = roleHierarchy[teamCoach.role]
    const requiredRoleLevel = roleHierarchy[requiredRole]

    if (userRoleLevel < requiredRoleLevel) {
      throw new ForbiddenError(
        `This action requires ${requiredRole} role or higher`
      )
    }
  }
}

/**
 * Check if a coach can write/modify a team
 * Only HEAD_COACH and ASSISTANT can modify
 */
export async function verifyTeamWriteAccess(
  coachId: string,
  teamId: string
): Promise<void> {
  const teamCoach = await prisma.teamCoach.findUnique({
    where: {
      teamId_coachId: {
        teamId,
        coachId,
      },
    },
  })

  if (!teamCoach) {
    throw new ForbiddenError('You do not have access to this team')
  }

  if (teamCoach.role === CoachRole.OBSERVER) {
    throw new ForbiddenError('You have read-only access to this team')
  }
}

/**
 * Verify that a student belongs to a team the coach has access to
 */
export async function verifyStudentAccess(
  coachId: string,
  studentId: string
): Promise<void> {
  const coachTeamIds = await getCoachTeamIds(coachId)

  if (coachTeamIds.length === 0) {
    throw new ForbiddenError('You are not assigned to any teams')
  }

  const studentTeams = await prisma.teamMember.findFirst({
    where: {
      studentId,
      teamId: {
        in: coachTeamIds,
      },
      active: true,
    },
  })

  if (!studentTeams) {
    throw new ForbiddenError('You do not have access to this student')
  }
}

/**
 * Verify that a student can be added to a team
 */
export async function verifyStudentTeamAssignment(
  coachId: string,
  teamId: string,
  studentId: string
): Promise<void> {
  // Check coach has write access to team
  await verifyTeamWriteAccess(coachId, teamId)

  // Check if student already on this team
  const existingMembership = await prisma.teamMember.findFirst({
    where: {
      studentId,
      teamId,
      active: true,
    },
  })

  if (existingMembership) {
    throw new ForbiddenError('Student is already a member of this team')
  }
}

/**
 * Get team with verification
 */
export async function getTeamWithAuth(coachId: string, teamId: string) {
  await verifyTeamAccess(coachId, teamId)

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      season: true,
      coaches: {
        include: {
          coach: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!team) {
    throw new NotFoundError('Team', teamId)
  }

  return team
}

/**
 * Get student with verification
 */
export async function getStudentWithAuth(coachId: string, studentId: string) {
  await verifyStudentAccess(coachId, studentId)

  const student = await prisma.student.findUnique({
    where: { id: studentId },
  })

  if (!student) {
    throw new NotFoundError('Student', studentId)
  }

  return student
}

/**
 * Batch verify student access (for bulk operations)
 */
export async function verifyBulkStudentAccess(
  coachId: string,
  studentIds: string[]
): Promise<void> {
  const coachTeamIds = await getCoachTeamIds(coachId)

  if (coachTeamIds.length === 0) {
    throw new ForbiddenError('You are not assigned to any teams')
  }

  // Check all students belong to coach's teams
  const accessibleStudents = await prisma.teamMember.findMany({
    where: {
      studentId: {
        in: studentIds,
      },
      teamId: {
        in: coachTeamIds,
      },
      active: true,
    },
    select: {
      studentId: true,
    },
    distinct: ['studentId'],
  })

  const accessibleStudentIds = new Set(
    accessibleStudents.map((s) => s.studentId)
  )

  const inaccessibleStudents = studentIds.filter(
    (id) => !accessibleStudentIds.has(id)
  )

  if (inaccessibleStudents.length > 0) {
    throw new ForbiddenError(
      `You do not have access to ${inaccessibleStudents.length} of the selected students`
    )
  }
}
