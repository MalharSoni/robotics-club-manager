'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { SkillsMatrixGrid } from '@/components/skills/skills-matrix-grid'
import { SkillCard } from '@/components/skills/skill-card'
import { SkillDetailModal } from '@/components/skills/skill-detail-modal'
import { SkillFormDialog } from '@/components/skills/skill-form-dialog'
import { getSkills, getTeamProficiencyStats } from '@/app/actions/skills'
import { SkillCategory, SkillLevel } from '@prisma/client'
import {
  Plus,
  Search,
  Filter,
  TrendingUp,
  Users,
  Award,
  BookOpen,
  LayoutGrid,
  List,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

const CATEGORY_TABS = [
  { value: 'ALL', label: 'All Skills', icon: LayoutGrid },
  { value: 'MECHANICAL', label: 'Mechanical', icon: Award },
  { value: 'ELECTRICAL', label: 'Electrical', icon: Award },
  { value: 'PROGRAMMING', label: 'Programming', icon: Award },
  { value: 'CAD_DESIGN', label: 'CAD Design', icon: Award },
  { value: 'PROJECT_MANAGEMENT', label: 'Project Mgmt', icon: Award },
  { value: 'COMMUNICATION', label: 'Communication', icon: Award },
  { value: 'LEADERSHIP', label: 'Leadership', icon: Award },
  { value: 'PROBLEM_SOLVING', label: 'Problem Solving', icon: Award },
]

export default function SkillsPage() {
  const [skills, setSkills] = useState<any[]>([])
  const [filteredSkills, setFilteredSkills] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [proficiencyFilter, setProficiencyFilter] = useState<string>('ALL')
  const [verifiedFilter, setVerifiedFilter] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [skills, selectedCategory, searchQuery, proficiencyFilter, verifiedFilter])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [skillsResult] = await Promise.all([
        getSkills(),
      ])

      if (skillsResult.error) {
        toast({
          title: 'Error',
          description: skillsResult.error,
          variant: 'destructive',
        })
      } else {
        setSkills(skillsResult.skills || [])
      }

      // Load team stats (you'd pass the actual teamId in production)
      // const statsResult = await getTeamProficiencyStats('team-id')
      // if (!statsResult.error) {
      //   setStats(statsResult.stats)
      // }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load skills data',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = skills

    // Category filter
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(
        (skill) => skill.category === selectedCategory
      )
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (skill) =>
          skill.name.toLowerCase().includes(query) ||
          skill.description?.toLowerCase().includes(query)
      )
    }

    // Proficiency filter
    if (proficiencyFilter !== 'ALL') {
      filtered = filtered.filter((skill) =>
        skill.students.some(
          (s: any) => s.proficiency === proficiencyFilter
        )
      )
    }

    // Verified filter
    if (verifiedFilter === 'VERIFIED') {
      filtered = filtered.filter((skill) =>
        skill.students.some((s: any) => s.verified)
      )
    } else if (verifiedFilter === 'UNVERIFIED') {
      filtered = filtered.filter((skill) =>
        skill.students.some((s: any) => !s.verified)
      )
    }

    setFilteredSkills(filtered)
  }

  const handleSkillClick = (skillId: string) => {
    setSelectedSkillId(skillId)
    setShowDetailModal(true)
  }

  const calculateOverallStats = () => {
    const totalSkills = skills.length
    const totalAssessments = skills.reduce(
      (sum, skill) => sum + skill.stats.totalStudents,
      0
    )
    const avgProficiency =
      skills.length > 0
        ? skills.reduce((sum, skill) => sum + skill.stats.avgProficiency, 0) /
          skills.length
        : 0
    const expertCount = skills.reduce(
      (sum, skill) => sum + skill.stats.proficiencyDistribution.EXPERT,
      0
    )

    // Skills added this season (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const recentSkills = skills.filter(
      (skill) => new Date(skill.createdAt) >= sixMonthsAgo
    ).length

    return {
      totalSkills,
      avgProficiency: avgProficiency.toFixed(2),
      recentSkills,
      expertCount,
      totalAssessments,
    }
  }

  const overallStats = calculateOverallStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Skills Matrix</h1>
          <p className="text-gray-600 mt-1">
            Track and assess student proficiency across all skills
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-gray-600">
                <BookOpen className="h-4 w-4" />
                <CardTitle className="text-sm font-medium">Total Skills</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.totalSkills}</div>
              <p className="text-xs text-gray-500 mt-1">
                {overallStats.recentSkills} added this season
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-gray-600">
                <TrendingUp className="h-4 w-4" />
                <CardTitle className="text-sm font-medium">
                  Avg Team Proficiency
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.avgProficiency}</div>
              <p className="text-xs text-gray-500 mt-1">Out of 4.0</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Award className="h-4 w-4" />
                <CardTitle className="text-sm font-medium">Expert Level</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.expertCount}</div>
              <p className="text-xs text-gray-500 mt-1">Student assessments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-4 w-4" />
                <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.totalAssessments}</div>
              <p className="text-xs text-gray-500 mt-1">Across all skills</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search skills by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={proficiencyFilter} onValueChange={setProficiencyFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Proficiency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Levels</SelectItem>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
                <SelectItem value="EXPERT">Expert</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="VERIFIED">Verified</SelectItem>
                <SelectItem value="UNVERIFIED">Unverified</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs and Content */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon
            const count =
              tab.value === 'ALL'
                ? skills.length
                : skills.filter((s) => s.category === tab.value).length

            return (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                <Icon className="h-4 w-4" />
                {tab.label}
                <Badge variant="secondary" className="ml-1">
                  {count}
                </Badge>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {CATEGORY_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSkills.map((skill) => (
                      <SkillCard
                        key={skill.id}
                        skill={skill}
                        onClick={() => handleSkillClick(skill.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <SkillsMatrixGrid
                    skills={filteredSkills}
                    onSkillClick={handleSkillClick}
                  />
                )}
                {filteredSkills.length === 0 && (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Filter className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        No skills found
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Try adjusting your filters or search query
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery('')
                          setProficiencyFilter('ALL')
                          setVerifiedFilter('ALL')
                        }}
                      >
                        Clear Filters
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Modals */}
      <SkillDetailModal
        skillId={selectedSkillId}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        onRefresh={loadData}
      />
      <SkillFormDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={loadData}
      />
    </div>
  )
}
