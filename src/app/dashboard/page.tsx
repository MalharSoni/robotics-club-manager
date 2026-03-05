import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/supabase/card'
import { Badge } from '@/components/ui/supabase/badge'
import { Users, CheckSquare, BookOpen, Trophy, TrendingUp } from 'lucide-react'

async function getDashboardData(userId: string) {
  const coachProfile = await prisma.coachProfile.findUnique({
    where: { userId },
    include: {
      teams: {
        include: {
          team: {
            include: {
              _count: {
                select: {
                  members: true,
                  tasks: true,
                },
              },
              members: {
                where: { active: true },
                include: {
                  student: true,
                },
                take: 5,
              },
              tasks: {
                where: {
                  status: { notIn: ['COMPLETED'] },
                },
                orderBy: { dueDate: 'asc' },
                take: 5,
              },
            },
          },
        },
      },
    },
  })

  return coachProfile
}

export default async function DashboardPage() {
  const session = await requireAuth()
  const data = await getDashboardData(session.user.id)

  if (!data || data.teams.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome, {session.user.name}!</h1>
          <p className="text-muted-foreground mt-1">Get started by creating your first team</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>No Teams Yet</CardTitle>
            <CardDescription>
              Create your first robotics team to start managing students, tasks, and curriculum.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const team = data.teams[0].team
  const totalStudents = team._count.members
  const activeTasks = team._count.tasks

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {session.user.name}!</p>
        </div>
        <Badge variant="success" className="h-8 px-3 text-sm">
          <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
          Season Active
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">Active team members</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <CheckSquare className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{activeTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">In progress or pending</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team</CardTitle>
            <Trophy className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{team.name}</div>
            <p className="text-xs text-muted-foreground mt-1">{team.teamNumber}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Curriculum</CardTitle>
            <BookOpen className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">Active</div>
            <p className="text-xs text-muted-foreground mt-1">Season in progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Students & Active Tasks */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Team Roster</CardTitle>
            <CardDescription>Your active team members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {team.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">
                      {member.student.firstName[0]}{member.student.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {member.student.firstName} {member.student.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{member.primaryRole}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Grade {member.student.grade}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Tasks */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Active Tasks</CardTitle>
            <CardDescription>Tasks that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {team.tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active tasks</p>
              ) : (
                team.tasks.map((task) => (
                  <div key={task.id} className="flex items-start justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.category}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        variant={
                          task.priority === 'URGENT' ? 'destructive' :
                          task.priority === 'HIGH' ? 'warning' :
                          task.priority === 'MEDIUM' ? 'info' :
                          'secondary'
                        }
                      >
                        {task.priority}
                      </Badge>
                      {task.dueDate && (
                        <span className="text-xs text-muted-foreground">
                          Due {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
