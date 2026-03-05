'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, Search, LayoutGrid, List, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { TaskCard } from '@/components/tasks/task-card'
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog'
import {
  createTask,
  updateTaskStatus,
  deleteTask,
  type TaskWithAssignments,
} from '@/app/actions/tasks'
import type { Student, TaskStatus, Priority, TaskCategory } from '@prisma/client'
import type { CreateTaskInput } from '@/lib/validations/task'

// Kanban columns configuration
const KANBAN_COLUMNS: { id: TaskStatus; title: string; description: string }[] = [
  { id: 'TODO', title: 'To Do', description: 'Tasks that need to be started' },
  { id: 'IN_PROGRESS', title: 'In Progress', description: 'Tasks being worked on' },
  { id: 'BLOCKED', title: 'On Hold', description: 'Tasks that are blocked' },
  { id: 'COMPLETED', title: 'Completed', description: 'Finished tasks' },
]

interface KanbanBoardProps {
  initialTasks: TaskWithAssignments[]
  students: Student[]
  teamId: string
  onRefresh?: () => void
}

export function KanbanBoard({
  initialTasks,
  students,
  teamId,
  onRefresh,
}: KanbanBoardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<TaskWithAssignments[]>(initialTasks)
  const [activeId, setActiveId] = useState<string | null>(null)

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Update tasks when initialTasks changes
  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'ALL'>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'ALL'>('ALL')
  const [assignedFilter, setAssignedFilter] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = task.title.toLowerCase().includes(query)
        const matchesDescription = task.description?.toLowerCase().includes(query)
        if (!matchesTitle && !matchesDescription) return false
      }

      // Priority filter
      if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) {
        return false
      }

      // Category filter
      if (categoryFilter !== 'ALL' && task.category !== categoryFilter) {
        return false
      }

      // Assigned filter
      if (assignedFilter !== 'ALL') {
        const hasAssignment = task.assignments.some(
          (a) => a.studentId === assignedFilter
        )
        if (!hasAssignment) return false
      }

      return true
    })
  }, [tasks, searchQuery, priorityFilter, categoryFilter, assignedFilter])

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, TaskWithAssignments[]> = {
      TODO: [],
      IN_PROGRESS: [],
      BLOCKED: [],
      REVIEW: [],
      COMPLETED: [],
    }

    filteredTasks.forEach((task) => {
      grouped[task.status].push(task)
    })

    return grouped
  }, [filteredTasks])

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as TaskStatus

    // Find the task
    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.status === newStatus) return

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      )
    )

    // Update on server
    const result = await updateTaskStatus({ id: taskId, status: newStatus })
    if (!result.success) {
      // Revert on error
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: task.status } : t
        )
      )
      toast({
        title: 'Error',
        description: result.error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Task updated',
        description: `Task moved to ${KANBAN_COLUMNS.find((c) => c.id === newStatus)?.title}`,
      })
      router.refresh()
    }
  }

  // Handle create task
  const handleCreateTask = async (data: CreateTaskInput) => {
    const result = await createTask(data)
    if (result.success) {
      toast({
        title: 'Task created',
        description: 'Task has been created successfully',
      })
      router.refresh()
    } else {
      toast({
        title: 'Error',
        description: result.error.message,
        variant: 'destructive',
      })
      throw new Error(result.error.message)
    }
  }

  // Handle delete task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    const result = await deleteTask({ id: taskId })
    if (result.success) {
      toast({
        title: 'Task deleted',
        description: 'Task has been deleted successfully',
      })
      router.refresh()
    } else {
      toast({
        title: 'Error',
        description: result.error.message,
        variant: 'destructive',
      })
    }
  }

  // Get active task for drag overlay
  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Board</h1>
          <p className="text-muted-foreground">
            Manage and track team tasks with a Kanban board
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-lg">Filters</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('kanban')}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Kanban
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Priority filter */}
            <Select
              value={priorityFilter}
              onValueChange={(value) => setPriorityFilter(value as Priority | 'ALL')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priorities</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>

            {/* Category filter */}
            <Select
              value={categoryFilter}
              onValueChange={(value) =>
                setCategoryFilter(value as TaskCategory | 'ALL')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
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

            {/* Assigned filter */}
            <Select value={assignedFilter} onValueChange={setAssignedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by student" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Students</SelectItem>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      {viewMode === 'kanban' && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {KANBAN_COLUMNS.map((column) => (
              <Card key={column.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">
                      {column.title}
                    </CardTitle>
                    <Badge variant="secondary">
                      {tasksByStatus[column.id]?.length || 0}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {column.description}
                  </p>
                </CardHeader>
                <CardContent className="flex-1 pt-0">
                  <SortableContext
                    id={column.id}
                    items={tasksByStatus[column.id]?.map((t) => t.id) || []}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3 min-h-[200px]">
                      {tasksByStatus[column.id]?.length > 0 ? (
                        tasksByStatus[column.id].map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onEdit={() => {}}
                            onDelete={handleDeleteTask}
                            onView={() => {}}
                          />
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-32 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                          No tasks
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </CardContent>
              </Card>
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <TaskCard
                task={activeTask}
                onEdit={() => {}}
                onDelete={() => {}}
                onView={() => {}}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={() => {}}
                    onDelete={handleDeleteTask}
                    onView={() => {}}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  No tasks found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateTask}
        teamId={teamId}
        students={students}
      />
    </div>
  )
}
