import { z } from "zod";

// Curriculum category enum validation
export const curriculumCategorySchema = z.enum([
  "MECHANICAL",
  "ELECTRICAL",
  "PROGRAMMING",
  "CAD_DESIGN",
  "NOTEBOOK",
  "SOFT_SKILLS",
  "COMPETITION_STRATEGY",
  "SAFETY",
]);

// Skill level enum validation
export const skillLevelSchema = z.enum([
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
]);

// Progress status enum validation
export const progressStatusSchema = z.enum([
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
  "MASTERED",
]);

// Create curriculum module schema
export const createModuleSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z.string().optional(),
  category: curriculumCategorySchema,
  difficultyLevel: skillLevelSchema.default("BEGINNER"),
  durationHours: z.number().min(0).max(1000).optional(),
  content: z.string().optional(),
  learningObjectives: z.array(z.string()).default([]),
  prerequisites: z.array(z.string().cuid()).default([]),
  resources: z.any().optional(), // JSON data for links, videos, etc.
});

// Update curriculum module schema (partial with required id)
export const updateModuleSchema = z.object({
  id: z.string().cuid("Invalid module ID"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .optional(),
  description: z.string().optional(),
  category: curriculumCategorySchema.optional(),
  difficultyLevel: skillLevelSchema.optional(),
  durationHours: z.number().min(0).max(1000).nullable().optional(),
  content: z.string().optional(),
  learningObjectives: z.array(z.string()).optional(),
  prerequisites: z.array(z.string().cuid()).optional(),
  resources: z.any().optional(),
  active: z.boolean().optional(),
});

// Delete module schema
export const deleteModuleSchema = z.object({
  id: z.string().cuid("Invalid module ID"),
});

// Update student progress schema
export const updateProgressSchema = z.object({
  studentId: z.string().cuid("Invalid student ID"),
  moduleId: z.string().cuid("Invalid module ID"),
  status: progressStatusSchema,
  notes: z.string().optional(),
  hoursSpent: z.number().min(0).max(10000).optional(),
  quizScore: z.number().min(0).max(100).optional(),
  evidenceMediaId: z.string().cuid("Invalid media ID").optional(),
});

// Bulk update progress schema
export const bulkUpdateProgressSchema = z.object({
  moduleId: z.string().cuid("Invalid module ID"),
  studentIds: z.array(z.string().cuid()),
  status: progressStatusSchema,
  notes: z.string().optional(),
});

// Module filter schema
export const moduleFilterSchema = z.object({
  category: curriculumCategorySchema.optional(),
  difficultyLevel: skillLevelSchema.optional(),
  status: progressStatusSchema.optional(),
  search: z.string().optional(),
  studentId: z.string().cuid().optional(), // Filter by student progress
});

// Type exports
export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
export type DeleteModuleInput = z.infer<typeof deleteModuleSchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
export type BulkUpdateProgressInput = z.infer<typeof bulkUpdateProgressSchema>;
export type ModuleFilterInput = z.infer<typeof moduleFilterSchema>;
