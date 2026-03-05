'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Plus, Target, CheckCircle2, Circle } from 'lucide-react'
import { updateProject } from '@/app/actions/projects'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'

interface MilestoneChecklistProps {
  projectId: string
  goals: string[]
  outcomes: string[]
  status: string
}

export function MilestoneChecklist({ projectId, goals, outcomes, status }: MilestoneChecklistProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [newGoal, setNewGoal] = useState('')
  const [editedGoals, setEditedGoals] = useState<string[]>(goals || [])
  const [editedOutcomes, setEditedOutcomes] = useState<string[]>(outcomes || [])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const completionRate = goals.length > 0
    ? Math.round((outcomes.length / goals.length) * 100)
    : 0

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setEditedGoals([...editedGoals, newGoal.trim()])
      setNewGoal('')
    }
  }

  const handleRemoveGoal = (index: number) => {
    const goal = editedGoals[index]
    setEditedGoals(editedGoals.filter((_, i) => i !== index))
    // Also remove from outcomes if it was completed
    setEditedOutcomes(editedOutcomes.filter((outcome) => outcome !== goal))
  }

  const handleToggleGoal = (goal: string) => {
    if (editedOutcomes.includes(goal)) {
      setEditedOutcomes(editedOutcomes.filter((outcome) => outcome !== goal))
    } else {
      setEditedOutcomes([...editedOutcomes, goal])
    }
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    const result = await updateProject({
      id: projectId,
      goals: editedGoals,
      outcomes: editedOutcomes,
    })

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
        description: 'Goals updated successfully',
      })
      setIsEditing(false)
      router.refresh()
    }
  }

  const handleCancel = () => {
    setEditedGoals(goals || [])
    setEditedOutcomes(outcomes || [])
    setNewGoal('')
    setIsEditing(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <CardTitle>Goals & Milestones</CardTitle>
            </div>
            <CardDescription className="mt-1">
              Track project objectives and completion
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            {goals.length > 0 && (
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{completionRate}%</div>
                <div className="text-xs text-gray-500">Complete</div>
              </div>
            )}
            {!isEditing ? (
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                Edit Goals
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        {goals.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">
                {outcomes.length} of {goals.length} completed
              </span>
              {status === 'COMPLETED' && (
                <Badge className="bg-green-100 text-green-800">
                  Project Completed
                </Badge>
              )}
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        )}

        {/* Goals List */}
        <div className="space-y-2">
          {editedGoals.length === 0 && !isEditing ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No goals set for this project yet</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => setIsEditing(true)}
              >
                Add Goals
              </Button>
            </div>
          ) : (
            editedGoals.map((goal, index) => {
              const isCompleted = editedOutcomes.includes(goal)
              return (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {isEditing ? (
                      <Checkbox
                        checked={isCompleted}
                        onCheckedChange={() => handleToggleGoal(goal)}
                      />
                    ) : isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                    <span
                      className={`flex-1 ${
                        isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      {goal}
                    </span>
                  </div>
                  {isEditing && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveGoal(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Add New Goal */}
        {isEditing && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Enter a new goal or milestone..."
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddGoal()
                  }
                }}
              />
              <Button onClick={handleAddGoal} disabled={!newGoal.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {!isEditing && goals.length > 0 && (
          <div className="mt-6 pt-4 border-t grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{goals.length}</div>
              <div className="text-xs text-gray-500">Total Goals</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{outcomes.length}</div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {goals.length - outcomes.length}
              </div>
              <div className="text-xs text-gray-500">Remaining</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
