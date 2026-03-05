'use client'

import { useState, useEffect } from 'react'
import { CurriculumModule, CurriculumCategory, SkillLevel } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { ModuleCard } from '@/components/curriculum/module-card'
import { ModuleFormDialog } from '@/components/curriculum/module-form-dialog'
import { ModuleFilters } from '@/components/curriculum/module-filters'
import { getModules } from '@/app/actions/curriculum'
import { Plus, BookOpen, TrendingUp, Users, Award } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface ModuleWithStats extends CurriculumModule {
  stats: {
    totalStudents: number
    completedCount: number
    inProgressCount: number
    completionRate: number
  }
  lessons?: any[]
  progress?: any[]
}

export default function CurriculumPage() {
  const [modules, setModules] = useState<ModuleWithStats[]>([])
  const [filteredModules, setFilteredModules] = useState<ModuleWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<CurriculumModule | null>(null)
  const [filters, setFilters] = useState<{
    category?: CurriculumCategory
    difficultyLevel?: SkillLevel
    search?: string
  }>({})

  const fetchModules = async () => {
    setLoading(true)
    try {
      const result = await getModules()
      if (result.modules) {
        setModules(result.modules as ModuleWithStats[])
        setFilteredModules(result.modules as ModuleWithStats[])
      }
    } catch (error) {
      console.error('Error fetching modules:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchModules()
  }, [])

  useEffect(() => {
    let filtered = modules

    if (filters.category) {
      filtered = filtered.filter((m) => m.category === filters.category)
    }

    if (filters.difficultyLevel) {
      filtered = filtered.filter((m) => m.level === filters.difficultyLevel)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(searchLower) ||
          m.description?.toLowerCase().includes(searchLower)
      )
    }

    setFilteredModules(filtered)
  }, [filters, modules])

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  const handleCreateSuccess = (module: CurriculumModule) => {
    fetchModules()
    setCreateDialogOpen(false)
  }

  const handleEditSuccess = (module: CurriculumModule) => {
    fetchModules()
    setEditingModule(null)
  }

  const handleEdit = (module: ModuleWithStats) => {
    setEditingModule(module)
  }

  // Calculate overall stats
  const overallStats = {
    totalModules: modules.length,
    avgCompletionRate:
      modules.length > 0
        ? Math.round(
            modules.reduce((sum, m) => sum + m.stats.completionRate, 0) / modules.length
          )
        : 0,
    totalStudentsEnrolled: modules.reduce((sum, m) => sum + m.stats.totalStudents, 0),
    totalCompleted: modules.reduce((sum, m) => sum + m.stats.completedCount, 0),
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Curriculum</h1>
            <p className="text-muted-foreground mt-2">
              Manage learning modules and track student progress
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Create Module
          </Button>
        </div>

        {/* Overall Stats */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Modules</p>
                    <p className="text-3xl font-bold">{overallStats.totalModules}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Completion</p>
                    <p className="text-3xl font-bold">{overallStats.avgCompletionRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Students Enrolled</p>
                    <p className="text-3xl font-bold">{overallStats.totalStudentsEnrolled}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completions</p>
                    <p className="text-3xl font-bold">{overallStats.totalCompleted}</p>
                  </div>
                  <Award className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <ModuleFilters onFilterChange={handleFilterChange} />
        </div>

        {/* Modules Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-2 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredModules.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No modules found</h3>
                <p className="text-muted-foreground mb-4">
                  {filters.category || filters.difficultyLevel || filters.search
                    ? 'Try adjusting your filters or create a new module.'
                    : 'Get started by creating your first curriculum module.'}
                </p>
                {!filters.category && !filters.difficultyLevel && !filters.search && (
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Module
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                Showing {filteredModules.length} of {modules.length} modules
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredModules.map((module) => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    onEdit={handleEdit}
                    showActions={true}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Module Dialog */}
      <ModuleFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Module Dialog */}
      {editingModule && (
        <ModuleFormDialog
          open={!!editingModule}
          onOpenChange={(open) => !open && setEditingModule(null)}
          onSuccess={handleEditSuccess}
          module={editingModule}
        />
      )}
    </div>
  )
}
