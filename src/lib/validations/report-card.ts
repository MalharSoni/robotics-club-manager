import { z } from 'zod'

// Rating schema (1-5 scale)
export const ratingSchema = z.object({
  technicalSkills: z.number().min(1).max(5).optional(),
  teamwork: z.number().min(1).max(5).optional(),
  leadership: z.number().min(1).max(5).optional(),
  communication: z.number().min(1).max(5).optional(),
  problemSolving: z.number().min(1).max(5).optional(),
  initiative: z.number().min(1).max(5).optional(),
})

// Attendance schema
export const attendanceSchema = z.object({
  daysPresent: z.number().min(0),
  totalDays: z.number().min(1),
  percentage: z.number().min(0).max(100),
})

// Narrative feedback schema
export const narrativeFeedbackSchema = z.object({
  strengths: z.string().optional(),
  areasForGrowth: z.string().optional(),
  coachComments: z.string().optional(),
  goals: z.string().optional(),
})

// Create report card schema
export const createReportCardSchema = z.object({
  studentId: z.string().cuid(),
  teamId: z.string().cuid(),
  periodName: z.string().min(1, 'Period name is required'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),

  // Ratings
  technicalSkills: z.number().min(1).max(5).optional(),
  teamwork: z.number().min(1).max(5).optional(),
  leadership: z.number().min(1).max(5).optional(),
  communication: z.number().min(1).max(5).optional(),
  problemSolving: z.number().min(1).max(5).optional(),
  initiative: z.number().min(1).max(5).optional(),

  // Attendance
  attendance: z.number().min(0).max(100).optional(),

  // Narrative feedback
  strengths: z.string().optional(),
  areasForGrowth: z.string().optional(),
  coachComments: z.string().optional(),
  goals: z.string().optional(),

  // Overall
  overallGrade: z.string().optional(),
})

// Update report card schema
export const updateReportCardSchema = z.object({
  id: z.string().cuid(),

  periodName: z.string().min(1).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),

  // Ratings
  technicalSkills: z.number().min(1).max(5).optional(),
  teamwork: z.number().min(1).max(5).optional(),
  leadership: z.number().min(1).max(5).optional(),
  communication: z.number().min(1).max(5).optional(),
  problemSolving: z.number().min(1).max(5).optional(),
  initiative: z.number().min(1).max(5).optional(),

  // Attendance
  attendance: z.number().min(0).max(100).optional(),

  // Narrative feedback
  strengths: z.string().optional(),
  areasForGrowth: z.string().optional(),
  coachComments: z.string().optional(),
  goals: z.string().optional(),

  // Overall
  overallGrade: z.string().optional(),

  // Metrics
  tasksCompleted: z.number().min(0).optional(),
  projectsCompleted: z.number().min(0).optional(),
  hoursLogged: z.number().min(0).optional(),
})

// Bulk create schema
export const bulkCreateReportCardsSchema = z.object({
  studentIds: z.array(z.string().cuid()).min(1, 'Select at least one student'),
  teamId: z.string().cuid(),
  periodName: z.string().min(1, 'Period name is required'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),

  // Optional template values
  templateRatings: z.object({
    technicalSkills: z.number().min(1).max(5).optional(),
    teamwork: z.number().min(1).max(5).optional(),
    leadership: z.number().min(1).max(5).optional(),
    communication: z.number().min(1).max(5).optional(),
    problemSolving: z.number().min(1).max(5).optional(),
    initiative: z.number().min(1).max(5).optional(),
  }).optional(),
})

// Publish report card schema
export const publishReportCardSchema = z.object({
  id: z.string().cuid(),
})

// Filter schema
export const reportCardFilterSchema = z.object({
  teamId: z.string().cuid().optional(),
  studentId: z.string().cuid().optional(),
  periodName: z.string().optional(),
  published: z.boolean().optional(),
  search: z.string().optional(),
})

// Send report card schema
export const sendReportCardSchema = z.object({
  id: z.string().cuid(),
  recipientEmail: z.string().email('Invalid email address'),
  recipientName: z.string().optional(),
  message: z.string().optional(),
})

// Export types
export type CreateReportCardInput = z.infer<typeof createReportCardSchema>
export type UpdateReportCardInput = z.infer<typeof updateReportCardSchema>
export type BulkCreateReportCardsInput = z.infer<typeof bulkCreateReportCardsSchema>
export type PublishReportCardInput = z.infer<typeof publishReportCardSchema>
export type ReportCardFilterInput = z.infer<typeof reportCardFilterSchema>
export type SendReportCardInput = z.infer<typeof sendReportCardSchema>
