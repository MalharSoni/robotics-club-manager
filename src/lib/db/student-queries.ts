import { Prisma } from '@prisma/client'
import type { StudentFilters, StudentPagination } from '@/lib/validations/student'

/**
 * Optimized Prisma query patterns for Student operations
 * These functions build queries with proper includes, filters, and pagination
 */

// Standard includes for student queries
export const studentBaseInclude = {
  teams: {
    include: {
      team: {
        select: {
          id: true,
          name: true,
          teamNumber: true,
          active: true,
        },
      },
    },
    where: {
      active: true,
    },
  },
} satisfies Prisma.StudentInclude

export const studentWithDetailsInclude = {
  teams: {
    include: {
      team: {
        select: {
          id: true,
          name: true,
          teamNumber: true,
          active: true,
          seasonId: true,
          season: {
            select: {
              id: true,
              name: true,
              current: true,
            },
          },
        },
      },
    },
    where: {
      active: true,
    },
  },
  skills: {
    include: {
      skill: {
        select: {
          id: true,
          name: true,
          category: true,
          level: true,
          icon: true,
          color: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc' as const,
    },
  },
  tasks: {
    where: {
      task: {
        status: {
          notIn: ['COMPLETED'],
        },
      },
    },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          priority: true,
          status: true,
          dueDate: true,
        },
      },
    },
    orderBy: {
      task: {
        dueDate: 'asc' as const,
      },
    },
    take: 10, // Limit to recent/upcoming tasks
  },
  curriculumProgress: {
    where: {
      status: {
        in: ['IN_PROGRESS', 'NOT_STARTED'],
      },
    },
    include: {
      module: {
        select: {
          id: true,
          title: true,
          category: true,
          level: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc' as const,
    },
    take: 10,
  },
  reportCards: {
    orderBy: {
      endDate: 'desc' as const,
    },
    take: 5,
    select: {
      id: true,
      periodName: true,
      overallGrade: true,
      published: true,
      startDate: true,
      endDate: true,
    },
  },
  projectRoles: {
    include: {
      project: {
        select: {
          id: true,
          name: true,
          category: true,
          status: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc' as const,
    },
  },
} satisfies Prisma.StudentInclude

// Build where clause from filters
export function buildStudentWhereClause(
  filters: StudentFilters,
  coachTeamIds?: string[]
): Prisma.StudentWhereInput {
  const where: Prisma.StudentWhereInput = {}

  // Search by name or email
  if (filters.search) {
    where.OR = [
      {
        firstName: {
          contains: filters.search,
          mode: 'insensitive',
        },
      },
      {
        lastName: {
          contains: filters.search,
          mode: 'insensitive',
        },
      },
      {
        email: {
          contains: filters.search,
          mode: 'insensitive',
        },
      },
    ]
  }

  // Filter by grade
  if (filters.grade !== undefined) {
    where.grade = filters.grade
  }

  // Filter by graduation year
  if (filters.gradYear !== undefined) {
    where.gradYear = filters.gradYear
  }

  // Filter by active status
  if (filters.active !== undefined) {
    where.active = filters.active
  }

  // Filter by team membership
  if (filters.teamId) {
    where.teams = {
      some: {
        teamId: filters.teamId,
        active: true,
      },
    }
  } else if (coachTeamIds && coachTeamIds.length > 0) {
    // If no specific team, filter by coach's teams
    where.teams = {
      some: {
        teamId: {
          in: coachTeamIds,
        },
        active: true,
      },
    }
  }

  // Filter by role
  if (filters.role) {
    where.teams = {
      some: {
        ...(where.teams?.some || {}),
        OR: [
          { primaryRole: filters.role },
          {
            secondaryRoles: {
              has: filters.role,
            },
          },
        ],
      },
    }
  }

  // Filter by email presence
  if (filters.hasEmail !== undefined) {
    where.email = filters.hasEmail
      ? {
          not: null,
        }
      : null
  }

  // Filter by parent contact presence
  if (filters.hasParentContact !== undefined) {
    if (filters.hasParentContact) {
      where.OR = [
        {
          parentEmail: {
            not: null,
          },
        },
        {
          parentPhone: {
            not: null,
          },
        },
      ]
    } else {
      where.AND = [
        {
          parentEmail: null,
        },
        {
          parentPhone: null,
        },
      ]
    }
  }

  return where
}

// Build orderBy clause from pagination params
export function buildStudentOrderBy(
  pagination: StudentPagination
): Prisma.StudentOrderByWithRelationInput {
  const { sortBy, sortOrder } = pagination

  if (sortBy === 'firstName' || sortBy === 'lastName') {
    // For names, secondary sort by the other name field
    return [
      { [sortBy]: sortOrder },
      { [sortBy === 'firstName' ? 'lastName' : 'firstName']: sortOrder },
    ]
  }

  return { [sortBy]: sortOrder }
}

// Calculate pagination skip/take
export function getPaginationParams(pagination: StudentPagination) {
  const { page, pageSize } = pagination
  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  }
}

// Type exports for query results
export type StudentBase = Prisma.StudentGetPayload<{
  include: typeof studentBaseInclude
}>

export type StudentWithDetails = Prisma.StudentGetPayload<{
  include: typeof studentWithDetailsInclude
}>

export type StudentListItem = Prisma.StudentGetPayload<{
  select: {
    id: true
    firstName: true
    lastName: true
    email: true
    phone: true
    grade: true
    gradYear: true
    avatar: true
    active: true
    createdAt: true
    updatedAt: true
    teams: {
      select: {
        id: true
        primaryRole: true
        secondaryRoles: true
        team: {
          select: {
            id: true
            name: true
            teamNumber: true
          }
        }
      }
    }
  }
}>

// Select clause for list view (lightweight)
export const studentListSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  grade: true,
  gradYear: true,
  avatar: true,
  active: true,
  createdAt: true,
  updatedAt: true,
  teams: {
    where: {
      active: true,
    },
    select: {
      id: true,
      primaryRole: true,
      secondaryRoles: true,
      team: {
        select: {
          id: true,
          name: true,
          teamNumber: true,
        },
      },
    },
  },
} satisfies Prisma.StudentSelect
