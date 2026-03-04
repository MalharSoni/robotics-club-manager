'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-helpers'
import {
  createModuleSchema,
  updateModuleSchema,
  deleteModuleSchema,
  updateProgressSchema,
  bulkUpdateProgressSchema,
  moduleFilterSchema,
  type CreateModuleInput,
  type UpdateModuleInput,
  type DeleteModuleInput,
  type UpdateProgressInput,
  type BulkUpdateProgressInput,
  type ModuleFilterInput,
} from '@/lib/validations/curriculum'

// Helper to verify coach access
async function verifyCoachAccess(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { coachProfile: true },
  })

  if (!user || user.role !== 'COACH' || !user.coachProfile) {
    throw new Error('Unauthorized: Coach access required')
  }

  return user.coachProfile
}

// Get all modules with optional filters
export async function getModules(filters?: ModuleFilterInput) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }

    const validatedFilters = filters ? moduleFilterSchema.parse(filters) : {}

    const where: any = {
      active: true,
    }

    if (validatedFilters.category) {
      where.category = validatedFilters.category
    }

    if (validatedFilters.difficultyLevel) {
      where.level = validatedFilters.difficultyLevel
    }

    if (validatedFilters.search) {
      where.OR = [
        { title: { contains: validatedFilters.search, mode: 'insensitive' } },
        { description: { contains: validatedFilters.search, mode: 'insensitive' } },
      ]
    }

    const modules = await prisma.curriculumModule.findMany({
      where,
      include: {
        progress: validatedFilters.studentId
          ? {
              where: { studentId: validatedFilters.studentId },
            }
          : {
              select: {
                id: true,
                status: true,
                studentId: true,
              },
            },
        lessons: {
          select: {
            id: true,
            title: true,
            order: true,
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })

    // Calculate completion rates
    const modulesWithStats = modules.map((module) => {
      const totalStudents = module.progress.length
      const completedCount = module.progress.filter(
        (p) => p.status === 'COMPLETED' || p.status === 'MASTERED'
      ).length
      const inProgressCount = module.progress.filter((p) => p.status === 'IN_PROGRESS').length
      const completionRate = totalStudents > 0 ? (completedCount / totalStudents) * 100 : 0

      return {
        ...module,
        stats: {
          totalStudents,
          completedCount,
          inProgressCount,
          completionRate: Math.round(completionRate),
        },
      }
    })

    // Filter by status if requested
    if (validatedFilters.status && validatedFilters.studentId) {
      return {
        modules: modulesWithStats.filter((module) => {
          const progress = module.progress.find((p) => p.studentId === validatedFilters.studentId)
          return progress?.status === validatedFilters.status
        }),
      }
    }

    return { modules: modulesWithStats }
  } catch (error) {
    console.error('Error fetching modules:', error)
    return { error: 'Failed to fetch curriculum modules' }
  }
}

// Get single module with full details and student progress
export async function getModuleById(id: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }

    const module = await prisma.curriculumModule.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
        progress: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
                grade: true,
              },
            },
          },
          orderBy: {
            student: {
              lastName: 'asc',
            },
          },
        },
        subModules: {
          select: {
            id: true,
            title: true,
            category: true,
            level: true,
          },
        },
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    if (!module) {
      return { error: 'Module not found' }
    }

    // Calculate stats
    const totalStudents = module.progress.length
    const completedCount = module.progress.filter(
      (p) => p.status === 'COMPLETED' || p.status === 'MASTERED'
    ).length
    const inProgressCount = module.progress.filter((p) => p.status === 'IN_PROGRESS').length
    const completionRate = totalStudents > 0 ? (completedCount / totalStudents) * 100 : 0

    const avgQuizScore =
      module.progress.filter((p) => p.quizScore !== null).length > 0
        ? module.progress.reduce((sum, p) => sum + (p.quizScore || 0), 0) /
          module.progress.filter((p) => p.quizScore !== null).length
        : null

    return {
      module: {
        ...module,
        stats: {
          totalStudents,
          completedCount,
          inProgressCount,
          completionRate: Math.round(completionRate),
          avgQuizScore: avgQuizScore ? Math.round(avgQuizScore) : null,
        },
      },
    }
  } catch (error) {
    console.error('Error fetching module:', error)
    return { error: 'Failed to fetch module details' }
  }
}

