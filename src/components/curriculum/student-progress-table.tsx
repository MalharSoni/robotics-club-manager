'use client'

import { useState } from 'react'
import { Student, ProgressStatus, CurriculumProgress } from '@prisma/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { updateStudentProgress } from '@/app/actions/curriculum'
import { useToast } from '@/hooks/use-toast'
import {
  CheckCircle2,
  Circle,
  Clock,
  Award,
  Edit,
  Calendar,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface StudentProgressTableProps {
  moduleId: string
  progress: (CurriculumProgress & {
    student: Pick<Student, 'id' | 'firstName' | 'lastName' | 'email' | 'avatar' | 'grade'>
  })[]
  onUpdate?: () => void
}

const statusConfig: Record<
  ProgressStatus,
  {
    label: string
    icon: any
    color: string
    bgColor: string
  }
> = {
  NOT_STARTED: {
    label: 'Not Started',
    icon: Circle,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  COMPLETED: {
    label: 'Completed',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  MASTERED: {
    label: 'Mastered',
    icon: Award,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  },
}

export function StudentProgressTable({
  moduleId,
  progress,
  onUpdate,
}: StudentProgressTableProps) {
  const { toast } = useToast()
  const [editingProgress, setEditingProgress] = useState<CurriculumProgress | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    status: 'NOT_STARTED' as ProgressStatus,
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEdit = (progressRecord: CurriculumProgress) => {
    setEditingProgress(progressRecord)
    setEditFormData({
      status: progressRecord.status,
      notes: progressRecord.coachNotes || '',
    })
    setEditDialogOpen(true)
  }

  const handleUpdateProgress = async () => {
    if (!editingProgress) return

    setIsSubmitting(true)
    try {
      const result = await updateStudentProgress({
        studentId: editingProgress.studentId,
        moduleId: moduleId,
        status: editFormData.status,
        notes: editFormData.notes || undefined,
      })

      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Student progress updated successfully',
          variant: 'success',
        })
        setEditDialogOpen(false)
        onUpdate?.()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update progress',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (progress.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No students enrolled in this module yet.</p>
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Quiz Score</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {progress.map((record) => {
              const StatusIcon = statusConfig[record.status].icon
              return (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={record.student.avatar || undefined} />
                        <AvatarFallback>
                          {getInitials(record.student.firstName, record.student.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {record.student.firstName} {record.student.lastName}
                        </div>
                        {record.student.email && (
                          <div className="text-xs text-muted-foreground">
                            {record.student.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {record.student.grade ? `Grade ${record.student.grade}` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('text-xs', statusConfig[record.status].bgColor)}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig[record.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {record.startedAt ? (
                      <div className="text-sm">
                        <div className="text-muted-foreground text-xs">
                          {formatDistanceToNow(new Date(record.startedAt), { addSuffix: true })}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {record.completedAt ? (
                      <div className="text-sm">
                        <div className="text-muted-foreground text-xs">
                          {formatDistanceToNow(new Date(record.completedAt), { addSuffix: true })}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {record.quizScore !== null ? (
                      <span className="font-medium">{Math.round(record.quizScore)}%</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">{record.attempts || 0}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(record)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Edit Progress Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Student Progress</DialogTitle>
            <DialogDescription>
              Update progress for{' '}
              {editingProgress
                ? `${(editingProgress as any).student?.firstName} ${(editingProgress as any).student?.lastName}`
                : 'student'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={editFormData.status}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, status: value as ProgressStatus })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <config.icon className={cn('h-4 w-4', config.color)} />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Coach Notes</Label>
              <Textarea
                id="notes"
                value={editFormData.notes}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                placeholder="Add notes about this student's progress..."
                rows={4}
                disabled={isSubmitting}
              />
            </div>

            {editingProgress && (
              <div className="space-y-2 pt-2 border-t">
                <div className="text-sm space-y-1">
                  {editingProgress.startedAt && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Started: {formatDistanceToNow(new Date(editingProgress.startedAt), { addSuffix: true })}
                    </div>
                  )}
                  {editingProgress.completedAt && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3" />
                      Completed: {formatDistanceToNow(new Date(editingProgress.completedAt), { addSuffix: true })}
                    </div>
                  )}
                  {editingProgress.coachNotes && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MessageSquare className="h-3 w-3 mt-0.5" />
                      <span className="text-xs">{editingProgress.coachNotes}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateProgress} disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Progress'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
