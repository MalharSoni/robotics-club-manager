'use client'

import { useState } from 'react'
import { Student } from '@prisma/client'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createStudent } from '@/app/actions/students'
import { useToast } from '@/hooks/use-toast'

interface StudentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (student: Student) => void
}

export function StudentFormDialog({ open, onOpenChange, onSuccess }: StudentFormDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    grade: '9',
    gradYear: new Date().getFullYear() + 4,
    parentEmail: '',
    parentPhone: '',
    primaryRole: 'BUILDER',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await createStudent({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || null,
        grade: parseInt(formData.grade),
        gradYear: formData.gradYear,
        parentEmail: formData.parentEmail || null,
        parentPhone: formData.parentPhone || null,
        primaryRole: formData.primaryRole as any,
        notes: formData.notes || null,
      })

      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else if (result.student) {
        toast({
          title: 'Success',
          description: 'Student added successfully',
          variant: 'success',
        })
        onSuccess(result.student)
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          grade: '9',
          gradYear: new Date().getFullYear() + 4,
          parentEmail: '',
          parentPhone: '',
          primaryRole: 'BUILDER',
          notes: '',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add student',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Add a new student to your robotics team. Fill in their information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Student Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="student@example.com"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Grade *</Label>
              <Select
                value={formData.grade}
                onValueChange={(value) => {
                  const gradeNum = parseInt(value)
                  const currentYear = new Date().getFullYear()
                  const gradYear = currentYear + (12 - gradeNum) + 1
                  setFormData({ ...formData, grade: value, gradYear })
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger id="grade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9">Grade 9</SelectItem>
                  <SelectItem value="10">Grade 10</SelectItem>
                  <SelectItem value="11">Grade 11</SelectItem>
                  <SelectItem value="12">Grade 12</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gradYear">Graduation Year *</Label>
              <Input
                id="gradYear"
                type="number"
                value={formData.gradYear}
                onChange={(e) => setFormData({ ...formData, gradYear: parseInt(e.target.value) })}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryRole">Primary Role</Label>
            <Select
              value={formData.primaryRole}
              onValueChange={(value) => setFormData({ ...formData, primaryRole: value })}
              disabled={isSubmitting}
            >
              <SelectTrigger id="primaryRole">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRIVER">Driver</SelectItem>
                <SelectItem value="PROGRAMMER">Programmer</SelectItem>
                <SelectItem value="BUILDER">Builder</SelectItem>
                <SelectItem value="DESIGNER">Designer</SelectItem>
                <SelectItem value="SCOUT">Scout</SelectItem>
                <SelectItem value="NOTEBOOK_KEEPER">Notebook Keeper</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parentEmail">Parent Email</Label>
              <Input
                id="parentEmail"
                type="email"
                value={formData.parentEmail}
                onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                placeholder="parent@example.com"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentPhone">Parent Phone</Label>
              <Input
                id="parentPhone"
                type="tel"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                placeholder="(555) 123-4567"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about the student..."
              rows={3}
              disabled={isSubmitting}
            />
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
              {isSubmitting ? 'Adding...' : 'Add Student'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
