'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createTaskSchema, type CreateTaskInput } from '@/lib/validations/task'
import type { Student } from '@prisma/client'
import { cn } from '@/lib/utils'

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateTaskInput) => Promise<void>
  teamId: string
  students: Student[]
}

// Get initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

type FormData = {
  title: string
  description?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category: 'GENERAL' | 'BUILD' | 'PROGRAMMING' | 'DESIGN' | 'NOTEBOOK' | 'COMPETITION_PREP' | 'OUTREACH' | 'FUNDRAISING'
  dueDate?: Date
  estimatedHours?: number
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  onSubmit,
  teamId,
  students,
}: CreateTaskDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [showStudentList, setShowStudentList] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      priority: 'MEDIUM',
      category: 'GENERAL',
    },
  })

  const priority = watch('priority')
  const category = watch('category')
  const dueDate = watch('dueDate')

  const handleFormSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const taskData: CreateTaskInput = {
        ...data,
        teamId,
        assignedStudentIds: selectedStudents,
      }
      await onSubmit(taskData)
      reset()
      setSelectedStudents([])
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    )
  }

  const selectedStudentObjects = students.filter((s) =>
    selectedStudents.includes(s.id)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task and assign it to team members.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter task title"
              {...register('title')}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter task description"
              rows={4}
              {...register('description')}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Priority and Category */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) =>
                  setValue('priority', value as any)
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-red-500">{errors.priority.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={(value) =>
                  setValue('category', value as any)
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="BUILD">Build</SelectItem>
                  <SelectItem value="PROGRAMMING">Programming</SelectItem>
                  <SelectItem value="DESIGN">Design</SelectItem>
                  <SelectItem value="NOTEBOOK">Notebook</SelectItem>
                  <SelectItem value="COMPETITION_PREP">Competition Prep</SelectItem>
                  <SelectItem value="OUTREACH">Outreach</SelectItem>
                  <SelectItem value="FUNDRAISING">Fundraising</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>
          </div>

          {/* Due Date and Estimated Hours */}
          <div className="grid grid-cols-2 gap-4">
            {/* Due Date */}
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dueDate && 'text-muted-foreground'
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => setValue('dueDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.dueDate && (
                <p className="text-sm text-red-500">{errors.dueDate.message}</p>
              )}
            </div>

            {/* Estimated Hours */}
            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                step="0.5"
                min="0"
                placeholder="0"
                {...register('estimatedHours', {
                  setValueAs: (v) => (v === '' ? undefined : parseFloat(v)),
                })}
                disabled={isSubmitting}
              />
              {errors.estimatedHours && (
                <p className="text-sm text-red-500">
                  {errors.estimatedHours.message}
                </p>
              )}
            </div>
          </div>

          {/* Assign Students */}
          <div className="space-y-2">
            <Label>Assign Students</Label>
            <div className="border rounded-md p-3">
              {/* Selected students display */}
              {selectedStudentObjects.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedStudentObjects.map((student) => (
                    <Badge
                      key={student.id}
                      variant="secondary"
                      className="gap-1 pr-1"
                    >
                      <Avatar className="h-5 w-5">
                        <AvatarImage
                          src={student.avatar || undefined}
                          alt={`${student.firstName} ${student.lastName}`}
                        />
                        <AvatarFallback className="text-xs">
                          {getInitials(`${student.firstName} ${student.lastName}`)}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        {student.firstName} {student.lastName}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleStudent(student.id)}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Student selection */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowStudentList(!showStudentList)}
                className="w-full"
                disabled={isSubmitting}
              >
                {showStudentList ? 'Hide' : 'Select'} Students
              </Button>

              {showStudentList && (
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className={cn(
                        'flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-muted',
                        selectedStudents.includes(student.id) && 'bg-muted'
                      )}
                      onClick={() => toggleStudent(student.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleStudent(student.id)}
                        className="h-4 w-4"
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={student.avatar || undefined}
                          alt={`${student.firstName} ${student.lastName}`}
                        />
                        <AvatarFallback>
                          {getInitials(`${student.firstName} ${student.lastName}`)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {student.firstName} {student.lastName}
                        </p>
                        {student.email && (
                          <p className="text-xs text-muted-foreground">
                            {student.email}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
