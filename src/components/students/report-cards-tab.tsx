'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { Download, Eye } from 'lucide-react'

interface ReportCardsTabProps {
  student: {
    id: string
    firstName: string
    lastName: string
    reportCards: Array<{
      id: string
      periodName: string
      startDate: Date
      endDate: Date
      overallGrade: string | null
      attendance: number | null
      technicalSkills: number | null
      teamwork: number | null
      leadership: number | null
      communication: number | null
      problemSolving: number | null
      initiative: number | null
      strengths: string | null
      areasForGrowth: string | null
      coachComments: string | null
      published: boolean
      publishedAt: Date | null
      createdAt: Date
    }>
  }
}

const GRADE_COLORS = {
  A: 'bg-green-100 text-green-800',
  'A-': 'bg-green-100 text-green-800',
  'B+': 'bg-blue-100 text-blue-800',
  B: 'bg-blue-100 text-blue-800',
  'B-': 'bg-blue-100 text-blue-800',
  'C+': 'bg-yellow-100 text-yellow-800',
  C: 'bg-yellow-100 text-yellow-800',
  'C-': 'bg-yellow-100 text-yellow-800',
  D: 'bg-orange-100 text-orange-800',
  F: 'bg-red-100 text-red-800',
  Excellent: 'bg-green-100 text-green-800',
  Good: 'bg-blue-100 text-blue-800',
  Satisfactory: 'bg-yellow-100 text-yellow-800',
  'Needs Improvement': 'bg-orange-100 text-orange-800',
}

export function ReportCardsTab({ student }: ReportCardsTabProps) {
  const publishedReportCards = student.reportCards.filter((rc) => rc.published)
  const draftReportCards = student.reportCards.filter((rc) => !rc.published)

  const renderRatingStars = (rating: number | null) => {
    if (!rating) return <span className="text-xs text-gray-400">Not rated</span>

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
          >
            ★
          </span>
        ))}
        <span className="text-xs text-gray-600 ml-1">{rating}/5</span>
      </div>
    )
  }

  const getGradeBadgeColor = (grade: string | null): string => {
    if (!grade) return 'bg-gray-100 text-gray-800'
    return GRADE_COLORS[grade as keyof typeof GRADE_COLORS] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Report Cards Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Published Report Cards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedReportCards.length}</div>
            <p className="text-xs text-gray-500 mt-1">Available for viewing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Average Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {publishedReportCards.length > 0
                ? (
                    publishedReportCards.reduce((sum, rc) => sum + (rc.attendance || 0), 0) /
                    publishedReportCards.length
                  ).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-gray-500 mt-1">Across all periods</p>
          </CardContent>
        </Card>
      </div>

      {/* Published Report Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Report Cards</CardTitle>
          <CardDescription>Historical performance evaluations</CardDescription>
        </CardHeader>
        <CardContent>
          {publishedReportCards.length === 0 ? (
            <p className="text-sm text-gray-500">No published report cards yet</p>
          ) : (
            <div className="space-y-4">
              {publishedReportCards.map((reportCard) => (
                <Card key={reportCard.id} className="border-2">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{reportCard.periodName}</CardTitle>
                        <CardDescription>
                          {format(new Date(reportCard.startDate), 'MMM d, yyyy')} -{' '}
                          {format(new Date(reportCard.endDate), 'MMM d, yyyy')}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {reportCard.overallGrade && (
                          <Badge
                            className={getGradeBadgeColor(reportCard.overallGrade)}
                            variant="secondary"
                          >
                            {reportCard.overallGrade}
                          </Badge>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Ratings Grid */}
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700">Technical Skills</p>
                          {renderRatingStars(reportCard.technicalSkills)}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700">Teamwork</p>
                          {renderRatingStars(reportCard.teamwork)}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700">Leadership</p>
                          {renderRatingStars(reportCard.leadership)}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700">Communication</p>
                          {renderRatingStars(reportCard.communication)}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700">Problem Solving</p>
                          {renderRatingStars(reportCard.problemSolving)}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700">Initiative</p>
                          {renderRatingStars(reportCard.initiative)}
                        </div>
                      </div>

                      {/* Attendance */}
                      {reportCard.attendance !== null && (
                        <div className="pt-2 border-t">
                          <p className="text-sm font-medium text-gray-700 mb-2">Attendance</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${reportCard.attendance}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{reportCard.attendance}%</span>
                          </div>
                        </div>
                      )}

                      {/* Narrative Feedback */}
                      <div className="space-y-3 pt-2 border-t">
                        {reportCard.strengths && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Strengths</p>
                            <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-md">
                              {reportCard.strengths}
                            </p>
                          </div>
                        )}

                        {reportCard.areasForGrowth && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              Areas for Growth
                            </p>
                            <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-md">
                              {reportCard.areasForGrowth}
                            </p>
                          </div>
                        )}

                        {reportCard.coachComments && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Coach Comments</p>
                            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                              {reportCard.coachComments}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="pt-2 border-t text-xs text-gray-500">
                        <p>
                          Created on{' '}
                          {format(new Date(reportCard.createdAt), 'MMM d, yyyy')}
                        </p>
                        {reportCard.publishedAt && (
                          <p>
                            Published on {format(new Date(reportCard.publishedAt), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Draft Report Cards (if any) */}
      {draftReportCards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Draft Report Cards</CardTitle>
            <CardDescription>Unpublished evaluations in progress</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {draftReportCards.map((reportCard) => (
                  <TableRow key={reportCard.id}>
                    <TableCell className="font-medium">{reportCard.periodName}</TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {format(new Date(reportCard.startDate), 'MMM d')} -{' '}
                        {format(new Date(reportCard.endDate), 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>Coach</TableCell>
                    <TableCell>{format(new Date(reportCard.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-100 text-yellow-800" variant="secondary">
                        Draft
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* No Report Cards Message */}
      {student.reportCards.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-gray-500">
              No report cards yet. Create a report card to document this student's progress.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
