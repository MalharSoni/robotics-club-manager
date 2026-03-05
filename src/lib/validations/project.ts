import { z } from 'zod'

// Project Categories
export const projectCategories = [
  'ROBOT_BUILD',
  'NOTEBOOK',
  'OUTREACH',
  'FUNDRAISING',
  'MEDIA',
  'AWARDS',
  'COMPETITION',
] as const

// Project Statuses
export const projectStatuses = [
  'PLANNING',
  'ACTIVE',
  'ON_HOLD',
  'COMPLETED',
  'ARCHIVED',
] as const

// Project Roles
export const projectRoles = ['LEAD', 'MEMBER', 'MENTOR'] as const

// Create Project Schema
export const createProjectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  description: z.string().optional(),
  category: z.enum([
    'ROBOT',
    'MECHANISM',
    'AUTONOMOUS',
    'OUTREACH',
    'FUNDRAISING',
    'OTHER',
  ]),
  status: z
    .enum(['PLANNING', 'IN_PROGRESS', 'TESTING', 'COMPLETED', 'ARCHIVED'])
    .default('PLANNING'),
  startDate: z.string().optional(), // ISO date string
  endDate: z.string().optional(), // ISO date string
  goals: z.array(z.string()).default([]),
  coverImage: z.string().url().optional(),
  teamId: z.string().optional(), // Will be filled from context if not provided
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>

// Update Project Schema
export const updateProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
  category: z
    .enum(['ROBOT', 'MECHANISM', 'AUTONOMOUS', 'OUTREACH', 'FUNDRAISING', 'OTHER'])
    .optional(),
  status: z
    .enum(['PLANNING', 'IN_PROGRESS', 'TESTING', 'COMPLETED', 'ARCHIVED'])
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  goals: z.array(z.string()).optional(),
  outcomes: z.array(z.string()).optional(),
  coverImage: z.string().url().optional(),
})

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>

// Assign Student to Project Schema
export const assignStudentSchema = z.object({
  projectId: z.string(),
  studentId: z.string(),
  role: z.string().min(1, 'Role is required'),
  contributionHours: z.number().min(0).default(0),
})

export type AssignStudentInput = z.infer<typeof assignStudentSchema>

// Update Project Role Schema
export const updateProjectRoleSchema = z.object({
  id: z.string(),
  role: z.string().min(1).optional(),
  contributions: z.string().optional(),
  hoursSpent: z.number().min(0).optional(),
})

export type UpdateProjectRoleInput = z.infer<typeof updateProjectRoleSchema>

// Project Filter Schema
export const projectFilterSchema = z.object({
  status: z
    .enum(['PLANNING', 'IN_PROGRESS', 'TESTING', 'COMPLETED', 'ARCHIVED'])
    .optional(),
  category: z
    .enum(['ROBOT', 'MECHANISM', 'AUTONOMOUS', 'OUTREACH', 'FUNDRAISING', 'OTHER'])
    .optional(),
  seasonId: z.string().optional(),
  search: z.string().optional(),
})

export type ProjectFilterInput = z.infer<typeof projectFilterSchema>

// Delete Project Schema
export const deleteProjectSchema = z.object({
  id: z.string(),
})

export type DeleteProjectInput = z.infer<typeof deleteProjectSchema>

// Update Project Status Schema
export const updateProjectStatusSchema = z.object({
  id: z.string(),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'TESTING', 'COMPLETED', 'ARCHIVED']),
})

export type UpdateProjectStatusInput = z.infer<typeof updateProjectStatusSchema>

// Remove Student from Project Schema
export const removeStudentSchema = z.object({
  projectId: z.string(),
  studentId: z.string(),
})

export type RemoveStudentInput = z.infer<typeof removeStudentSchema>
