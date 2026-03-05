'use client'

import { useState, useMemo } from 'react'
import { Project, Team, Season, Student, ProjectRole, ProjectMedia } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ProjectCard } from './project-card'
import { ProjectFormDialog } from './project-form-dialog'
import { Plus, Search, SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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

interface ProjectsListClientProps {
  initialProjects: ProjectWithRelations[]
}

export function ProjectsListClient({ initialProjects }: ProjectsListClientProps) {
  const [projects] = useState<ProjectWithRelations[]>(initialProjects)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('recent')
  const [isFormOpen, setIsFormOpen] = useState(false)

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter((project) => {
      const matchesSearch =
        searchQuery === '' ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || project.status === statusFilter

      const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter

      return matchesSearch && matchesStatus && matchesCategory
    })

    // Sort projects
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'status':
          return a.status.localeCompare(b.status)
        case 'startDate':
          if (!a.startDate) return 1
          if (!b.startDate) return -1
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        case 'recent':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })

    return filtered
  }, [projects, searchQuery, statusFilter, categoryFilter, sortBy])

  // Calculate summary stats
  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === 'IN_PROGRESS').length,
    planning: projects.filter((p) => p.status === 'PLANNING').length,
    completed: projects.filter((p) => p.status === 'COMPLETED').length,
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500">Total Projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            <p className="text-xs text-gray-500">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">{stats.planning}</div>
            <p className="text-xs text-gray-500">Planning</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-gray-500">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <SlidersHorizontal className="h-4 w-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PLANNING">Planning</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="TESTING">Testing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="ROBOT">Robot Build</SelectItem>
                  <SelectItem value="MECHANISM">Mechanism</SelectItem>
                  <SelectItem value="AUTONOMOUS">Autonomous</SelectItem>
                  <SelectItem value="OUTREACH">Outreach</SelectItem>
                  <SelectItem value="FUNDRAISING">Fundraising</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recently Updated</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="startDate">Start Date</SelectItem>
                </SelectContent>
              </Select>

              {/* Active Filters Badge */}
              {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
                <Badge variant="secondary" className="ml-auto">
                  {filteredAndSortedProjects.length} of {projects.length} projects
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedProjects.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              {projects.length === 0 ? (
                <div>
                  <p className="text-gray-500 mb-4">No projects yet. Get started by creating your first project!</p>
                  <Button onClick={() => setIsFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Project
                  </Button>
                </div>
              ) : (
                <p className="text-gray-500">No projects found matching your filters.</p>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        )}
      </div>

      {/* Create Project Dialog */}
      <ProjectFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        mode="create"
      />
    </div>
  )
}
