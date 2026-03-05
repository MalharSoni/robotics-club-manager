/**
 * Type definitions for Student domain
 */

import type { Student, TeamMember, TeamRole } from '@prisma/client'

/**
 * Student with team information
 */
export type StudentWithTeams = Student & {
  teams: (TeamMember & {
    team: {
      id: string
      name: string
      teamNumber: string | null
    }
  })[]
}

/**
 * Student display data for lists/tables
 */
export interface StudentDisplay {
  id: string
  fullName: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  grade: number | null
  gradYear: number | null
  avatar: string | null
  active: boolean
  teams: {
    id: string
    name: string
    teamNumber: string | null
    primaryRole: TeamRole
    secondaryRoles: TeamRole[]
  }[]
}

/**
 * Student form data (for create/update)
 */
export interface StudentFormValues {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  grade?: number | null
  gradYear?: number | null
  parentName?: string
  parentEmail?: string
  parentPhone?: string
  bio?: string
  avatar?: string
  active: boolean
}

/**
 * Student filters for search/filtering
 */
export interface StudentFilterOptions {
  search?: string
  grade?: number
  gradYear?: number
  active?: boolean
  teamId?: string
  role?: TeamRole
  hasEmail?: boolean
  hasParentContact?: boolean
}

/**
 * Student sort options
 */
export type StudentSortField =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'grade'
  | 'gradYear'
  | 'createdAt'
  | 'updatedAt'

export type SortOrder = 'asc' | 'desc'

/**
 * Paginated student list response
 */
export interface PaginatedStudents {
  students: StudentDisplay[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Student role assignment
 */
export interface StudentRoleAssignment {
  studentId: string
  teamId: string
  primaryRole: TeamRole
  secondaryRoles: TeamRole[]
}

/**
 * Student statistics
 */
export interface StudentStats {
  total: number
  active: number
  inactive: number
  byGrade: Record<number, number>
  byRole: Record<string, number>
}

/**
 * Student activity summary
 */
export interface StudentActivity {
  tasksCompleted: number
  tasksInProgress: number
  projectsActive: number
  curriculumModulesCompleted: number
  lastActivity: Date | null
}

/**
 * Student contact information
 */
export interface StudentContact {
  student: {
    email: string | null
    phone: string | null
  }
  parent: {
    name: string | null
    email: string | null
    phone: string | null
  }
}
