'use client'

import { useState, useEffect } from 'react'
import { CurriculumModule, CurriculumCategory, SkillLevel } from '@prisma/client'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createModule, updateModule } from '@/app/actions/curriculum'
import { useToast } from '@/hooks/use-toast'
import { X, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ModuleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (module: CurriculumModule) => void
  module?: CurriculumModule | null
}

const categoryOptions: { value: CurriculumCategory; label: string }[] = [
  { value: 'MECHANICAL', label: 'Mechanical' },
  { value: 'ELECTRICAL', label: 'Electrical' },
  { value: 'PROGRAMMING', label: 'Programming' },
  { value: 'CAD_DESIGN', label: 'CAD/Design' },
  { value: 'NOTEBOOK', label: 'Notebook' },
  { value: 'SOFT_SKILLS', label: 'Soft Skills' },
  { value: 'COMPETITION_STRATEGY', label: 'Competition Strategy' },
  { value: 'SAFETY', label: 'Safety' },
]

const levelOptions: { value: SkillLevel; label: string }[] = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
  { value: 'EXPERT', label: 'Expert' },
]

export function ModuleFormDialog({
  open,
  onOpenChange,
  onSuccess,
  module,
}: ModuleFormDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [objectives, setObjectives] = useState<string[]>([])
  const [newObjective, setNewObjective] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'PROGRAMMING' as CurriculumCategory,
    difficultyLevel: 'BEGINNER' as SkillLevel,
    durationHours: '',
    content: '',
  })

  // Initialize form with module data if editing
  useEffect(() => {
    if (module) {
      setFormData({
        title: module.title,
        description: module.description || '',
        category: module.category,
        difficultyLevel: module.level,
        durationHours: module.estimatedHours?.toString() || '',
        content: '',
      })
      setObjectives(module.objectives || [])
    } else {
      // Reset form for create
      setFormData({
        title: '',
        description: '',
        category: 'PROGRAMMING',
        difficultyLevel: 'BEGINNER',
        durationHours: '',
        content: '',
      })
      setObjectives([])
      setNewObjective('')
    }
  }, [module, open])

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setObjectives([...objectives, newObjective.trim()])
      setNewObjective('')
    }
  }

  const handleRemoveObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const data = {
        title: formData.title,
        description: formData.description || undefined,
        category: formData.category,
        difficultyLevel: formData.difficultyLevel,
        durationHours: formData.durationHours ? parseFloat(formData.durationHours) : undefined,
        content: formData.content || undefined,
        learningObjectives: objectives,
        prerequisites: [],
      }

      let result
      if (module) {
        result = await updateModule({
          id: module.id,
          ...data,
        })
      } else {
        result = await createModule(data)
      }

      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else if (result.module) {
        toast({
          title: 'Success',
          description: module
            ? 'Module updated successfully'
            : 'Module created successfully',
          variant: 'success',
        })
        onSuccess(result.module)
        onOpenChange(false)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save module',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{module ? 'Edit Module' : 'Create New Module'}</DialogTitle>
          <DialogDescription>
            {module
              ? 'Update the curriculum module details below.'
              : 'Create a new curriculum module for your team.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Module Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Introduction to VEX Programming"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what students will learn in this module..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Category and Level */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value as CurriculumCategory })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Difficulty Level *</Label>
              <Select
                value={formData.difficultyLevel}
                onValueChange={(value) =>
                  setFormData({ ...formData, difficultyLevel: value as SkillLevel })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {levelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Estimated Duration (hours)</Label>
            <Input
              id="duration"
              type="number"
              step="0.5"
              min="0"
              value={formData.durationHours}
              onChange={(e) => setFormData({ ...formData, durationHours: e.target.value })}
              placeholder="2.5"
              disabled={isSubmitting}
            />
          </div>

          {/* Learning Objectives */}
          <div className="space-y-3">
            <Label>Learning Objectives</Label>
            <div className="flex gap-2">
              <Input
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                placeholder="Add a learning objective..."
                disabled={isSubmitting}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddObjective()
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddObjective}
                disabled={!newObjective.trim() || isSubmitting}
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {objectives.length > 0 && (
              <div className="space-y-2 mt-2">
                {objectives.map((objective, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-secondary rounded-md"
                  >
                    <span className="text-sm">{objective}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveObjective(index)}
                      disabled={isSubmitting}
                      className="h-6 w-6"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content (Markdown supported)</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="# Module Content&#10;&#10;Write your module content here using markdown..."
              rows={8}
              disabled={isSubmitting}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Use markdown formatting: # for headings, ** for bold, * for italic, - for lists
            </p>
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
              {isSubmitting
                ? module
                  ? 'Updating...'
                  : 'Creating...'
                : module
                ? 'Update Module'
                : 'Create Module'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
