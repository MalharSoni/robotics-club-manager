"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  attendanceRecordSchema,
  performanceRatingSchema,
  xFactorNoteSchema,
  workProgressSchema,
  bulkSaveSchema,
  type AttendanceRecord,
  type PerformanceRating,
  type XFactorNote,
  type WorkProgress,
  type BulkSave,
} from "@/lib/validations/daily-stats";
import { revalidatePath } from "next/cache";
import { startOfDay, subDays, isSaturday } from "date-fns";

// Authorization helper
async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

// Get session data for a specific date
export async function getSessionData(date: Date) {
  const userId = await requireAuth();

  // Normalize date to start of day
  const sessionDate = startOfDay(date);

  // Get all active students
  const students = await prisma.student.findMany({
    where: {
      active: true,
    },
    include: {
      attendanceRecords: {
        where: {
          date: sessionDate,
        },
      },
      dailyPerformance: {
        where: {
          date: sessionDate,
        },
      },
      xFactorNotes: {
        where: {
          date: sessionDate,
        },
      },
      tasks: {
        where: {
          task: {
            status: {
              not: "COMPLETED",
            },
          },
        },
        include: {
          task: true,
        },
        take: 10,
      },
    },
    orderBy: {
      firstName: "asc",
    },
  });

  return {
    date: sessionDate,
    students: students.map((student) => ({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      grade: student.grade,
      avatar: student.avatar,
      attendance: student.attendanceRecords[0] || null,
      performance: student.dailyPerformance[0] || null,
      xFactorNotes: student.xFactorNotes,
      tasks: student.tasks.map((ta) => ({
        id: ta.task.id,
        title: ta.task.title,
        status: ta.status,
      })),
    })),
  };
}

// Record attendance
export async function recordAttendance(
  data: AttendanceRecord
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await requireAuth();
    const validated = attendanceRecordSchema.parse(data);

    await prisma.attendanceRecord.upsert({
      where: {
        studentId_date: {
          studentId: validated.studentId,
          date: startOfDay(validated.date),
        },
      },
      update: {
        status: validated.status,
        notes: validated.notes,
        recordedBy: userId,
      },
      create: {
        studentId: validated.studentId,
        date: startOfDay(validated.date),
        status: validated.status,
        notes: validated.notes,
        recordedBy: userId,
      },
    });

    revalidatePath("/dashboard/stats");
    return { success: true };
  } catch (error) {
    console.error("Error recording attendance:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to record attendance",
    };
  }
}

// Record performance rating
export async function recordPerformanceRating(
  data: PerformanceRating
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await requireAuth();
    const validated = performanceRatingSchema.parse(data);

    await prisma.dailyPerformance.upsert({
      where: {
        studentId_date: {
          studentId: validated.studentId,
          date: startOfDay(validated.date),
        },
      },
      update: {
        rating: validated.rating,
        notes: validated.notes,
        recordedBy: userId,
      },
      create: {
        studentId: validated.studentId,
        date: startOfDay(validated.date),
        rating: validated.rating,
        notes: validated.notes,
        recordedBy: userId,
      },
    });

    revalidatePath("/dashboard/stats");
    return { success: true };
  } catch (error) {
    console.error("Error recording performance:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to record performance",
    };
  }
}

// Save X-Factor note
export async function saveXFactorNote(
  data: XFactorNote
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await requireAuth();
    const validated = xFactorNoteSchema.parse(data);

    await prisma.xFactorNote.create({
      data: {
        studentId: validated.studentId,
        date: startOfDay(validated.date),
        note: validated.note,
        tags: validated.tags,
        recordedBy: userId,
      },
    });

    revalidatePath("/dashboard/stats");
    return { success: true };
  } catch (error) {
    console.error("Error saving X-Factor note:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save note",
    };
  }
}

// Update work progress
export async function updateWorkProgress(
  data: WorkProgress
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await requireAuth();
    const validated = workProgressSchema.parse(data);

    // Update task assignment statuses
    await Promise.all(
      validated.taskIds.map(async (taskId) => {
        const isCompleted = validated.completedTaskIds.includes(taskId);
        await prisma.taskAssignment.updateMany({
          where: {
            taskId,
            studentId: validated.studentId,
          },
          data: {
            status: isCompleted ? "COMPLETED" : "IN_PROGRESS",
          },
        });
      })
    );

    revalidatePath("/dashboard/stats");
    return { success: true };
  } catch (error) {
    console.error("Error updating work progress:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update progress",
    };
  }
}