// Create new curriculum module
export async function createModule(data: CreateModuleInput) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }

    await verifyCoachAccess(user.id)

    const validatedData = createModuleSchema.parse(data)

    // Get the highest order value to append new module at the end
    const maxOrder = await prisma.curriculumModule.findFirst({
      where: { category: validatedData.category },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const module = await prisma.curriculumModule.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        level: validatedData.difficultyLevel,
        estimatedHours: validatedData.durationHours,
        objectives: validatedData.learningObjectives,
        resources: validatedData.resources,
        order: (maxOrder?.order || 0) + 1,
      },
      include: {
        progress: {
          select: {
            id: true,
            status: true,
          },
        },
        lessons: true,
      },
    })

    revalidatePath('/dashboard/curriculum')
    return { module }
  } catch (error) {
    console.error('Error creating module:', error)
    return { error: 'Failed to create curriculum module' }
  }
}

// Update curriculum module
export async function updateModule(data: UpdateModuleInput) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }

    await verifyCoachAccess(user.id)

    const validatedData = updateModuleSchema.parse(data)
    const { id, ...updateData } = validatedData

    const updatePayload: any = {}

    if (updateData.title !== undefined) updatePayload.title = updateData.title
    if (updateData.description !== undefined) updatePayload.description = updateData.description
    if (updateData.category !== undefined) updatePayload.category = updateData.category
    if (updateData.difficultyLevel !== undefined) updatePayload.level = updateData.difficultyLevel
    if (updateData.durationHours !== undefined)
      updatePayload.estimatedHours = updateData.durationHours
    if (updateData.learningObjectives !== undefined)
      updatePayload.objectives = updateData.learningObjectives
    if (updateData.resources !== undefined) updatePayload.resources = updateData.resources
    if (updateData.active !== undefined) updatePayload.active = updateData.active

    const module = await prisma.curriculumModule.update({
      where: { id },
      data: updatePayload,
      include: {
        progress: {
          select: {
            id: true,
            status: true,
          },
        },
        lessons: true,
      },
    })

    revalidatePath('/dashboard/curriculum')
    revalidatePath(`/dashboard/curriculum/${id}`)
    return { module }
  } catch (error) {
    console.error('Error updating module:', error)
    return { error: 'Failed to update curriculum module' }
  }
}

// Delete curriculum module
export async function deleteModule(data: DeleteModuleInput) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }

    await verifyCoachAccess(user.id)

    const validatedData = deleteModuleSchema.parse(data)

    // Soft delete - just mark as inactive
    await prisma.curriculumModule.update({
      where: { id: validatedData.id },
      data: { active: false },
    })

    revalidatePath('/dashboard/curriculum')
    return { success: true }
  } catch (error) {
    console.error('Error deleting module:', error)
    return { error: 'Failed to delete curriculum module' }
  }
}

// Update student progress on a module
export async function updateStudentProgress(data: UpdateProgressInput) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }

    await verifyCoachAccess(user.id)

    const validatedData = updateProgressSchema.parse(data)

    // Check if progress record exists
    const existingProgress = await prisma.curriculumProgress.findUnique({
      where: {
        studentId_moduleId: {
          studentId: validatedData.studentId,
          moduleId: validatedData.moduleId,
        },
      },
    })

    const now = new Date()
    const updateData: any = {
      status: validatedData.status,
      lastAccessedAt: now,
    }

    if (validatedData.notes !== undefined) {
      updateData.coachNotes = validatedData.notes
    }

    if (validatedData.evidenceMediaId !== undefined) {
      updateData.evidenceMediaId = validatedData.evidenceMediaId
    }

    // Update timestamps based on status
    if (validatedData.status === 'IN_PROGRESS' && !existingProgress?.startedAt) {
      updateData.startedAt = now
    }

    if (
      (validatedData.status === 'COMPLETED' || validatedData.status === 'MASTERED') &&
      !existingProgress?.completedAt
    ) {
      updateData.completedAt = now
    }

    if (validatedData.quizScore !== undefined) {
      updateData.quizScore = validatedData.quizScore
      updateData.attempts = existingProgress ? existingProgress.attempts + 1 : 1
    }

    const progress = await prisma.curriculumProgress.upsert({
      where: {
        studentId_moduleId: {
          studentId: validatedData.studentId,
          moduleId: validatedData.moduleId,
        },
      },
      update: updateData,
      create: {
        studentId: validatedData.studentId,
        moduleId: validatedData.moduleId,
        ...updateData,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        module: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
    })

    revalidatePath('/dashboard/curriculum')
    revalidatePath(`/dashboard/curriculum/${validatedData.moduleId}`)
    return { progress }
  } catch (error) {
    console.error('Error updating student progress:', error)
    return { error: 'Failed to update student progress' }
  }
}

