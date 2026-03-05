import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { KanbanBoard } from '@/components/tasks/kanban-board'
import { getTasks, getTeamStudents, getCurrentTeam } from '@/app/actions/tasks'
import { Card, CardContent } from '@/components/ui/card'

async function TasksContent() {
  // Get current team
  const teamResult = await getCurrentTeam()

  if (!teamResult.success) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Board</h1>
          <p className="text-muted-foreground">
            Manage and track team tasks with a Kanban board
          </p>
        </div>
        <Card>
          <CardContent className="py-8">
            <p className="text-red-600">{teamResult.error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const team = teamResult.data

  // Load tasks and students in parallel
  const [tasksResult, studentsResult] = await Promise.all([
    getTasks(team.id, { includeCompleted: true }),
    getTeamStudents(team.id),
  ])

  if (!tasksResult.success) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Board</h1>
          <p className="text-muted-foreground">
            Manage and track team tasks with a Kanban board
          </p>
        </div>
        <Card>
          <CardContent className="py-8">
            <p className="text-red-600">{tasksResult.error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const tasks = tasksResult.data
  const students = studentsResult.success ? studentsResult.data : []

  return (
    <KanbanBoard
      initialTasks={tasks}
      students={students}
      teamId={team.id}
      onRefresh={() => {
        // This is a client-side callback, but we need server-side refresh
        // The client will handle this via router.refresh()
      }}
    />
  )
}

export default function TasksPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <TasksContent />
    </Suspense>
  )
}
