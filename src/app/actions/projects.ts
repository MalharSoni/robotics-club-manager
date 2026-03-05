'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-helpers'
import {
  createProjectSchema,
  updateProjectSchema,
  assignStudentSchema,
  updateProjectRoleSchema,
  projectFilterSchema,
  updateProjectStatusSchema,
  removeStudentSchema,
  type CreateProjectInput,
  type UpdateProjectInput,
  type AssignStudentInput,
  type UpdateProjectRoleInput,
  type ProjectFilterInput,
  type UpdateProjectStatusInput,
  type RemoveStudentInput,
} from '@/lib/validations/project'

// Helper to get coach's team(s)
async function getCoachTeams(userId: string) {
  const coach = await prisma.coachProfile.findUnique({
    where: { userId },
    include: { teams: { include: { team: true } } },
  })

  if (!coach) {
    throw new Error('Coach profile not found')
  }

  return coach.teams.map((tc) => tc.team)
}

// Helper to verify team access
async function verifyTeamAccess(teamId: string, userId: string) {
  const teams = await getCoachTeams(userId)
  const hasAccess = teams.some((team) => team.id === teamId)

  if (!hasAccess) {
    throw new Error('Unauthorized: You do not have access to this team')
  }

  return true
}

// Get all projects for coach's team(s) with filters
export async function getProjects(filters?: ProjectFilterInput) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const teams = await getCoachTeams(user.id)
    const teamIds = teams.map((t) => t.id)

    if (teamIds.length === 0) {
      return { error: 'No team associated with coach' }
    }

    const validatedFilters = filters ? projectFilterSchema.parse(filters) : {}

    const where: any = {
      teamId: { in: teamIds },
    }

    if (validatedFilters.status) {
      where.status = validatedFilters.status
    }

    if (validatedFilters.category) {
      where.category = validatedFilters.category
    }

    if (validatedFilters.search) {
      where.OR = [
        { name: { contains: validatedFilters.search, mode: 'insensitive' } },
        { description: { contains: validatedFilters.search, mode: 'insensitive' } },
      ]
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        team: {
          include: {
            season: true,
          },
        },
        roles: {
          include: {
            student: true,
          },
        },
        media: {
          orderBy: { order: 'asc' },
          take: 5,
        },
      },
      orderBy: [
        { status: 'asc' },
        { startDate: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return { success: true, projects }
  } catch (error) {
    console.error('Error fetching projects:', error)
    return { error: 'Failed to fetch projects' }
  }
}

// Get single project by ID with full details
export async function getProjectById(projectId: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        team: {
          include: {
            season: true,
            coaches: {
              include: {
                coach: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
        roles: {
          include: {
            student: {
              include: {
                teams: {
                  include: {
                    team: true,
                  },
                },
              },
            },
          },
          orderBy: {
            joinedAt: 'asc',
          },
        },
        media: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!project) {
      return { error: 'Project not found' }
    }

    // Verify access
    await verifyTeamAccess(project.teamId, user.id)

    return { success: true, project }
  } catch (error) {
    console.error('Error fetching project:', error)
    return { error: 'Failed to fetch project' }
  }
}

// Create new project
export async function createProject(data: CreateProjectInput) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const validatedData = createProjectSchema.parse(data)

    // Get coach's first team if teamId not provided
    const teams = await getCoachTeams(user.id)
    if (teams.length === 0) {
      return { error: 'No team associated with coach' }
    }

    const teamId = validatedData.teamId || teams[0].id

    // Verify access to this team
    await verifyTeamAccess(teamId, user.id)

    const project = await prisma.project.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        category: validatedData.category,
        status: validatedData.status,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        goals: validatedData.goals,
        coverImage: validatedData.coverImage,
        teamId,
      },
      include: {
        team: true,
        roles: {
          include: {
            student: true,
          },
        },
      },
    })

    revalidatePath('/dashboard/projects')
    return { success: true, project }
  } catch (error) {
    console.error('Error creating project:', error)
    return { error: 'Failed to create project' }
  }
}

// Update project
export async function updateProject(data: UpdateProjectInput) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const validatedData = updateProjectSchema.parse(data)
    const { id, ...updateData } = validatedData

    // Verify project exists and access
    const existingProject = await prisma.project.findUnique({
      where: { id },
      include: { team: true },
    })

    if (!existingProject) {
      return { error: 'Project not found' }
    }

    await verifyTeamAccess(existingProject.teamId, user.id)

    // Transform date strings to Date objects
    const dataToUpdate: any = { ...updateData }
    if (dataToUpdate.startDate) {
      dataToUpdate.startDate = new Date(dataToUpdate.startDate)
    }
    if (dataToUpdate.endDate) {
      dataToUpdate.endDate = new Date(dataToUpdate.endDate)
    }

    // Set completedAt if status changes to COMPLETED
    if (dataToUpdate.status === 'COMPLETED' && existingProject.status !== 'COMPLETED') {
      dataToUpdate.completedAt = new Date()
    }

    const project = await prisma.project.update({
      where: { id },
      data: dataToUpdate,
      include: {
        team: true,
        roles: {
          include: {
            student: true,
          },
        },
      },
    })

    revalidatePath('/dashboard/projects')
    revalidatePath(`/dashboard/projects/${id}`)
    return { success: true, project }
  } catch (error) {
    console.error('Error updating project:', error)
    return { error: 'Failed to update project' }
  }
}

