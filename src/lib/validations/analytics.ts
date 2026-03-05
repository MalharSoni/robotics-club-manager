import { z } from 'zod'

export const timeRangePresetSchema = z.enum(['WEEK', 'MONTH', 'SEASON', 'ALL_TIME'])

export const timeRangeSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  preset: timeRangePresetSchema.optional(),
})

export const analyticsFilterSchema = z.object({
  studentIds: z.array(z.string()).optional(),
  seasonId: z.string().optional(),
  metric: z.enum(['SKILLS', 'TASKS', 'PROJECTS', 'ATTENDANCE']).optional(),
  timeRange: timeRangeSchema.optional(),
})

export const exportOptionsSchema = z.object({
  format: z.enum(['PDF', 'CSV', 'JSON']),
  includeCharts: z.boolean().default(true),
  includeTables: z.boolean().default(true),
  timeRange: timeRangeSchema,
})

export const topPerformersQuerySchema = z.object({
  metric: z.enum(['SKILLS_MASTERED', 'TASKS_COMPLETED', 'PROJECT_CONTRIBUTIONS', 'PROFICIENCY_GROWTH', 'ATTENDANCE']),
  limit: z.number().int().min(1).max(20).default(5),
  timeRange: timeRangeSchema.optional(),
})

export type TimeRangePreset = z.infer<typeof timeRangePresetSchema>
export type TimeRange = z.infer<typeof timeRangeSchema>
export type AnalyticsFilter = z.infer<typeof analyticsFilterSchema>
export type ExportOptions = z.infer<typeof exportOptionsSchema>
export type TopPerformersQuery = z.infer<typeof topPerformersQuerySchema>
