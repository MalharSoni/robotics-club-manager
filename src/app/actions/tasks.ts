'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { requireUser, getCoachProfile, verifyTeamWriteAccess } from '@/lib/authorization'
import { handleActionError, type ActionResult } from '@/lib/errors'
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  deleteTaskSchema,
  assignStudentsToTaskSchema,
  taskFilterSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
  type UpdateTaskStatusInput,
  type DeleteTaskInput,
  type AssignStudentsToTaskInput,
  type TaskFilterInput,
} from '@/lib/validations/task'
import type { Task, Student, TaskAssignment } from '@prisma/client'

// Type for task with assignments
export type TaskWithAssignments = Task & {
  assignments: (TaskAssignment & {
    student: Student
  })[]
}

/**
 * Get all tasks for a team with optional filtering
 */
export async function getTasks(
  teamId: string,
  filters?: TaskFilterInput
): Promise<ActionResult<TaskWithAssignments[]>> {
  return handleActionError(async () => {
    const user = await requireUser()
    const coach = await getCoachProfile(user.id)

    // Verify coach has access to this team
    await verifyTeamWriteAccess(coach.id, teamId)

    // Validate filters
    const validatedFilters = filters
      ? taskFilterSchema.parse(filters)
      : { includeCompleted: true }

    // Build where clause
    const where: any = {
      teamId,
    }

    if (validatedFilters.status) {
      where.status = validatedFilters.status
    }

    if (validatedFilters.priority) {
      where.priority = validatedFilters.priority
    }

    if (validatedFilters.category) {
      where.category = validatedFilters.category
    }

    if (validatedFilters.assignedTo) {
      where.assignments = {
        some: {
          studentId: validatedFilters.assignedTo,
        },
      }
    }

    if (validatedFilters.search) {
      where.OR = [
        {
          title: {
            contains: validatedFilters.search,
            mode: 'insensitive' as const,
          },
        },
        {
          description: {
            contains: validatedFilters.search,
            mode: 'insensitive' as const,
          },
        },
      ]
    }

    // Fetch tasks with assignments
    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignments: {
          include: {
            student: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
    })

    return tasks
  })
}

/**
 * Create a new task
 */
export async function createTask(
  data: CreateTaskInput
): Promise<ActionResult<Task>> {
  return handleActionError(async () => {
    const user = await requireUser()
    const coach = await getCoachProfile(user.id)

    // Validate input
    const validatedData = createTaskSchema.parse(data)

    // Verify coach has write access to the team
    await verifyTeamWriteAccess(coach.id, validatedData.teamId)

    // Create task with assignments in a transaction
    const task = await prisma.$transaction(async (tx) => {
      // Create the task
      const newTask = await tx.task.create({
        data: {
          title: validatedData.title,
          description: validatedData.description,
          priority: validatedData.priority,
          category: validatedData.category,
          dueDate: validatedData.dueDate,
          teamId: validatedData.teamId,
          status: 'TODO',
        },
      })

      // Create task assignments if students are assigned
      if (validatedData.assignedStudentIds.length > 0) {
        await tx.taskAssignment.createMany({
          data: validatedData.assignedStudentIds.map((studentId) => ({
            taskId: newTask.id,
            studentId,
            status: 'TODO',
          })),
        })
      }

      return newTask
    })

    revalidatePath('/dashboard/tasks')
    return task
  })
}

/**
 * Update a task
 */
export async function updateTask(
  data: UpdateTaskInput
): Promise<ActionResult<Task>> {
  return handleActionError(async () => {
    const user = await requireUser()
    const coach = await getCoachProfile(user.id)

    // Validate input
    const validatedData = updateTaskSchema.parse(data)

    // Get the task to verify team ownership
    const existingTask = await prisma.task.findUnique({
      where: { id: validatedData.id },
      select: { teamId: true },
    })

    if (!existingTask) {
      throw new Error('Task not found')
    }

    // Verify coach has write access to the team
    await verifyTeamWriteAccess(coach.id, existingTask.teamId)

    // Update the task
    const updateData: any = {}

    if (validatedData.title !== undefined) updateData.title = validatedData.title
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.priority !== undefined) updateData.priority = validatedData.priority
    if (validatedData.status !== undefined) updateData.status = validatedData.status
    if (validatedData.category !== undefined) updateData.category = validatedData.category
    if (validatedData.dueDate !== undefined) updateData.dueDate = validatedData.dueDate
    if (validatedData.estimatedHours !== undefined) updateData.estimatedHours = validatedData.estimatedHours

    // Mark as completed if status is COMPLETED
    if (validatedData.status === 'COMPLETED') {
      updateData.completedAt = new Date()
    }

    const task = await prisma.task.update({
      where: { id: validatedData.id },
      data: updateData,
    })

    revalidatePath('/dashboard/tasks')
    return task
  })
}

