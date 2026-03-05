import { z } from 'zod'
import { TeamRole } from '@prisma/client'

export const createStudentSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address').optional().nullable(),
  grade: z.number().int().min(9).max(12, 'Grade must be between 9 and 12'),
  gradYear: z.number().int().min(2024).max(2030),
  parentEmail: z.string().email('Invalid parent email').optional().nullable(),
  parentPhone: z.string().max(20).optional().nullable(),
  primaryRole: z.nativeEnum(TeamRole).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
})

export const updateStudentSchema = createStudentSchema.partial().extend({
  id: z.string().min(1, 'Student ID is required'),
})

export const studentFilterSchema = z.object({
  search: z.string().optional(),
  grade: z.number().int().min(9).max(12).optional(),
  gradYear: z.number().int().optional(),
  active: z.boolean().optional(),
  hasEmail: z.boolean().optional(),
  hasParentEmail: z.boolean().optional(),
  hasParentContact: z.boolean().optional(),
  role: z.nativeEnum(TeamRole).optional(),
  teamId: z.string().optional(),
})

export const assignSkillSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  skillId: z.string().min(1, 'Skill ID is required'),
  proficiency: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  assessedBy: z.string().min(1, 'Assessor ID is required'),
  notes: z.string().max(500).optional().nullable(),
})

export const assignTaskSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  taskId: z.string().min(1, 'Task ID is required'),
  assignedBy: z.string().min(1, 'Assigner ID is required'),
})

export const bulkImportStudentSchema = z.object({
  students: z.array(createStudentSchema),
  teamId: z.string().min(1, 'Team ID is required'),
})

export type CreateStudentInput = z.infer<typeof createStudentSchema>
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>
export type StudentFilterInput = z.infer<typeof studentFilterSchema>
export type AssignSkillInput = z.infer<typeof assignSkillSchema>
export type AssignTaskInput = z.infer<typeof assignTaskSchema>
export type BulkImportStudentInput = z.infer<typeof bulkImportStudentSchema>
