'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { updateStudentProgress } from '@/app/actions/progress'
import { useRouter } from 'next/navigation'

type Milestone = {
  id: string
  title: string
  description: string | null
  category: string
  order: number
  completed: boolean
  completedAt: Date | null
  status: string
  evidenceMedia: {
    id: string
    url: string
    type: string
    title: string | null
  } | null
}

export function BootcampMilestoneChecklist({
  studentId,
  milestones,
}: {
  studentId: string
  milestones: Milestone[]
}) {
  const [updating, setUpdating] = useState<string | null>(null)
  const router = useRouter()

  const handleToggle = async (milestone: Milestone) => {
    setUpdating(milestone.id)

    try {
      // Toggle status: completed -> in_progress, not completed -> completed
      const newStatus = milestone.completed ? 'IN_PROGRESS' : 'COMPLETED'

      await updateStudentProgress({
        studentId,
        moduleId: milestone.id,
        status: newStatus,
      })

      // Refresh to show updated state
      router.refresh()
    } catch (error) {
      console.error('Error updating milestone:', error)
      alert('Failed to update milestone. Please try again.')
    } finally {
      setUpdating(null)
    }
  }

  const completedCount = milestones.filter((m) => m.completed).length
  const allComplete = completedCount === milestones.length

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      MECHANICAL: 'bg-orange-100 text-orange-800 border-orange-200',
      ELECTRICAL: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      PROGRAMMING: 'bg-blue-100 text-blue-800 border-blue-200',
      CAD_DESIGN: 'bg-purple-100 text-purple-800 border-purple-200',
      SAFETY: 'bg-red-100 text-red-800 border-red-200',
      COMPETITION_STRATEGY: 'bg-green-100 text-green-800 border-green-200',
    }
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Foundation Bootcamp</h3>
            <p className="text-sm text-gray-600">
              Track student completion of 7 core skills
            </p>
          </div>
          <Badge
            variant={allComplete ? 'default' : 'secondary'}
            className={allComplete ? 'bg-green-600 text-white' : ''}
          >
            {completedCount}/{milestones.length} Complete
          </Badge>
        </div>
      </Card>

      {/* Milestone List */}
      <div className="space-y-2">
        {milestones.map((milestone) => {
          const isCompleted = milestone.completed
          const isDisabled = updating === milestone.id

          return (
            <Card
              key={milestone.id}
              className={`p-4 transition-colors ${
                isCompleted ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <div className="pt-1">
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={() => handleToggle(milestone)}
                    disabled={isDisabled}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-500">
                          #{milestone.order}
                        </span>
                        <h4
                          className={`font-medium ${
                            isCompleted ? 'line-through text-gray-600' : 'text-gray-900'
                          }`}
                        >
                          {milestone.title}
                        </h4>
                      </div>
                      {milestone.description && (
                        <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                      )}
                    </div>

                    {/* Category Badge */}
                    <Badge className={getCategoryColor(milestone.category)} variant="outline">
                      {milestone.category.replace('_', ' ')}
                    </Badge>
                  </div>

                  {/* Completion Date & Evidence */}
                  {isCompleted && (
                    <div className="space-y-2 mt-2">
                      {milestone.completedAt && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          <span>Completed {format(new Date(milestone.completedAt), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                      {milestone.evidenceMedia && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Evidence:</span>
                          <div className="w-16 h-16 rounded overflow-hidden border border-gray-200">
                            {milestone.evidenceMedia.type === 'IMAGE' ? (
                              <img
                                src={milestone.evidenceMedia.url}
                                alt={milestone.evidenceMedia.title || 'Evidence photo'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                                {milestone.evidenceMedia.type}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Instructions */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>Coach Note:</strong> Check off milestones as students complete them. Students upload
          photos/videos as evidence, but completion is coach-verified.
        </p>
      </Card>
    </div>
  )
}
