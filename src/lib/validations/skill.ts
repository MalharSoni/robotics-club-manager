import { z } from 'zod'
import { SkillCategory, SkillLevel } from '@prisma/client'

export const createSkillSchema = z.object({
  name: z.string().min(1, 'Skill name is required').max(100),
  description: z.string().max(500).optional().nullable(),
  category: z.nativeEnum(SkillCategory, {
    message: 'Invalid skill category',
  }),
  icon: z.string().max(50).optional().nullable(),
  color: z.string().max(7).optional().nullable(), // Hex color
})

export const updateSkillSchema = createSkillSchema.partial().extend({
  id: z.string().min(1, 'Skill ID is required'),
})

export const assessmentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  skillId: z.string().min(1, 'Skill ID is required'),
  proficiency: z.nativeEnum(SkillLevel, {
    message: 'Invalid proficiency level',
  }),
  notes: z.string().max(1000).optional().nullable(),
  verified: z.boolean().default(false),
  evidenceUrl: z.string().url('Invalid URL').optional().nullable(),
})

export const bulkAssessmentSchema = z.object({
  assessments: z.array(assessmentSchema).min(1, 'At least one assessment is required'),
})

export const skillFilterSchema = z.object({
  category: z.nativeEnum(SkillCategory).optional(),
  proficiency: z.nativeEnum(SkillLevel).optional(),
  verified: z.boolean().optional(),
  search: z.string().optional(),
  teamId: z.string().optional(),
})

export const studentSkillFilterSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  category: z.nativeEnum(SkillCategory).optional(),
  proficiency: z.nativeEnum(SkillLevel).optional(),
})

export type CreateSkillInput = z.infer<typeof createSkillSchema>
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>
export type AssessmentInput = z.infer<typeof assessmentSchema>
export type BulkAssessmentInput = z.infer<typeof bulkAssessmentSchema>
export type SkillFilterInput = z.infer<typeof skillFilterSchema>
export type StudentSkillFilterInput = z.infer<typeof studentSkillFilterSchema>
