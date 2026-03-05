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
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { createSkillSchema, type CreateSkillInput } from '@/lib/validations/skill'
import { createSkill, updateSkill } from '@/app/actions/skills'
import { SkillCategory } from '@prisma/client'
import { Loader2 } from 'lucide-react'

interface SkillFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  skill?: {
    id: string
    name: string
    description: string | null
    category: SkillCategory
    icon?: string | null
    color?: string | null
  }
  onSuccess?: () => void
}

const CATEGORY_OPTIONS = [
  { value: 'MECHANICAL', label: 'Mechanical' },
  { value: 'ELECTRICAL', label: 'Electrical' },
  { value: 'PROGRAMMING', label: 'Programming' },
  { value: 'CAD_DESIGN', label: 'CAD Design' },
  { value: 'PROJECT_MANAGEMENT', label: 'Project Management' },
  { value: 'COMMUNICATION', label: 'Communication' },
  { value: 'LEADERSHIP', label: 'Leadership' },
  { value: 'PROBLEM_SOLVING', label: 'Problem Solving' },
]

export function SkillFormDialog({
  open,
  onOpenChange,
  skill,
  onSuccess,
}: SkillFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateSkillInput>({
    resolver: zodResolver(createSkillSchema),
    defaultValues: skill
      ? {
          name: skill.name,
          description: skill.description || '',
          category: skill.category,
          icon: skill.icon || '',
          color: skill.color || '',
        }
      : undefined,
  })

  const selectedCategory = watch('category')

  const onSubmit = async (data: CreateSkillInput) => {
    setIsSubmitting(true)
    try {
      const result = skill
        ? await updateSkill({ ...data, id: skill.id })
        : await createSkill(data)

      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: result.success,
        })
        reset()
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{skill ? 'Edit Skill' : 'Add New Skill'}</DialogTitle>
          <DialogDescription>
            {skill
              ? 'Update the skill details below.'
              : 'Create a new skill to track across your team.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Skill Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Drivetrain Assembly"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => setValue('category', value as SkillCategory)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of this skill..."
              rows={3}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="icon">Icon (optional)</Label>
              <Input
                id="icon"
                placeholder="e.g., wrench"
                {...register('icon')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color (optional)</Label>
              <Input
                id="color"
                type="color"
                {...register('color')}
              />
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
              {skill ? 'Update Skill' : 'Create Skill'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
