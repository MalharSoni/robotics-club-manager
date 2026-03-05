import { z } from "zod";

// Attendance Record Schema
export const attendanceRecordSchema = z.object({
  studentId: z.string().cuid(),
  date: z.coerce.date().refine(
    (date) => {
      const day = date.getDay();
      return day === 6; // Saturday only (0 = Sunday, 6 = Saturday)
    },
    {
      message: "Attendance can only be recorded on Saturdays",
    }
  ),
  status: z.enum(["PRESENT", "ABSENT", "EXCUSED"]),
  notes: z.string().max(500).optional(),
});

export type AttendanceRecord = z.infer<typeof attendanceRecordSchema>;

// Performance Rating Schema
export const performanceRatingSchema = z.object({
  studentId: z.string().cuid(),
  date: z.coerce.date(),
  rating: z.number().int().min(1).max(5),
  notes: z.string().max(500).optional(),
});

export type PerformanceRating = z.infer<typeof performanceRatingSchema>;

// X-Factor Note Schema
export const xFactorNoteSchema = z.object({
  studentId: z.string().cuid(),
  date: z.coerce.date(),
  note: z
    .string()
    .min(1, "Note cannot be empty")
    .max(280, "Note must be 280 characters or less"),
  tags: z.array(z.string()).max(5).default([]),
});

export type XFactorNote = z.infer<typeof xFactorNoteSchema>;

// Work Progress Schema
export const workProgressSchema = z.object({
  studentId: z.string().cuid(),
  date: z.coerce.date(),
  taskIds: z.array(z.string().cuid()),
  completedTaskIds: z.array(z.string().cuid()),
});

export type WorkProgress = z.infer<typeof workProgressSchema>;

// Bulk Save Schema
export const bulkSaveSchema = z.object({
  date: z.coerce.date(),
  records: z.array(
    z.object({
      studentId: z.string().cuid(),
      attendance: attendanceRecordSchema.omit({ studentId: true, date: true }).optional(),
      performance: performanceRatingSchema.omit({ studentId: true, date: true }).optional(),
      xFactorNote: xFactorNoteSchema.omit({ studentId: true, date: true }).optional(),
      workProgress: workProgressSchema.omit({ studentId: true, date: true }).optional(),
    })
  ),
});

export type BulkSave = z.infer<typeof bulkSaveSchema>;

// Quick Tags for X-Factor Notes
export const XFACTOR_TAGS = [
  "Leadership",
  "Breakthrough",
  "Concern",
  "Teamwork",
  "Innovation",
  "Persistence",
  "Creativity",
  "Improvement",
] as const;

// Rating Descriptors
export const RATING_DESCRIPTORS: Record<number, string> = {
  1: "Struggling",
  2: "Needs Help",
  3: "On Track",
  4: "Excellent",
  5: "Outstanding",
};

// Attendance Status Colors
export const ATTENDANCE_COLORS = {
  PRESENT: "bg-green-500/20 text-green-400 border-green-500/50",
  ABSENT: "bg-red-500/20 text-red-400 border-red-500/50",
  EXCUSED: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
} as const;

// Get next Saturday
export function getNextSaturday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + daysUntilSaturday);
  saturday.setHours(0, 0, 0, 0);
  return saturday;
}

// Get previous Saturday
export function getPreviousSaturday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysSinceSaturday = (dayOfWeek + 1) % 7 || 7;
  const saturday = new Date(today);
  saturday.setDate(today.getDate() - daysSinceSaturday);
  saturday.setHours(0, 0, 0, 0);
  return saturday;
}

// Check if date is Saturday
export function isSaturday(date: Date): boolean {
  return date.getDay() === 6;
}

// Format Saturday date for display
export function formatSaturdayDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
