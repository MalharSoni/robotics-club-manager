'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format, isPast } from 'date-fns'
import {
  MoreVertical,
  Calendar,
  Users,
  AlertCircle,
  Trash2,
  Edit,
  Eye,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { TaskWithAssignments } from '@/app/actions/tasks'
import type { Priority, TaskCategory } from '@prisma/client'

interface TaskCardProps {
  task: TaskWithAssignments
  onEdit: (task: TaskWithAssignments) => void
  onDelete: (taskId: string) => void
  onView: (task: TaskWithAssignments) => void
}

// Priority colors
const priorityColors: Record<Priority, string> = {
  LOW: 'bg-green-100 text-green-800 border-green-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  HIGH: 'bg-red-100 text-red-800 border-red-200',
  URGENT: 'bg-purple-100 text-purple-800 border-purple-200',
}

// Category colors
const categoryColors: Record<TaskCategory, string> = {
  GENERAL: 'bg-gray-100 text-gray-800 border-gray-200',
  BUILD: 'bg-blue-100 text-blue-800 border-blue-200',
  PROGRAMMING: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  DESIGN: 'bg-pink-100 text-pink-800 border-pink-200',
  NOTEBOOK: 'bg-orange-100 text-orange-800 border-orange-200',
  COMPETITION_PREP: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  OUTREACH: 'bg-teal-100 text-teal-800 border-teal-200',
  FUNDRAISING: 'bg-emerald-100 text-emerald-800 border-emerald-200',
}

// Format category name
const categoryNames: Record<TaskCategory, string> = {
  GENERAL: 'General',
  BUILD: 'Build',
  PROGRAMMING: 'Programming',
  DESIGN: 'Design',
  NOTEBOOK: 'Notebook',
  COMPETITION_PREP: 'Competition Prep',
  OUTREACH: 'Outreach',
  FUNDRAISING: 'Fundraising',
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

export function TaskCard({ task, onEdit, onDelete, onView }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const isOverdue = task.dueDate && isPast(task.dueDate) && task.status !== 'COMPLETED'

  // Get assigned students (show first 3)
  const assignedStudents = task.assignments || []
  const visibleStudents = assignedStudents.slice(0, 3)
  const remainingCount = Math.max(0, assignedStudents.length - 3)

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={`mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
          isDragging ? 'shadow-lg ring-2 ring-primary' : ''
        }`}
      >
        <CardHeader className="pb-3" {...attributes} {...listeners}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold line-clamp-2">
                {task.title}
              </CardTitle>
              {task.description && (
                <CardDescription className="mt-1 line-clamp-2">
                  {task.description}
                </CardDescription>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(task)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(task.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pb-3 space-y-3">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={priorityColors[task.priority]}
            >
              {task.priority}
            </Badge>
            <Badge
              variant="outline"
              className={categoryColors[task.category]}
            >
              {categoryNames[task.category]}
            </Badge>
          </div>

          {/* Due Date */}
          {task.dueDate && (
            <div
              className={`flex items-center gap-2 text-sm ${
                isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'
              }`}
            >
              {isOverdue ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Calendar className="h-4 w-4" />
              )}
              <span>
                {isOverdue ? 'Overdue: ' : 'Due: '}
                {format(task.dueDate, 'MMM d, yyyy')}
              </span>
            </div>
          )}

          {/* Assigned Students */}
          {assignedStudents.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex items-center gap-1">
                {visibleStudents.map((assignment) => (
                  <Avatar
                    key={assignment.id}
                    className="h-6 w-6 border-2 border-background"
                  >
                    <AvatarImage
                      src={assignment.student.avatar || undefined}
                      alt={`${assignment.student.firstName} ${assignment.student.lastName}`}
                    />
                    <AvatarFallback className="text-xs">
                      {getInitials(
                        `${assignment.student.firstName} ${assignment.student.lastName}`
                      )}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {remainingCount > 0 && (
                  <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                    +{remainingCount}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
