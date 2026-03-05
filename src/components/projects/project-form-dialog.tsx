'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { createProject, updateProject } from '@/app/actions/projects'
import { toast } from '@/components/ui/use-toast'
import { Project } from '@prisma/client'
import { Plus, X } from 'lucide-react'

interface ProjectFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project | null
  mode?: 'create' | 'edit'
}

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  mode = 'create',
}: ProjectFormDialogProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    category: project?.category || 'ROBOT',
    status: project?.status || 'PLANNING',
    startDate: project?.startDate
      ? new Date(project.startDate).toISOString().split('T')[0]
      : '',
    endDate: project?.endDate
      ? new Date(project.endDate).toISOString().split('T')[0]
      : '',
    goals: project?.goals || [],
    coverImage: project?.coverImage || '',
  })

  const [newGoal, setNewGoal] = useState('')

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setFormData({ ...formData, goals: [...formData.goals, newGoal.trim()] })
      setNewGoal('')
    }
  }

  const handleRemoveGoal = (index: number) => {
    setFormData({
      ...formData,
      goals: formData.goals.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Project name is required',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    let result
    if (mode === 'edit' && project) {
      result = await updateProject({
        id: project.id,
        name: formData.name,
        description: formData.description || undefined,
        category: formData.category as any,
        status: formData.status as any,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        goals: formData.goals,
        coverImage: formData.coverImage || undefined,
      })
    } else {
      result = await createProject({
        name: formData.name,
        description: formData.description || undefined,
        category: formData.category as any,
        status: formData.status as any,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        goals: formData.goals,
        coverImage: formData.coverImage || undefined,
      })
    }

    setIsSubmitting(false)

    if ('error' in result) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: `Project ${mode === 'edit' ? 'updated' : 'created'} successfully`,
      })
      onOpenChange(false)
      router.refresh()
      if (mode === 'create' && result.project) {
        router.push(`/dashboard/projects/${result.project.id}`)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'ROBOT',
      status: 'PLANNING',
      startDate: '',
      endDate: '',
      goals: [],
      coverImage: '',
    })
    setNewGoal('')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen)
        if (!isOpen && mode === 'create') {
          resetForm()
        }
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'Update project details and settings'
              : 'Add a new project to track team work and milestones'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Name */}
          <div>
            <Label htmlFor="name">
              Project Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Robot Chassis Build, Autonomous Programming"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the project objectives and scope..."
              rows={3}
            />
          </div>

          {/* Category and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ROBOT">Robot Build</SelectItem>
                  <SelectItem value="MECHANISM">Mechanism</SelectItem>
                  <SelectItem value="AUTONOMOUS">Autonomous</SelectItem>
                  <SelectItem value="OUTREACH">Outreach</SelectItem>
                  <SelectItem value="FUNDRAISING">Fundraising</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNING">Planning</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="TESTING">Testing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="endDate">Target End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          {/* Goals */}
          <div>
            <Label>Project Goals</Label>
            <div className="space-y-2 mt-2">
              {formData.goals.map((goal, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded border"
                >
                  <span className="flex-1 text-sm">{goal}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveGoal(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a project goal or milestone..."
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddGoal()
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddGoal}
                  disabled={!newGoal.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Cover Image URL (optional) */}
          <div>
            <Label htmlFor="coverImage">Cover Image URL (optional)</Label>
            <Input
              id="coverImage"
              type="url"
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? mode === 'edit'
                  ? 'Updating...'
                  : 'Creating...'
                : mode === 'edit'
                ? 'Update Project'
                : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
