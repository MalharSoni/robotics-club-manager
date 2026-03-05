'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { MetricCard } from '@/components/analytics/metric-card'
import { TimeRangeSelector } from '@/components/analytics/time-range-selector'
import { LineChart } from '@/components/analytics/line-chart'
import { BarChart } from '@/components/analytics/bar-chart'
import { PieChart } from '@/components/analytics/pie-chart'
import { TopPerformers } from '@/components/analytics/top-performers'
import { InsightsPanel } from '@/components/analytics/insights-panel'
import {
  getDashboardStats,
  getStudentGrowthData,
  getSkillsDistribution,
  getTaskCompletionTrends,
  getTopPerformers,
  getTeamInsights,
  exportAnalyticsPDF,
} from '@/app/actions/analytics'
import {
  UsersIcon,
  TrendingUpIcon,
  CheckCircle2Icon,
  FolderIcon,
  CalendarCheckIcon,
  DownloadIcon,
  RefreshCwIcon,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type TimeRangePreset = 'WEEK' | 'MONTH' | 'SEASON' | 'ALL_TIME'

interface DashboardStats {
  totalStudents: number
  studentGrowth: number
  avgProficiency: string
  tasksCompleted: number
  taskCompletionRate: string
  activeProjects: number
  avgAttendance: number
}

export default function AnalyticsPage() {
  const { toast } = useToast()
  const [timeRange, setTimeRange] = useState<TimeRangePreset>('SEASON')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Dashboard stats
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [studentGrowth, setStudentGrowth] = useState<any[]>([])
  const [skillsDistribution, setSkillsDistribution] = useState<any>(null)
  const [taskTrends, setTaskTrends] = useState<any[]>([])
  const [topSkillsPerformers, setTopSkillsPerformers] = useState<any[]>([])
  const [topTasksPerformers, setTopTasksPerformers] = useState<any[]>([])
  const [topProjectsPerformers, setTopProjectsPerformers] = useState<any[]>([])
  const [insights, setInsights] = useState<any>(null)

  const loadAnalyticsData = async () => {
    try {
      setRefreshing(true)

      // Load dashboard stats
      const statsResult = await getDashboardStats(undefined, { preset: timeRange })
      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats)
      }

      // Load student growth
      const growthResult = await getStudentGrowthData(undefined, { preset: timeRange })
      if (growthResult.success && growthResult.data) {
        setStudentGrowth(growthResult.data)
      }

      // Load skills distribution
      const skillsResult = await getSkillsDistribution()
      if (skillsResult.success && skillsResult.data) {
        setSkillsDistribution(skillsResult.data)
      }

      // Load task completion trends
      const tasksResult = await getTaskCompletionTrends(undefined, { preset: timeRange })
      if (tasksResult.success && tasksResult.data) {
        setTaskTrends(tasksResult.data)
      }

      // Load top performers - skills
      const topSkillsResult = await getTopPerformers({
        metric: 'SKILLS_MASTERED',
        limit: 5,
      })
      if (topSkillsResult.success && topSkillsResult.data) {
        setTopSkillsPerformers(topSkillsResult.data)
      }

      // Load top performers - tasks
      const topTasksResult = await getTopPerformers({
        metric: 'TASKS_COMPLETED',
        limit: 5,
      })
      if (topTasksResult.success && topTasksResult.data) {
        setTopTasksPerformers(topTasksResult.data)
      }

      // Load top performers - projects
      const topProjectsResult = await getTopPerformers({
        metric: 'PROJECT_CONTRIBUTIONS',
        limit: 5,
      })
      if (topProjectsResult.success && topProjectsResult.data) {
        setTopProjectsPerformers(topProjectsResult.data)
      }

      // Load team insights
      const insightsResult = await getTeamInsights()
      if (insightsResult.success && insightsResult.insights) {
        setInsights(insightsResult.insights)
      }

      setLoading(false)
      setRefreshing(false)
    } catch (error) {
      console.error('Error loading analytics data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      })
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const handleExportPDF = async () => {
    try {
      toast({
        title: 'Exporting...',
        description: 'Preparing your analytics report',
      })
      const result = await exportAnalyticsPDF(undefined, { preset: timeRange })
      if (result.success) {
        toast({
          title: 'Export Complete',
          description: result.message || 'PDF exported successfully',
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export analytics PDF',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCwIcon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights and performance metrics for your team
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAnalyticsData}
            disabled={refreshing}
          >
            <RefreshCwIcon
              className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <TimeRangeSelector value={timeRange} onChange={setTimeRange} />

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          trend={stats?.studentGrowth}
          trendLabel="from last period"
          icon={<UsersIcon className="h-4 w-4" />}
        />
        <MetricCard
          title="Avg Skill Proficiency"
          value={stats?.avgProficiency || '0.0'}
          subtitle="Out of 4.0"
          icon={<TrendingUpIcon className="h-4 w-4" />}
        />
        <MetricCard
          title="Tasks Completed"
          value={stats?.tasksCompleted || 0}
          subtitle={`${stats?.taskCompletionRate || 0}% completion rate`}
          icon={<CheckCircle2Icon className="h-4 w-4" />}
        />
        <MetricCard
          title="Active Projects"
          value={stats?.activeProjects || 0}
          subtitle="In progress or planning"
          icon={<FolderIcon className="h-4 w-4" />}
        />
        <MetricCard
          title="Avg Attendance"
          value={`${stats?.avgAttendance || 0}%`}
          icon={<CalendarCheckIcon className="h-4 w-4" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Student Growth Chart */}
        <LineChart
          title="Student Enrollment Growth"
          description="Total students over time"
          data={studentGrowth}
          xKey="month"
          lines={[
            { key: 'total', color: '#8884d8', name: 'Total Students' },
            { key: 'new', color: '#82ca9d', name: 'New Students' },
          ]}
          height={300}
        />

        {/* Task Completion Trends */}
        <LineChart
          title="Task Completion Trends"
          description="Tasks completed and assigned over time"
          data={taskTrends}
          xKey="date"
          lines={[
            { key: 'completed', color: '#82ca9d', name: 'Completed' },
            { key: 'total', color: '#8884d8', name: 'Total' },
          ]}
          height={300}
        />
      </div>

      {/* More Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Skills Distribution - Bar Chart */}
        {skillsDistribution && (
          <BarChart
            title="Skills Proficiency Distribution"
            description="Number of skills by proficiency level"
            data={[
              {
                name: 'Beginner',
                count: skillsDistribution.proficiencyDistribution.BEGINNER || 0,
              },
              {
                name: 'Intermediate',
                count: skillsDistribution.proficiencyDistribution.INTERMEDIATE || 0,
              },
              {
                name: 'Advanced',
                count: skillsDistribution.proficiencyDistribution.ADVANCED || 0,
              },
              {
                name: 'Expert',
                count: skillsDistribution.proficiencyDistribution.EXPERT || 0,
              },
            ]}
            xKey="name"
            bars={[{ key: 'count', color: '#8884d8', name: 'Skills' }]}
            height={300}
          />
        )}

        {/* Category Distribution - Pie Chart */}
        {skillsDistribution && (
          <PieChart
            title="Skills by Category"
            description="Distribution of skills across categories"
            data={Object.entries(skillsDistribution.categoryDistribution).map(
              ([name, value]) => ({
                name,
                value: value as number,
              })
            )}
            height={300}
            donut
          />
        )}
      </div>

      {/* Top Performers Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <TopPerformers
          title="Top Skills Masters"
          description="Students with most skills"
          performers={topSkillsPerformers}
          metric="Skills Mastered"
        />
        <TopPerformers
          title="Top Task Completers"
          description="Students with most completed tasks"
          performers={topTasksPerformers}
          metric="Tasks Completed"
        />
        <TopPerformers
          title="Top Project Contributors"
          description="Students with most project roles"
          performers={topProjectsPerformers}
          metric="Projects"
        />
      </div>

      {/* Top Skills Bar Chart */}
      {skillsDistribution && skillsDistribution.topSkills.length > 0 && (
        <BarChart
          title="Most Common Skills"
          description="Top 10 skills being learned by students"
          data={skillsDistribution.topSkills}
          xKey="name"
          bars={[{ key: 'count', color: '#82ca9d', name: 'Students' }]}
          height={300}
          horizontal
        />
      )}

      {/* Team Insights */}
      {insights && (
        <InsightsPanel
          skillGaps={insights.skillGaps || []}
          studentsNeedingAttention={insights.studentsNeedingAttention || []}
          recommendedModules={insights.recommendedModules || []}
          upcomingDeadlines={insights.upcomingDeadlines || []}
        />
      )}
    </div>
  )
}