// Bulk update student progress
export async function bulkUpdateProgress(data: BulkUpdateProgressInput) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }

    await verifyCoachAccess(user.id)

    const validatedData = bulkUpdateProgressSchema.parse(data)

    const now = new Date()
    const updates = validatedData.studentIds.map((studentId) => {
      const updateData: any = {
        status: validatedData.status,
        lastAccessedAt: now,
      }

      if (validatedData.notes) {
        updateData.coachNotes = validatedData.notes
      }

      if (validatedData.status === 'IN_PROGRESS') {
        updateData.startedAt = now
      }

      if (validatedData.status === 'COMPLETED' || validatedData.status === 'MASTERED') {
        updateData.completedAt = now
      }

      return prisma.curriculumProgress.upsert({
        where: {
          studentId_moduleId: {
            studentId,
            moduleId: validatedData.moduleId,
          },
        },
        update: updateData,
        create: {
          studentId,
          moduleId: validatedData.moduleId,
          ...updateData,
        },
      })
    })

    await prisma.$transaction(updates)

    revalidatePath('/dashboard/curriculum')
    revalidatePath(`/dashboard/curriculum/${validatedData.moduleId}`)
    return { success: true, count: validatedData.studentIds.length }
  } catch (error) {
    console.error('Error bulk updating progress:', error)
    return { error: 'Failed to bulk update student progress' }
  }
}

// Get module dependencies (prerequisites)
export async function getModuleDependencies(moduleId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }

    const module = await prisma.curriculumModule.findUnique({
      where: { id: moduleId },
      select: {
        id: true,
        title: true,
        parent: {
          select: {
            id: true,
            title: true,
            category: true,
            level: true,
          },
        },
        subModules: {
          select: {
            id: true,
            title: true,
            category: true,
            level: true,
          },
        },
      },
    })

    if (!module) {
      return { error: 'Module not found' }
    }

    return { module }
  } catch (error) {
    console.error('Error fetching module dependencies:', error)
    return { error: 'Failed to fetch module dependencies' }
  }
}

// Get student's curriculum progress summary
export async function getStudentProgress(studentId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }

    const progress = await prisma.curriculumProgress.findMany({
      where: { studentId },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            category: true,
            level: true,
            estimatedHours: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    const stats = {
      total: progress.length,
      notStarted: progress.filter((p) => p.status === 'NOT_STARTED').length,
      inProgress: progress.filter((p) => p.status === 'IN_PROGRESS').length,
      completed: progress.filter((p) => p.status === 'COMPLETED').length,
      mastered: progress.filter((p) => p.status === 'MASTERED').length,
    }

    return { progress, stats }
  } catch (error) {
    console.error('Error fetching student progress:', error)
    return { error: 'Failed to fetch student progress' }
  }
}

// Get student's bootcamp progress with milestone details
export async function getStudentBootcampProgress(studentId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: 'Unauthorized' }
    }

    // Fetch all bootcamp milestones (orders 1-7)
    const bootcampModules = await prisma.curriculumModule.findMany({
      where: {
        active: true,
        order: { gte: 1, lte: 7 },
      },
      orderBy: { order: 'asc' },
      include: {
        progress: {
          where: { studentId },
          include: {
            evidenceMedia: true, // Include linked evidence photo
          },
        },
      },
    })

    // Calculate completion stats
    const completed = bootcampModules.filter(
      (m) => m.progress[0]?.status === 'COMPLETED' || m.progress[0]?.status === 'MASTERED'
    ).length

    const total = bootcampModules.length

    return {
      milestones: bootcampModules.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        category: m.category,
        order: m.order,
        completed: m.progress[0]?.status === 'COMPLETED' || m.progress[0]?.status === 'MASTERED',
        completedAt: m.progress[0]?.completedAt,
        status: m.progress[0]?.status || 'NOT_STARTED',
        evidenceMedia: m.progress[0]?.evidenceMedia || null, // Include evidence photo
        coachNotes: m.progress[0]?.coachNotes || null,
      })),
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  } catch (error) {
    console.error('Error fetching bootcamp progress:', error)
    return { error: 'Failed to fetch bootcamp progress' }
  }
}
