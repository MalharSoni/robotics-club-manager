'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Project, Team, Season, Student, ProjectRole, ProjectMedia } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TeamRoster } from './team-roster'
import { MilestoneChecklist } from './milestone-checklist'
import { ProjectFormDialog } from './project-form-dialog'
import {
  Calendar,
  Edit,
  Trash2,
  Archive,
  Clock,
  Target,
  Users,
  Image as ImageIcon,
  Activity,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { updateProjectStatus, deleteProject } from '@/app/actions/projects'
import { toast } from '@/components/ui/use-toast'

type ProjectWithRelations = Project & {
  team: Team & {
    season: Season | null
  }
  roles: Array<
    ProjectRole & {
      student: Student
    }
  >
  media: ProjectMedia[]
}

interface ProjectDetailClientProps {
  project: ProjectWithRelations
  availableStudents: Student[]
}

export function ProjectDetailClient({ project, availableStudents }: ProjectDetailClientProps) {
  const router = useRouter()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isChangingStatus, setIsChangingStatus] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNING':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'TESTING':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'ARCHIVED':
        return 'bg-slate-100 text-slate-600 border-slate-300'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ROBOT':
        return 'bg-orange-100 text-orange-800'
      case 'MECHANISM':
        return 'bg-blue-100 text-blue-800'
      case 'AUTONOMOUS':
        return 'bg-purple-100 text-purple-800'
      case 'OUTREACH':
        return 'bg-green-100 text-green-800'
      case 'FUNDRAISING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace('_', ' ')
  }

  const handleStatusChange = async (newStatus: string) => {
    setIsChangingStatus(true)
    const result = await updateProjectStatus({
      id: project.id,
      status: newStatus as any,
    })

    setIsChangingStatus(false)

    if ('error' in result) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: 'Project status updated successfully',
      })
      router.refresh()
    }
  }

  const handleArchiveProject = async () => {
    if (!confirm('Are you sure you want to archive this project?')) {
      return
    }

    const result = await deleteProject(project.id)

    if ('error' in result) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: 'Project archived successfully',
      })
      router.push('/dashboard/projects')
      router.refresh()
    }
  }

  const totalHours = project.roles.reduce((sum, role) => sum + (role.hoursSpent || 0), 0)
  const daysActive = project.startDate
    ? Math.ceil(
        (new Date().getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className={getStatusColor(project.status)}>
                  {formatStatus(project.status)}
                </Badge>
                <Badge variant="outline" className={getCategoryColor(project.category)}>
                  {project.category}
                </Badge>
                {project.team.season && (
                  <Badge variant="secondary">{project.team.season.name}</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
              <p className="text-gray-600">{project.description || 'No description provided'}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleArchiveProject}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            {/* Timeline */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>Timeline</span>
              </div>
              {project.startDate && (
                <div className="text-sm">
                  <span className="text-gray-500">Start:</span>
                  <span className="ml-1 font-medium">
                    {format(new Date(project.startDate), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
              {project.endDate && (
                <div className="text-sm">
                  <span className="text-gray-500">End:</span>
                  <span className="ml-1 font-medium">
                    {format(new Date(project.endDate), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
              {!project.startDate && !project.endDate && (
                <p className="text-sm text-gray-400">Not set</p>
              )}
            </div>

            {/* Team Size */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users className="h-4 w-4" />
                <span>Team Size</span>
              </div>
              <div className="text-2xl font-bold">{project.roles.length}</div>
              <p className="text-xs text-gray-500">
                {project.roles.filter((r) => r.role.toUpperCase().includes('LEAD')).length} leads
              </p>
            </div>

            {/* Total Hours */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Total Hours</span>
              </div>
              <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
              <p className="text-xs text-gray-500">logged</p>
            </div>

            {/* Days Active */}
            {project.startDate && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Activity className="h-4 w-4" />
                  <span>Duration</span>
                </div>
                <div className="text-2xl font-bold">{daysActive}</div>
                <p className="text-xs text-gray-500">days active</p>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Status Change */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Change Status:</span>
            <Select
              value={project.status}
              onValueChange={handleStatusChange}
              disabled={isChangingStatus}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLANNING">Planning</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="TESTING">Testing</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team ({project.roles.length})</TabsTrigger>
          <TabsTrigger value="goals">Goals ({project.goals?.length || 0})</TabsTrigger>
          <TabsTrigger value="media">Media ({project.media?.length || 0})</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Team:</span>
                  <p className="font-medium">{project.team.name}</p>
                </div>
                {project.team.season && (
                  <div>
                    <span className="text-sm text-gray-500">Season:</span>
                    <p className="font-medium">{project.team.season.name}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-500">Created:</span>
                  <p className="font-medium">
                    {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Last Updated:</span>
                  <p className="font-medium">
                    {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                  </p>
                </div>
                {project.completedAt && (
                  <div>
                    <span className="text-sm text-gray-500">Completed:</span>
                    <p className="font-medium">
                      {format(new Date(project.completedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Goals Completed</span>
                  <span className="font-bold">
                    {project.outcomes?.length || 0} / {project.goals?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Team Members</span>
                  <span className="font-bold">{project.roles.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total Hours Logged</span>
                  <span className="font-bold">{totalHours.toFixed(1)} hrs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Media Items</span>
                  <span className="font-bold">{project.media?.length || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Goals Preview */}
          <MilestoneChecklist
            projectId={project.id}
            goals={project.goals || []}
            outcomes={project.outcomes || []}
            status={project.status}
          />
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <TeamRoster
            projectId={project.id}
            roles={project.roles}
            availableStudents={availableStudents}
          />
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals">
          <MilestoneChecklist
            projectId={project.id}
            goals={project.goals || []}
            outcomes={project.outcomes || []}
            status={project.status}
          />
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle>Photo Gallery</CardTitle>
              <CardDescription>
                Project photos and documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {project.media && project.media.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {project.media.map((item) => (
                    <div
                      key={item.id}
                      className="aspect-square rounded-lg border overflow-hidden bg-gray-100"
                    >
                      {item.type === 'IMAGE' ? (
                        <img
                          src={item.url}
                          alt={item.title || 'Project image'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No media uploaded yet</p>
                  <p className="text-sm mt-1">Photo upload coming soon</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>
                Project history and milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Created */}
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
                  <div className="flex-1">
                    <p className="font-medium">Project Created</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(project.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>

                {/* Completed if applicable */}
                {project.completedAt && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-600 mt-2" />
                    <div className="flex-1">
                      <p className="font-medium">Project Completed</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(project.completedAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Last updated */}
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-2" />
                  <div className="flex-1">
                    <p className="font-medium">Last Updated</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(project.updatedAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <ProjectFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        project={project}
        mode="edit"
      />
    </div>
  )
}
