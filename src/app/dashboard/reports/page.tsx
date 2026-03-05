import { Suspense } from 'react'
import Link from 'next/link'
import { FileText, TrendingUp, CheckCircle, Users } from 'lucide-react'
import { getReportCards } from '@/app/actions/reports'
import { getStudents } from '@/app/actions/students'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ReportCardList } from '@/components/reports/report-card-list'
import { BulkGenerateDialog } from '@/components/reports/bulk-generate-dialog'

export default async function ReportsPage() {
  const [reportsResult, studentsResult] = await Promise.all([
    getReportCards(),
    getStudents(),
  ])

  if ('error' in reportsResult) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Report Cards</h1>
          <p className="text-gray-500">Manage student progress reports</p>
        </div>
        <Card>
          <CardContent className="py-8">
            <p className="text-red-600">{reportsResult.error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if ('error' in studentsResult) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Report Cards</h1>
          <p className="text-gray-500">Manage student progress reports</p>
        </div>
        <Card>
          <CardContent className="py-8">
            <p className="text-red-600">{studentsResult.error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { reportCards = [], stats } = reportsResult
  const { students = [] } = studentsResult

  // Get the first team ID for bulk generation
  const teamId = students[0]?.teams?.[0]?.teamId || ''

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Report Cards</h1>
          <p className="text-gray-500">
            Manage student progress reports - {stats?.totalReports || 0} total
          </p>
        </div>
        <div className="flex gap-2">
          {teamId && students.length > 0 && (
            <BulkGenerateDialog students={students} teamId={teamId} />
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReports || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.publishedReports || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.draftReports || 0} in draft
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgAttendance || 0}%</div>
            <p className="text-xs text-muted-foreground">Across all reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">Active students</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Cards List */}
      {reportCards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Report Cards Yet</h3>
            <p className="text-gray-500 text-center mb-4">
              Get started by generating report cards for your students
            </p>
            {teamId && students.length > 0 && (
              <BulkGenerateDialog students={students} teamId={teamId} />
            )}
          </CardContent>
        </Card>
      ) : (
        <Suspense fallback={<div>Loading report cards...</div>}>
          <ReportCardList reportCards={reportCards} />
        </Suspense>
      )}
    </div>
  )
}