// Delete/Archive project
export async function deleteProject(projectId: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { team: true },
    })

    if (!project) {
      return { error: 'Project not found' }
    }

    await verifyTeamAccess(project.teamId, user.id)

    // Soft delete by archiving
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'ARCHIVED' },
    })

    revalidatePath('/dashboard/projects')
    return { success: true }
  } catch (error) {
    console.error('Error deleting project:', error)
    return { error: 'Failed to delete project' }
  }
}

// Assign student to project with role
export async function assignStudentToProject(data: AssignStudentInput) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const validatedData = assignStudentSchema.parse(data)

    // Verify project access
    const project = await prisma.project.findUnique({
      where: { id: validatedData.projectId },
      include: { team: true },
    })

    if (!project) {
      return { error: 'Project not found' }
    }

    await verifyTeamAccess(project.teamId, user.id)

    // Verify student exists and is on the team
    const student = await prisma.student.findUnique({
      where: { id: validatedData.studentId },
      include: {
        teams: true,
      },
    })

    if (!student) {
      return { error: 'Student not found' }
    }

    const isOnTeam = student.teams.some((tm) => tm.teamId === project.teamId)
    if (!isOnTeam) {
      return { error: 'Student is not a member of this team' }
    }

    // Create or update project role
    const projectRole = await prisma.projectRole.upsert({
      where: {
        projectId_studentId: {
          projectId: validatedData.projectId,
          studentId: validatedData.studentId,
        },
      },
      create: {
        projectId: validatedData.projectId,
        studentId: validatedData.studentId,
        role: validatedData.role,
        hoursSpent: validatedData.contributionHours,
      },
      update: {
        role: validatedData.role,
        hoursSpent: validatedData.contributionHours,
      },
      include: {
        student: true,
      },
    })

    revalidatePath(`/dashboard/projects/${validatedData.projectId}`)
    revalidatePath(`/dashboard/students/${validatedData.studentId}`)
    return { success: true, projectRole }
  } catch (error) {
    console.error('Error assigning student to project:', error)
    return { error: 'Failed to assign student to project' }
  }
}

// Remove student from project
export async function removeStudentFromProject(data: RemoveStudentInput) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const validatedData = removeStudentSchema.parse(data)

    // Verify project access
    const project = await prisma.project.findUnique({
      where: { id: validatedData.projectId },
      include: { team: true },
    })

    if (!project) {
      return { error: 'Project not found' }
    }

    await verifyTeamAccess(project.teamId, user.id)

    // Delete the project role
    await prisma.projectRole.delete({
      where: {
        projectId_studentId: {
          projectId: validatedData.projectId,
          studentId: validatedData.studentId,
        },
      },
    })

    revalidatePath(`/dashboard/projects/${validatedData.projectId}`)
    revalidatePath(`/dashboard/students/${validatedData.studentId}`)
    return { success: true }
  } catch (error) {
    console.error('Error removing student from project:', error)
    return { error: 'Failed to remove student from project' }
  }
}

// Update project status
export async function updateProjectStatus(data: UpdateProjectStatusInput) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const validatedData = updateProjectStatusSchema.parse(data)

    const project = await prisma.project.findUnique({
      where: { id: validatedData.id },
      include: { team: true },
    })

    if (!project) {
      return { error: 'Project not found' }
    }

    await verifyTeamAccess(project.teamId, user.id)

    const updateData: any = {
      status: validatedData.status,
    }

    // Set completedAt if status changes to COMPLETED
    if (validatedData.status === 'COMPLETED' && project.status !== 'COMPLETED') {
      updateData.completedAt = new Date()
    }

    const updatedProject = await prisma.project.update({
      where: { id: validatedData.id },
      data: updateData,
      include: {
        team: true,
        roles: {
          include: {
            student: true,
          },
        },
      },
    })

    revalidatePath('/dashboard/projects')
    revalidatePath(`/dashboard/projects/${validatedData.id}`)
    return { success: true, project: updatedProject }
  } catch (error) {
    console.error('Error updating project status:', error)
    return { error: 'Failed to update project status' }
  }
}

// Update project role (hours, contributions)
export async function updateProjectRole(data: UpdateProjectRoleInput) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'COACH') {
      return { error: 'Unauthorized' }
    }

    const validatedData = updateProjectRoleSchema.parse(data)
    const { id, ...updateData } = validatedData

    const projectRole = await prisma.projectRole.findUnique({
      where: { id },
      include: {
        project: {
          include: { team: true },
        },
      },
    })

    if (!projectRole) {
      return { error: 'Project role not found' }
    }

    await verifyTeamAccess(projectRole.project.teamId, user.id)

    const updatedRole = await prisma.projectRole.update({
      where: { id },
      data: updateData,
      include: {
        student: true,
        project: true,
      },
    })

    revalidatePath(`/dashboard/projects/${projectRole.projectId}`)
    return { success: true, projectRole: updatedRole }
  } catch (error) {
    console.error('Error updating project role:', error)
    return { error: 'Failed to update project role' }
  }
}
