import { z } from "zod";

// Task priority enum validation
export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

// Task status enum validation
export const taskStatusSchema = z.enum([
  "TODO",
  "IN_PROGRESS",
  "BLOCKED",
  "REVIEW",
  "COMPLETED",
]);

// Task category enum validation
export const taskCategorySchema = z.enum([
  "GENERAL",
  "BUILD",
  "PROGRAMMING",
  "DESIGN",
  "NOTEBOOK",
  "COMPETITION_PREP",
  "OUTREACH",
  "FUNDRAISING",
]);

// Create task schema
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z.string().optional(),
  priority: taskPrioritySchema.default("MEDIUM"),
  category: taskCategorySchema.default("GENERAL"),
  dueDate: z.date().optional(),
  estimatedHours: z.number().min(0).max(1000).optional(),
  teamId: z.string().cuid("Invalid team ID"),
  assignedStudentIds: z.array(z.string().cuid()).default([]),
});

// Update task schema (partial with required id)
export const updateTaskSchema = z.object({
  id: z.string().cuid("Invalid task ID"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .optional(),
  description: z.string().optional(),
  priority: taskPrioritySchema.optional(),
  status: taskStatusSchema.optional(),
  category: taskCategorySchema.optional(),
  dueDate: z.date().nullable().optional(),
  estimatedHours: z.number().min(0).max(1000).nullable().optional(),
});

// Update task status schema (for drag-and-drop)
export const updateTaskStatusSchema = z.object({
  id: z.string().cuid("Invalid task ID"),
  status: taskStatusSchema,
});

// Delete task schema
export const deleteTaskSchema = z.object({
  id: z.string().cuid("Invalid task ID"),
});

// Assign students to task schema
export const assignStudentsToTaskSchema = z.object({
  taskId: z.string().cuid("Invalid task ID"),
  studentIds: z.array(z.string().cuid()),
});

// Task filter schema
export const taskFilterSchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  category: taskCategorySchema.optional(),
  assignedTo: z.string().cuid().optional(),
  search: z.string().optional(),
  includeCompleted: z.boolean().default(true),
});

// Type exports
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type DeleteTaskInput = z.infer<typeof deleteTaskSchema>;
export type AssignStudentsToTaskInput = z.infer<
  typeof assignStudentsToTaskSchema
>;
export type TaskFilterInput = z.infer<typeof taskFilterSchema>;
