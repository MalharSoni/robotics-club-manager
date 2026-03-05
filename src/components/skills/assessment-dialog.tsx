'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { assessmentSchema, type AssessmentInput } from '@/lib/validations/skill'
import { assessStudentSkill } from '@/app/actions/skills'
import { SkillLevel } from '@prisma/client'
import { Loader2, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface AssessmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  skill: {
    id: string
    name: string
  }
  students: Array<{
    id: string
    firstName: string
    lastName: string
    avatar?: string | null
    currentProficiency?: SkillLevel
  }>
  onSuccess?: () => void
}

const PROFICIENCY_OPTIONS = [
  { value: 'BEGINNER', label: 'Beginner', description: 'Learning the basics' },
  { value: 'INTERMEDIATE', label: 'Intermediate', description: 'Can work with guidance' },
  { value: 'ADVANCED', label: 'Advanced', description: 'Works independently' },
  { value: 'EXPERT', label: 'Expert', description: 'Can teach others' },
]

export function AssessmentDialog({
  open,
  onOpenChange,
  skill,
  students,
  onSuccess,
}: AssessmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<Omit<AssessmentInput, 'studentId' | 'skillId'>>({
    defaultValues: {
      proficiency: 'BEGINNER' as SkillLevel,
      verified: false,
    },
  })

  const proficiency = watch('proficiency')
  const verified = watch('verified')

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    )
  }

  const onSubmit = async (
    data: Omit<AssessmentInput, 'studentId' | 'skillId'>
  ) => {
    if (selectedStudents.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one student',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const results = await Promise.all(
        selectedStudents.map((studentId) =>
          assessStudentSkill({
            ...data,
            studentId,
            skillId: skill.id,
          })
        )
      )

      const successCount = results.filter((r) => r.success).length
      const errorCount = results.filter((r) => r.error).length

      if (errorCount > 0) {
        toast({
          title: 'Partial Success',
          description: `${successCount} assessments recorded, ${errorCount} failed`,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: `${successCount} student${successCount > 1 ? 's' : ''} assessed successfully`,
        })
        reset()
        setSelectedStudents([])
        onOpenChange(false)
        onSuccess?.()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assess Skill: {skill.name}</DialogTitle>
          <DialogDescription>
            Select students and record their proficiency level for this skill.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Student Selection */}
          <div className="space-y-2">
            <Label>Select Students *</Label>
            <div className="border rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={() => toggleStudent(student.id)}
                >
                  <Checkbox
                    checked={selectedStudents.includes(student.id)}
                    onCheckedChange={() => toggleStudent(student.id)}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={student.avatar || undefined} />
                    <AvatarFallback>
                      {student.firstName[0]}
                      {student.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {student.firstName} {student.lastName}
                    </div>
                    {student.currentProficiency && (
                      <div className="text-xs text-gray-500">
                        Current: {student.currentProficiency}
                      </div>
                    )}
                  </div>
                  {selectedStudents.includes(student.id) && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>
              ))}
              {students.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No students available
                </p>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
            </p>
          </div>

          {/* Proficiency Level */}
          <div className="space-y-2">
            <Label htmlFor="proficiency">Proficiency Level *</Label>
            <Select
              value={proficiency}
              onValueChange={(value) => setValue('proficiency', value as SkillLevel)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select proficiency level" />
              </SelectTrigger>
              <SelectContent>
                {PROFICIENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.proficiency && (
              <p className="text-sm text-red-600">{errors.proficiency.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this assessment..."
              rows={3}
              {...register('notes')}
            />
          </div>

          {/* Evidence URL */}
          <div className="space-y-2">
            <Label htmlFor="evidenceUrl">Evidence URL (optional)</Label>
            <Input
              id="evidenceUrl"
              type="url"
              placeholder="https://..."
              {...register('evidenceUrl')}
            />
            {errors.evidenceUrl && (
              <p className="text-sm text-red-600">{errors.evidenceUrl.message}</p>
            )}
          </div>

          {/* Verified Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="verified"
              checked={verified}
              onCheckedChange={(checked) =>
                setValue('verified', checked as boolean)
              }
            />
            <Label
              htmlFor="verified"
              className="text-sm font-normal cursor-pointer"
            >
              Mark as verified (skill has been demonstrated)
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset()
                setSelectedStudents([])
                onOpenChange(false)
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || selectedStudents.length === 0}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assess {selectedStudents.length > 0 && `(${selectedStudents.length})`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
