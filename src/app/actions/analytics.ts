'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-helpers'
import { CurriculumCategory } from '@prisma/client'
import {
  timeRangeSchema,
  analyticsFilterSchema,
  topPerformersQuerySchema,
  type TimeRange,
  type AnalyticsFilter,
  type TopPerformersQuery,
} from '@/lib/validations/analytics'

// Helper to get date range from preset
function getDateRangeFromPreset(preset?: string): { startDate: Date; endDate: Date } {
  const now = new Date()
  const endDate = now
  let startDate = new Date()

  switch (preset) {
    case 'WEEK':
      startDate.setDate(now.getDate() - 7)
      break
    case 'MONTH':
      startDate.setMonth(now.getMonth() - 1)
      break
    case 'SEASON':
      // Current season (typically Aug-April for VEX)
      startDate = new Date(now.getFullYear(), 7, 1) // August 1st
      break
    case 'ALL_TIME':
    default:
      startDate = new Date(2020, 0, 1) // Arbitrary start
      break
  }

  return { startDate, endDate }
}

// Helper to verify coach has access to team
async function verifyTeamAccess(teamId: string, userId: string) {
  const coach = await prisma.coachProfile.findUnique({
    where: { userId },
    include: { teams: true },
  })

  if (!coach) {
    throw new Error('Coach profile not found')
  }

  const hasAccess = coach.teams.some((team) => team.teamId === teamId)
  if (!hasAccess) {
    throw new Error('Unauthorized: You do not have access to this team')
  }

  return coach
}

// Get coach's team IDs
async function getCoachTeamIds(userId: string): Promise<string[]> {
  const coach = await prisma.coachProfile.findUnique({
    where: { userId },
    include: { teams: true },
  })

  if (!coach || coach.teams.length === 0) {
    return []
  }

  return coach.teams.map((team) => team.teamId)
}

export async function getDashboardStats(teamId?: string, timeRange?: TimeRange) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const teamIds = teamId ? [teamId] : await getCoachTeamIds(user.id)
    if (teamIds.length === 0) {
      return { error: 'No team associated with coach' }
    }

    // Parse time range
    const validatedTimeRange = timeRange ? timeRangeSchema.parse(timeRange) : undefined
    const dateRange = validatedTimeRange?.preset
      ? getDateRangeFromPreset(validatedTimeRange.preset)
      : validatedTimeRange?.startDate && validatedTimeRange?.endDate
      ? { startDate: validatedTimeRange.startDate, endDate: validatedTimeRange.endDate }
      : getDateRangeFromPreset('ALL_TIME')

    // Get all students in teams
    const students = await prisma.student.findMany({
      where: {
        teams: {
          some: {
            teamId: { in: teamIds },
          },
        },
      },
      include: {
        skills: true,
        tasks: {
          include: {
            task: true,
          },
        },
        projectRoles: true,
      },
    })

    // Calculate total students
    const totalStudents = students.length

    // Calculate average skill proficiency
    const allSkills = students.flatMap((s) => s.skills)
    const proficiencyMap = { BEGINNER: 1, INTERMEDIATE: 2, ADVANCED: 3, EXPERT: 4 }
    const avgProficiency =
      allSkills.length > 0
        ? allSkills.reduce((sum, skill) => sum + proficiencyMap[skill.proficiency], 0) / allSkills.length
        : 0

    // Calculate tasks completed this season
    const tasksCompleted = students.flatMap((s) => s.tasks).filter((t) => t.task.completedAt !== null).length

    const totalTasks = students.flatMap((s) => s.tasks).length
    const taskCompletionRate = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0

    // Get active projects count
    const activeProjects = await prisma.project.findMany({
      where: {
        teamId: { in: teamIds },
        status: { in: ['PLANNING', 'IN_PROGRESS'] },
      },
    })

    // Calculate average attendance (placeholder - would need attendance tracking)
    const avgAttendance = 85.5 // Placeholder

    // Get previous period stats for growth indicators
    const prevDateRange = {
      startDate: new Date(dateRange.startDate.getTime() - (dateRange.endDate.getTime() - dateRange.startDate.getTime())),
      endDate: dateRange.startDate,
    }

    const prevStudents = await prisma.student.findMany({
      where: {
        teams: {
          some: {
            teamId: { in: teamIds },
          },
        },
        createdAt: {
          lte: prevDateRange.endDate,
        },
      },
    })

    const studentGrowth =
      prevStudents.length > 0 ? ((totalStudents - prevStudents.length) / prevStudents.length) * 100 : 0

    return {
      success: true,
      stats: {
        totalStudents,
        studentGrowth,
        avgProficiency: avgProficiency.toFixed(2),
        tasksCompleted,
        taskCompletionRate: taskCompletionRate.toFixed(1),
        activeProjects: activeProjects.length,
        avgAttendance,
      },
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return { error: 'Failed to fetch dashboard statistics' }
  }
}

