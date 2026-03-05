'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar, Loader2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { bulkCreateReportCards } from '@/app/actions/reports'
import { useToast } from '@/hooks/use-toast'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'

interface Student {
  id: string
  firstName: string
  lastName: string
  grade?: number | null
}

interface BulkGenerateDialogProps {
  students: Student[]
  teamId: string
  onSuccess?: () => void
}

export function BulkGenerateDialog({ students, teamId, onSuccess }: BulkGenerateDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [periodName, setPeriodName] = useState('')
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const { toast } = useToast()

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(students.map((s) => s.id))
    } else {
      setSelectedStudents([])
    }
  }

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId])
    } else {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedStudents.length === 0) {
      toast({
        title: 'No students selected',
        description: 'Please select at least one student',
        variant: 'destructive',
      })
      return
    }

    if (!periodName || !startDate || !endDate) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const result = await bulkCreateReportCards({
        studentIds: selectedStudents,
        teamId,
        periodName,
        startDate,
        endDate,
      })

      if ('error' in result) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: `Created ${result.count} report card(s)`,
        })
        setOpen(false)
        // Reset form
        setSelectedStudents([])
        setPeriodName('')
        setStartDate(undefined)
        setEndDate(undefined)
        onSuccess?.()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create report cards',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Users className="h-4 w-4 mr-2" />
          Generate Report Cards
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Generate Report Cards</DialogTitle>
          <DialogDescription>
            Create draft report cards for multiple students at once
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Period Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="periodName">Period Name</Label>
              <Input
                id="periodName"
                placeholder="e.g., Fall 2024, Q1 2024"
                value={periodName}
                onChange={(e) => setPeriodName(e.target.value)}
                required
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
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
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
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Student Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Select Students</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedStudents.length === students.length}
                  onCheckedChange={handleSelectAll}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Select All ({students.length})
                </label>
              </div>
            </div>

            <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-3">
              {students.map((student) => (
                <div key={student.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={student.id}
                    checked={selectedStudents.includes(student.id)}
                    onCheckedChange={(checked) =>
                      handleSelectStudent(student.id, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={student.id}
                    className="text-sm flex-1 cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {student.firstName} {student.lastName}
                    {student.grade && (
                      <span className="text-gray-500 ml-2">Grade {student.grade}</span>
                    )}
                  </label>
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-600">
              {selectedStudents.length} student(s) selected
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Generate {selectedStudents.length} Report Card(s)
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
