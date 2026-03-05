'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Calendar, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { RatingInput } from './rating-input'
import { updateReportCard } from '@/app/actions/reports'
import { useToast } from '@/hooks/use-toast'

interface Student {
  id: string
  firstName: string
  lastName: string
  grade?: number | null
}

interface Team {
  id: string
  name: string
}

interface ReportCard {
  id: string
  studentId: string
  teamId: string
  periodName: string
  startDate: Date
  endDate: Date
  published: boolean
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
  student: Student
  team: Team
}

interface ReportCardFormProps {
  reportCard: ReportCard
  onSave?: () => void
}

export function ReportCardForm({ reportCard, onSave }: ReportCardFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)

  // Form state
  const [periodName, setPeriodName] = useState(reportCard.periodName)
  const [startDate, setStartDate] = useState<Date>(new Date(reportCard.startDate))
  const [endDate, setEndDate] = useState<Date>(new Date(reportCard.endDate))
  const [attendance, setAttendance] = useState(reportCard.attendance?.toString() || '')
  const [overallGrade, setOverallGrade] = useState(reportCard.overallGrade || '')

  // Ratings
  const [technicalSkills, setTechnicalSkills] = useState(reportCard.technicalSkills || 0)
  const [teamwork, setTeamwork] = useState(reportCard.teamwork || 0)
  const [leadership, setLeadership] = useState(reportCard.leadership || 0)
  const [communication, setCommunication] = useState(reportCard.communication || 0)
  const [problemSolving, setProblemSolving] = useState(reportCard.problemSolving || 0)
  const [initiative, setInitiative] = useState(reportCard.initiative || 0)

  // Narrative feedback
  const [strengths, setStrengths] = useState(reportCard.strengths || '')
  const [areasForGrowth, setAreasForGrowth] = useState(reportCard.areasForGrowth || '')
  const [coachComments, setCoachComments] = useState(reportCard.coachComments || '')
  const [goals, setGoals] = useState(reportCard.goals || '')

  // Metrics
  const [tasksCompleted, setTasksCompleted] = useState(reportCard.tasksCompleted.toString())
  const [projectsCompleted, setProjectsCompleted] = useState(
    reportCard.projectsCompleted.toString()
  )
  const [hoursLogged, setHoursLogged] = useState(reportCard.hoursLogged.toString())

  // Auto-save functionality (every 30 seconds)
  useEffect(() => {
    if (reportCard.published) return // Don't auto-save published reports

    const timer = setTimeout(() => {
      handleSave(true)
    }, 30000)

    return () => clearTimeout(timer)
  }, [
    periodName,
    startDate,
    endDate,
    attendance,
    overallGrade,
    technicalSkills,
    teamwork,
    leadership,
    communication,
    problemSolving,
    initiative,
    strengths,
    areasForGrowth,
    coachComments,
    goals,
    tasksCompleted,
    projectsCompleted,
    hoursLogged,
  ])

  const handleSave = async (isAutoSave = false) => {
    if (isAutoSave) {
      setAutoSaving(true)
    } else {
      setLoading(true)
    }

    try {
      const result = await updateReportCard({
        id: reportCard.id,
        periodName,
        startDate,
        endDate,
        attendance: attendance ? parseFloat(attendance) : undefined,
        overallGrade: overallGrade || undefined,
        technicalSkills: technicalSkills || undefined,
        teamwork: teamwork || undefined,
        leadership: leadership || undefined,
        communication: communication || undefined,
        problemSolving: problemSolving || undefined,
        initiative: initiative || undefined,
        strengths: strengths || undefined,
        areasForGrowth: areasForGrowth || undefined,
        coachComments: coachComments || undefined,
        goals: goals || undefined,
        tasksCompleted: parseInt(tasksCompleted) || 0,
        projectsCompleted: parseInt(projectsCompleted) || 0,
        hoursLogged: parseFloat(hoursLogged) || 0,
      })

      if ('error' in result) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        if (!isAutoSave) {
          toast({
            title: 'Success',
            description: 'Report card saved successfully',
          })
        }
        onSave?.()
        router.refresh()
      }
    } catch (error) {
      if (!isAutoSave) {
        toast({
          title: 'Error',
          description: 'Failed to save report card',
          variant: 'destructive',
        })
      }
    } finally {
      setLoading(false)
      setAutoSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Save Button */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {autoSaving && 'Auto-saving...'}
          {!autoSaving && !reportCard.published && 'Auto-save enabled (every 30s)'}
        </div>
        <Button onClick={() => handleSave(false)} disabled={loading || reportCard.published}>
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Period Information */}
      <Card>
        <CardHeader>
          <CardTitle>Report Period</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="periodName">Period Name</Label>
            <Input
              id="periodName"
              value={periodName}
              onChange={(e) => setPeriodName(e.target.value)}
              disabled={reportCard.published}
              placeholder="e.g., Fall 2024, Q1 2024"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={reportCard.published}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(startDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={reportCard.published}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(endDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="attendance">Attendance (%)</Label>
              <Input
                id="attendance"
                type="number"
                min="0"
                max="100"
                value={attendance}
                onChange={(e) => setAttendance(e.target.value)}
                disabled={reportCard.published}
                placeholder="85"
              />
            </div>

            <div>
              <Label htmlFor="overallGrade">Overall Grade (Optional)</Label>
              <Input
                id="overallGrade"
                value={overallGrade}
                onChange={(e) => setOverallGrade(e.target.value)}
                disabled={reportCard.published}
                placeholder="A, B+, Excellent, etc."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Ratings */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Ratings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RatingInput
            label="Technical Skills"
            value={technicalSkills}
            onChange={setTechnicalSkills}
            disabled={reportCard.published}
          />
          <RatingInput
            label="Teamwork & Collaboration"
            value={teamwork}
            onChange={setTeamwork}
            disabled={reportCard.published}
          />
          <RatingInput
            label="Leadership & Initiative"
            value={leadership}
            onChange={setLeadership}
            disabled={reportCard.published}
          />
          <RatingInput
            label="Communication"
            value={communication}
            onChange={setCommunication}
            disabled={reportCard.published}
          />
          <RatingInput
            label="Problem Solving"
            value={problemSolving}
            onChange={setProblemSolving}
            disabled={reportCard.published}
          />
          <RatingInput
            label="Initiative & Reliability"
            value={initiative}
            onChange={setInitiative}
            disabled={reportCard.published}
          />
        </CardContent>
      </Card>

      {/* Activity Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="tasksCompleted">Tasks Completed</Label>
            <Input
              id="tasksCompleted"
              type="number"
              min="0"
              value={tasksCompleted}
              onChange={(e) => setTasksCompleted(e.target.value)}
              disabled={reportCard.published}
            />
          </div>
          <div>
            <Label htmlFor="projectsCompleted">Projects Completed</Label>
            <Input
              id="projectsCompleted"
              type="number"
              min="0"
              value={projectsCompleted}
              onChange={(e) => setProjectsCompleted(e.target.value)}
              disabled={reportCard.published}
            />
          </div>
          <div>
            <Label htmlFor="hoursLogged">Hours Logged</Label>
            <Input
              id="hoursLogged"
              type="number"
              min="0"
              step="0.5"
              value={hoursLogged}
              onChange={(e) => setHoursLogged(e.target.value)}
              disabled={reportCard.published}
            />
          </div>
        </CardContent>
      </Card>

      {/* Narrative Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Narrative Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="strengths">Strengths & Achievements</Label>
            <Textarea
              id="strengths"
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              disabled={reportCard.published}
              rows={4}
              placeholder="Describe the student's key strengths and notable achievements..."
            />
          </div>

          <div>
            <Label htmlFor="areasForGrowth">Areas for Growth</Label>
            <Textarea
              id="areasForGrowth"
              value={areasForGrowth}
              onChange={(e) => setAreasForGrowth(e.target.value)}
              disabled={reportCard.published}
              rows={4}
              placeholder="Identify areas where the student can improve..."
            />
          </div>

          <div>
            <Label htmlFor="coachComments">Coach Comments</Label>
            <Textarea
              id="coachComments"
              value={coachComments}
              onChange={(e) => setCoachComments(e.target.value)}
              disabled={reportCard.published}
              rows={4}
              placeholder="Additional comments and observations..."
            />
          </div>

          <div>
            <Label htmlFor="goals">Goals for Next Period</Label>
            <Textarea
              id="goals"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              disabled={reportCard.published}
              rows={4}
              placeholder="Set specific goals for the student to work on..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
