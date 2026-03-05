'use client'

import { format } from 'date-fns'
import { Star, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface Student {
  id: string
  firstName: string
  lastName: string
  grade?: number | null
  email?: string | null
  avatar?: string | null
}

interface Team {
  id: string
  name: string
  teamNumber?: string | null
}

interface ReportCard {
  id: string
  studentId: string
  teamId: string
  periodName: string
  startDate: Date
  endDate: Date
  published: boolean
  publishedAt: Date | null
  attendance: number | null
  technicalSkills: number | null
  teamwork: number | null
  leadership: number | null
  communication: number | null
  problemSolving: number | null
  initiative: number | null
  strengths?: string | null
  areasForGrowth?: string | null
  coachComments?: string | null
  goals?: string | null
  overallGrade?: string | null
  tasksCompleted: number
  projectsCompleted: number
  hoursLogged: number
  createdAt: Date
  updatedAt: Date
  student: Student
  team: Team
}

interface ReportCardPreviewProps {
  reportCard: ReportCard
}

function RatingStars({ rating }: { rating: number | null }) {
  if (!rating) {
    return <span className="text-gray-400 text-sm">Not rated</span>
  }

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => (
        <Star
          key={star}
          className={cn(
            'h-5 w-5',
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-300'
          )}
        />
      ))}
      <span className="ml-2 text-sm font-medium">{rating}/5</span>
    </div>
  )
}

export function ReportCardPreview({ reportCard }: ReportCardPreviewProps) {
  const handlePrint = () => {
    window.print()
  }

  const { student, team } = reportCard

  return (
    <div className="space-y-6">
      {/* Print Button */}
      <div className="flex justify-end gap-2 print:hidden">
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print / Save as PDF
        </Button>
      </div>

      {/* Report Card */}
      <Card className="print:shadow-none print:border-0">
        <CardHeader className="text-center border-b">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">{team.name}</div>
            <CardTitle className="text-3xl">Progress Report Card</CardTitle>
            <div className="text-xl font-semibold">
              {student.firstName} {student.lastName}
            </div>
            <div className="text-sm text-gray-600">{reportCard.periodName}</div>
            <div className="text-sm text-gray-600">
              {format(new Date(reportCard.startDate), 'MMMM d, yyyy')} -{' '}
              {format(new Date(reportCard.endDate), 'MMMM d, yyyy')}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 p-6">
          {/* Student Information */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {student.grade && (
              <div>
                <span className="text-gray-600">Grade:</span>{' '}
                <span className="font-medium">{student.grade}</span>
              </div>
            )}
            {student.email && (
              <div>
                <span className="text-gray-600">Email:</span>{' '}
                <span className="font-medium">{student.email}</span>
              </div>
            )}
            {reportCard.attendance !== null && (
              <div>
                <span className="text-gray-600">Attendance:</span>{' '}
                <span className="font-medium">{reportCard.attendance}%</span>
              </div>
            )}
            {reportCard.overallGrade && (
              <div>
                <span className="text-gray-600">Overall Grade:</span>{' '}
                <span className="font-medium">{reportCard.overallGrade}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Ratings Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Performance Ratings</h3>
            <div className="grid gap-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Technical Skills</span>
                <RatingStars rating={reportCard.technicalSkills} />
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Teamwork & Collaboration</span>
                <RatingStars rating={reportCard.teamwork} />
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Leadership & Initiative</span>
                <RatingStars rating={reportCard.leadership} />
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Communication</span>
                <RatingStars rating={reportCard.communication} />
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Problem Solving</span>
                <RatingStars rating={reportCard.problemSolving} />
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Initiative & Reliability</span>
                <RatingStars rating={reportCard.initiative} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Metrics */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Activity Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {reportCard.tasksCompleted}
                </div>
                <div className="text-sm text-gray-600">Tasks Completed</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {reportCard.projectsCompleted}
                </div>
                <div className="text-sm text-gray-600">Projects Completed</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {reportCard.hoursLogged}
                </div>
                <div className="text-sm text-gray-600">Hours Logged</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Narrative Feedback */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Feedback & Comments</h3>

            {reportCard.strengths && (
              <div>
                <h4 className="font-medium text-green-700 mb-2">
                  Strengths & Achievements
                </h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {reportCard.strengths}
                </p>
              </div>
            )}

            {reportCard.areasForGrowth && (
              <div>
                <h4 className="font-medium text-orange-700 mb-2">Areas for Growth</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {reportCard.areasForGrowth}
                </p>
              </div>
            )}

            {reportCard.coachComments && (
              <div>
                <h4 className="font-medium text-blue-700 mb-2">Coach Comments</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {reportCard.coachComments}
                </p>
              </div>
            )}

            {reportCard.goals && (
              <div>
                <h4 className="font-medium text-purple-700 mb-2">Goals for Next Period</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{reportCard.goals}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8">
            <div className="space-y-2">
              <div className="border-t border-gray-300 pt-2">
                <p className="text-sm text-gray-600">Coach Signature</p>
              </div>
              <div className="text-sm text-gray-600">
                Date: {format(new Date(reportCard.updatedAt), 'MM/dd/yyyy')}
              </div>
            </div>
            <div className="space-y-2">
              <div className="border-t border-gray-300 pt-2">
                <p className="text-sm text-gray-600">Parent/Guardian Signature</p>
              </div>
              <div className="text-sm text-gray-600">Date: _______________</div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 pt-4">
            Report generated on {format(new Date(), 'MMMM d, yyyy')}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