export async function getStudentGrowthData(teamId?: string, timeRange?: TimeRange) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const teamIds = teamId ? [teamId] : await getCoachTeamIds(user.id)
    if (teamIds.length === 0) {
      return { error: 'No team associated with coach' }
    }

    const validatedTimeRange = timeRange ? timeRangeSchema.parse(timeRange) : undefined
    const dateRange = validatedTimeRange?.preset
      ? getDateRangeFromPreset(validatedTimeRange.preset)
      : validatedTimeRange?.startDate && validatedTimeRange?.endDate
      ? { startDate: validatedTimeRange.startDate, endDate: validatedTimeRange.endDate }
      : getDateRangeFromPreset('SEASON')

    // Get students grouped by month
    const students = await prisma.student.findMany({
      where: {
        teams: {
          some: {
            teamId: { in: teamIds },
          },
        },
        createdAt: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Group by month
    const monthlyData: Record<string, number> = {}
    students.forEach((student) => {
      const monthKey = student.createdAt.toISOString().slice(0, 7) // YYYY-MM
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1
    })

    // Convert to cumulative
    const months = Object.keys(monthlyData).sort()
    let cumulative = 0
    const growthData = months.map((month) => {
      cumulative += monthlyData[month]
      return {
        month,
        total: cumulative,
        new: monthlyData[month],
      }
    })

    return {
      success: true,
      data: growthData,
    }
  } catch (error) {
    console.error('Error fetching student growth data:', error)
    return { error: 'Failed to fetch student growth data' }
  }
}

export async function getSkillsDistribution(teamId?: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const teamIds = teamId ? [teamId] : await getCoachTeamIds(user.id)
    if (teamIds.length === 0) {
      return { error: 'No team associated with coach' }
    }

    // Get all student skills
    const studentSkills = await prisma.studentSkill.findMany({
      where: {
        student: {
          teams: {
            some: {
              teamId: { in: teamIds },
            },
          },
        },
      },
      include: {
        skill: true,
      },
    })

    // Group by proficiency level
    const proficiencyDistribution = studentSkills.reduce(
      (acc, ss) => {
        acc[ss.proficiency] = (acc[ss.proficiency] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    // Group by category
    const categoryDistribution = studentSkills.reduce(
      (acc, ss) => {
        acc[ss.skill.category] = (acc[ss.skill.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    // Top skills
    const skillCounts = studentSkills.reduce(
      (acc, ss) => {
        acc[ss.skill.name] = (acc[ss.skill.name] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))

    return {
      success: true,
      data: {
        proficiencyDistribution,
        categoryDistribution,
        topSkills,
      },
    }
  } catch (error) {
    console.error('Error fetching skills distribution:', error)
    return { error: 'Failed to fetch skills distribution' }
  }
}

export async function getTaskCompletionTrends(teamId?: string, timeRange?: TimeRange) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const teamIds = teamId ? [teamId] : await getCoachTeamIds(user.id)
    if (teamIds.length === 0) {
      return { error: 'No team associated with coach' }
    }

    const validatedTimeRange = timeRange ? timeRangeSchema.parse(timeRange) : undefined
    const dateRange = validatedTimeRange?.preset
      ? getDateRangeFromPreset(validatedTimeRange.preset)
      : validatedTimeRange?.startDate && validatedTimeRange?.endDate
      ? { startDate: validatedTimeRange.startDate, endDate: validatedTimeRange.endDate }
      : getDateRangeFromPreset('SEASON')

    // Get task assignments
    const taskAssignments = await prisma.taskAssignment.findMany({
      where: {
        student: {
          teams: {
            some: {
              teamId: { in: teamIds },
            },
          },
        },
        assignedAt: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
      },
      include: {
        task: true,
      },
    })

    // Group by week
    const weeklyData: Record<
      string,
      { completed: number; total: number; categories: Record<string, number> }
    > = {}

    taskAssignments.forEach((ta) => {
      const weekKey = ta.assignedAt.toISOString().slice(0, 10) // YYYY-MM-DD (simplify to day)
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { completed: 0, total: 0, categories: {} }
      }
      weeklyData[weekKey].total++
      if (ta.task.completedAt) {
        weeklyData[weekKey].completed++
      }
      weeklyData[weekKey].categories[ta.task.category] =
        (weeklyData[weekKey].categories[ta.task.category] || 0) + 1
    })

    const trendsData = Object.entries(weeklyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => ({
        date,
        completed: data.completed,
        total: data.total,
        completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
        categories: data.categories,
      }))

    return {
      success: true,
      data: trendsData,
    }
  } catch (error) {
    console.error('Error fetching task completion trends:', error)
    return { error: 'Failed to fetch task completion trends' }
  }
}

export async function getTopPerformers(query: TopPerformersQuery) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const teamIds = await getCoachTeamIds(user.id)
    if (teamIds.length === 0) {
      return { error: 'No team associated with coach' }
    }

    const validatedQuery = topPerformersQuerySchema.parse(query)

    const students = await prisma.student.findMany({
      where: {
        teams: {
          some: {
            teamId: { in: teamIds },
          },
        },
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        tasks: {
          include: {
            task: true,
          },
        },
        projectRoles: true,
      },
    })

    let rankedStudents: Array<{
      id: string
      name: string
      value: number
      details: string
    }> = []

    switch (validatedQuery.metric) {
      case 'SKILLS_MASTERED':
        rankedStudents = students
          .map((s) => ({
            id: s.id,
            name: `${s.firstName} ${s.lastName}`,
            value: s.skills.length,
            details: `${s.skills.length} skills`,
          }))
          .sort((a, b) => b.value - a.value)
        break

      case 'TASKS_COMPLETED':
        rankedStudents = students
          .map((s) => ({
            id: s.id,
            name: `${s.firstName} ${s.lastName}`,
            value: s.tasks.filter((t) => t.task.completedAt).length,
            details: `${s.tasks.filter((t) => t.task.completedAt).length} tasks`,
          }))
          .sort((a, b) => b.value - a.value)
        break

      case 'PROJECT_CONTRIBUTIONS':
        rankedStudents = students
          .map((s) => ({
            id: s.id,
            name: `${s.firstName} ${s.lastName}`,
            value: s.projectRoles.length,
            details: `${s.projectRoles.length} projects`,
          }))
          .sort((a, b) => b.value - a.value)
        break

      case 'PROFICIENCY_GROWTH':
        const proficiencyMap = { BEGINNER: 1, INTERMEDIATE: 2, ADVANCED: 3, EXPERT: 4 }
        rankedStudents = students
          .map((s) => {
            const avgProf =
              s.skills.length > 0
                ? s.skills.reduce((sum, skill) => sum + proficiencyMap[skill.proficiency], 0) /
                  s.skills.length
                : 0
            return {
              id: s.id,
              name: `${s.firstName} ${s.lastName}`,
              value: avgProf,
              details: `Avg: ${avgProf.toFixed(1)}`,
            }
          })
          .sort((a, b) => b.value - a.value)
        break

      case 'ATTENDANCE':
        // Placeholder - would need attendance tracking
        rankedStudents = students
          .map((s) => ({
            id: s.id,
            name: `${s.firstName} ${s.lastName}`,
            value: 95, // Placeholder
            details: '95%',
          }))
          .sort((a, b) => b.value - a.value)
        break
    }

    return {
      success: true,
      data: rankedStudents.slice(0, validatedQuery.limit),
    }
  } catch (error) {
    console.error('Error fetching top performers:', error)
    return { error: 'Failed to fetch top performers' }
  }
}

export async function getTeamInsights(teamId?: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const teamIds = teamId ? [teamId] : await getCoachTeamIds(user.id)
    if (teamIds.length === 0) {
      return { error: 'No team associated with coach' }
    }

    // Get all data needed for insights
    const students = await prisma.student.findMany({
      where: {
        teams: {
          some: {
            teamId: { in: teamIds },
          },
        },
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        tasks: {
          include: {
            task: true,
          },
        },
        projectRoles: true,
      },
    })

    // Skill gaps analysis (skills with low proficiency)
    const skillGaps: Array<{ skill: string; category: string; avgProficiency: number }> = []
    const skillsData = students.flatMap((s) => s.skills)
    const skillsByName = skillsData.reduce(
      (acc, ss) => {
        if (!acc[ss.skill.name]) {
          acc[ss.skill.name] = { proficiencies: [], category: ss.skill.category }
        }
        const profMap = { BEGINNER: 1, INTERMEDIATE: 2, ADVANCED: 3, EXPERT: 4 }
        acc[ss.skill.name].proficiencies.push(profMap[ss.proficiency])
        return acc
      },
      {} as Record<string, { proficiencies: number[]; category: string }>
    )

    Object.entries(skillsByName).forEach(([name, data]) => {
      const avg = data.proficiencies.reduce((sum, p) => sum + p, 0) / data.proficiencies.length
      if (avg < 2.5) {
        // Below intermediate
        skillGaps.push({ skill: name, category: data.category, avgProficiency: avg })
      }
    })
    skillGaps.sort((a, b) => a.avgProficiency - b.avgProficiency)

    // Students needing attention (low engagement)
    const studentsNeedingAttention = students
      .filter((s) => {
        const tasksCompleted = s.tasks.filter((t) => t.task.completedAt).length
        const totalTasks = s.tasks.length
        const completionRate = totalTasks > 0 ? tasksCompleted / totalTasks : 0
        return completionRate < 0.5 || s.skills.length < 3
      })
      .map((s) => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        reason: s.skills.length < 3 ? 'Few skills acquired' : 'Low task completion rate',
      }))

    // Recommended curriculum modules (based on skill gaps)
    const recommendedModules = await prisma.curriculumModule.findMany({
      where: {
        category: { in: skillGaps.slice(0, 3).map((sg) => sg.category as CurriculumCategory) },
      },
      take: 5,
    })

    // Upcoming deadlines
    const upcomingDeadlines = await prisma.task.findMany({
      where: {
        teamId: { in: teamIds },
        dueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Next 14 days
        },
      },
      include: {
        assignments: {
          include: {
            student: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
      take: 10,
    })

    return {
      success: true,
      insights: {
        skillGaps: skillGaps.slice(0, 5),
        studentsNeedingAttention: studentsNeedingAttention.slice(0, 5),
        recommendedModules: recommendedModules.map((m) => ({
          id: m.id,
          title: m.title,
          category: m.category,
          level: m.level,
        })),
        upcomingDeadlines: upcomingDeadlines.map((t) => ({
          id: t.id,
          title: t.title,
          dueDate: t.dueDate,
          assignedTo: t.assignments.length,
        })),
      },
    }
  } catch (error) {
    console.error('Error fetching team insights:', error)
    return { error: 'Failed to fetch team insights' }
  }
}

export async function getAttendanceData(teamId?: string, timeRange?: TimeRange) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const teamIds = teamId ? [teamId] : await getCoachTeamIds(user.id)
    if (teamIds.length === 0) {
      return { error: 'No team associated with coach' }
    }

    // Placeholder implementation
    // In a real system, you would have an Attendance model
    const validatedTimeRange = timeRange ? timeRangeSchema.parse(timeRange) : undefined
    const dateRange = validatedTimeRange?.preset
      ? getDateRangeFromPreset(validatedTimeRange.preset)
      : getDateRangeFromPreset('MONTH')

    // Generate mock attendance data for visualization
    const days: Array<{ date: string; attendance: number; total: number }> = []
    const startDate = dateRange.startDate
    const endDate = dateRange.endDate

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      days.push({
        date: d.toISOString().slice(0, 10),
        attendance: Math.floor(Math.random() * 20) + 10, // Mock data
        total: 25, // Mock total
      })
    }

    return {
      success: true,
      data: days,
    }
  } catch (error) {
    console.error('Error fetching attendance data:', error)
    return { error: 'Failed to fetch attendance data' }
  }
}

export async function exportAnalyticsPDF(teamId?: string, timeRange?: TimeRange) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    // Placeholder for PDF export functionality
    // In a real implementation, you would use a library like puppeteer or pdf-lib
    return {
      success: true,
      message: 'PDF export functionality coming soon',
    }
  } catch (error) {
    console.error('Error exporting analytics PDF:', error)
    return { error: 'Failed to export analytics PDF' }
  }
}