/**
 * Update task status (for drag-and-drop)
 */
export async function updateTaskStatus(
  data: UpdateTaskStatusInput
): Promise<ActionResult<Task>> {
  return handleActionError(async () => {
    const user = await requireUser()
    const coach = await getCoachProfile(user.id)

    // Validate input
    const validatedData = updateTaskStatusSchema.parse(data)

    // Get the task to verify team ownership
    const existingTask = await prisma.task.findUnique({
      where: { id: validatedData.id },
      select: { teamId: true },
    })

    if (!existingTask) {
      throw new Error('Task not found')
    }

    // Verify coach has write access to the team
    await verifyTeamWriteAccess(coach.id, existingTask.teamId)

    // Update the task status
    const updateData: any = {
      status: validatedData.status,
    }

    // Mark as completed if status is COMPLETED
    if (validatedData.status === 'COMPLETED') {
      updateData.completedAt = new Date()
    } else {
      updateData.completedAt = null
    }

    const task = await prisma.task.update({
      where: { id: validatedData.id },
      data: updateData,
    })

    revalidatePath('/dashboard/tasks')
    return task
  })
}

/**
 * Delete a task (soft delete)
 */
export async function deleteTask(
  data: DeleteTaskInput
): Promise<ActionResult<void>> {
  return handleActionError(async () => {
    const user = await requireUser()
    const coach = await getCoachProfile(user.id)

    // Validate input
    const validatedData = deleteTaskSchema.parse(data)

    // Get the task to verify team ownership
    const existingTask = await prisma.task.findUnique({
      where: { id: validatedData.id },
      select: { teamId: true },
    })

    if (!existingTask) {
      throw new Error('Task not found')
    }

    // Verify coach has write access to the team
    await verifyTeamWriteAccess(coach.id, existingTask.teamId)

    // Delete the task (cascade will delete assignments)
    await prisma.task.delete({
      where: { id: validatedData.id },
    })

    revalidatePath('/dashboard/tasks')
  })
}

/**
 * Assign students to a task
 */
export async function assignStudentsToTask(
  data: AssignStudentsToTaskInput
): Promise<ActionResult<void>> {
  return handleActionError(async () => {
    const user = await requireUser()
    const coach = await getCoachProfile(user.id)

    // Validate input
    const validatedData = assignStudentsToTaskSchema.parse(data)

    // Get the task to verify team ownership
    const existingTask = await prisma.task.findUnique({
      where: { id: validatedData.taskId },
      select: { teamId: true, status: true },
    })

    if (!existingTask) {
      throw new Error('Task not found')
    }

    // Verify coach has write access to the team
    await verifyTeamWriteAccess(coach.id, existingTask.teamId)

    // Replace all assignments in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete existing assignments
      await tx.taskAssignment.deleteMany({
        where: { taskId: validatedData.taskId },
      })

      // Create new assignments
      if (validatedData.studentIds.length > 0) {
        await tx.taskAssignment.createMany({
          data: validatedData.studentIds.map((studentId) => ({
            taskId: validatedData.taskId,
            studentId,
            status: existingTask.status,
          })),
        })
      }
    })

    revalidatePath('/dashboard/tasks')
  })
}

/**
 * Get students for a team (for assignment dropdown)
 */
export async function getTeamStudents(
  teamId: string
): Promise<ActionResult<Student[]>> {
  return handleActionError(async () => {
    const user = await requireUser()
    const coach = await getCoachProfile(user.id)

    // Verify coach has access to the team
    await verifyTeamWriteAccess(coach.id, teamId)

    // Get all active students for this team
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        teamId,
        active: true,
      },
      include: {
        student: true,
      },
      orderBy: {
        student: {
          firstName: 'asc',
        },
      },
    })

    return teamMembers.map((tm) => tm.student)
  })
}

/**
 * Get the current user's first team (for demo purposes)
 * In production, this would allow team selection
 */
export async function getCurrentTeam(): Promise<ActionResult<{ id: string; name: string }>> {
  return handleActionError(async () => {
    const user = await requireUser()
    const coach = await getCoachProfile(user.id)

    // Get first team the coach has access to
    const teamCoach = await prisma.teamCoach.findFirst({
      where: {
        coachId: coach.id,
      },
      include: {
        team: true,
      },
    })

    if (!teamCoach) {
      throw new Error('No team found. Please create or join a team first.')
    }

    return {
      id: teamCoach.team.id,
      name: teamCoach.team.name,
    }
  })
}