// Bulk save session data
export async function bulkSaveSession(
  data: BulkSave
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await requireAuth();
    const validated = bulkSaveSchema.parse(data);

    const sessionDate = startOfDay(validated.date);

    // Process each student's records
    await Promise.all(
      validated.records.map(async (record) => {
        const promises = [];

        if (record.attendance) {
          promises.push(
            prisma.attendanceRecord.upsert({
              where: {
                studentId_date: {
                  studentId: record.studentId,
                  date: sessionDate,
                },
              },
              update: {
                status: record.attendance.status,
                notes: record.attendance.notes,
                recordedBy: userId,
              },
              create: {
                studentId: record.studentId,
                date: sessionDate,
                status: record.attendance.status,
                notes: record.attendance.notes,
                recordedBy: userId,
              },
            })
          );
        }

        if (record.performance) {
          promises.push(
            prisma.dailyPerformance.upsert({
              where: {
                studentId_date: {
                  studentId: record.studentId,
                  date: sessionDate,
                },
              },
              update: {
                rating: record.performance.rating,
                notes: record.performance.notes,
                recordedBy: userId,
              },
              create: {
                studentId: record.studentId,
                date: sessionDate,
                rating: record.performance.rating,
                notes: record.performance.notes,
                recordedBy: userId,
              },
            })
          );
        }

        if (record.xFactorNote) {
          promises.push(
            prisma.xFactorNote.create({
              data: {
                studentId: record.studentId,
                date: sessionDate,
                note: record.xFactorNote.note,
                tags: record.xFactorNote.tags,
                recordedBy: userId,
              },
            })
          );
        }

        return Promise.all(promises);
      })
    );

    revalidatePath("/dashboard/stats");
    return { success: true };
  } catch (error) {
    console.error("Error bulk saving session:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save session",
    };
  }
}

// Get attendance streak for a student
export async function getAttendanceStreak(
  studentId: string
): Promise<{ streak: number; lastDate: Date | null }> {
  try {
    await requireAuth();

    const records = await prisma.attendanceRecord.findMany({
      where: {
        studentId,
        status: "PRESENT",
      },
      orderBy: {
        date: "desc",
      },
      take: 52, // Up to 1 year of Saturdays
    });

    if (records.length === 0) {
      return { streak: 0, lastDate: null };
    }

    let streak = 0;
    let currentDate = new Date();

    // Find the most recent Saturday
    while (!isSaturday(currentDate)) {
      currentDate = subDays(currentDate, 1);
    }

    // Count consecutive Saturdays
    for (const record of records) {
      const recordDate = startOfDay(record.date);
      const expectedDate = startOfDay(currentDate);

      if (recordDate.getTime() === expectedDate.getTime()) {
        streak++;
        currentDate = subDays(currentDate, 7); // Go back one week
      } else {
        break; // Streak broken
      }
    }

    return { streak, lastDate: records[0].date };
  } catch (error) {
    console.error("Error calculating attendance streak:", error);
    return { streak: 0, lastDate: null };
  }
}

// Get last week's rating
export async function getLastWeekRating(
  studentId: string,
  currentDate: Date
): Promise<{ rating: number | null; date: Date | null }> {
  try {
    await requireAuth();

    const lastWeek = subDays(startOfDay(currentDate), 7);

    const lastRating = await prisma.dailyPerformance.findUnique({
      where: {
        studentId_date: {
          studentId,
          date: lastWeek,
        },
      },
    });

    return {
      rating: lastRating?.rating ?? null,
      date: lastRating?.date ?? null,
    };
  } catch (error) {
    console.error("Error fetching last week's rating:", error);
    return { rating: null, date: null };
  }
}

// Bulk mark all present
export async function bulkMarkAllPresent(
  date: Date,
  studentIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await requireAuth();
    const sessionDate = startOfDay(date);

    // Validate it's a Saturday
    if (!isSaturday(sessionDate)) {
      return { success: false, error: "Attendance can only be recorded on Saturdays" };
    }

    await Promise.all(
      studentIds.map((studentId) =>
        prisma.attendanceRecord.upsert({
          where: {
            studentId_date: {
              studentId,
              date: sessionDate,
            },
          },
          update: {
            status: "PRESENT",
            recordedBy: userId,
          },
          create: {
            studentId,
            date: sessionDate,
            status: "PRESENT",
            recordedBy: userId,
          },
        })
      )
    );

    revalidatePath("/dashboard/stats");
    return { success: true };
  } catch (error) {
    console.error("Error bulk marking present:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark all present",
    };
  }
}
