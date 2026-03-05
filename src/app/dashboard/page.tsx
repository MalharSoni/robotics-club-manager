import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma'
import { StatCard } from '@/components/stat-card'
import { Users, Cpu, Percent, CalendarCheck, TriangleAlert, Trophy } from 'lucide-react'
import Link from 'next/link'

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
            },
          },
        },
      },
    },
  })

  // Get all students across all teams
  const totalStudents = await prisma.student.count({
    where: {
      active: true,
      teams: {
        some: {
          teamId: {
            in: coachProfile?.teams.map(t => t.teamId) || [],
          },
        },
      },
    },
  })

  // Get overdue tasks count
  const overdueTasks = await prisma.task.count({
    where: {
      teamId: {
        in: coachProfile?.teams.map(t => t.teamId) || [],
      },
      status: { notIn: ['COMPLETED'] },
      dueDate: {
        lt: new Date(),
      },
    },
  })

  return {
    coachProfile,
    totalStudents,
    overdueTasks,
  }
}

export default async function DashboardPage() {
  const session = await requireAuth()
  const { coachProfile, totalStudents, overdueTasks } = await getDashboardData(session.user.id)

  if (!coachProfile || coachProfile.teams.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-[22px] font-[800]" style={{ color: 'var(--black)', letterSpacing: '-.02em' }}>
            Welcome, {session.user.name}!
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--gray-1)' }}>
            Get started by creating your first team
          </p>
        </div>
      </div>
    )
  }

  const activeTeams = coachProfile.teams.length
  const totalTasks = coachProfile.teams.reduce((acc, t) => acc + t.team._count.tasks, 0)

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-[800]" style={{ color: 'var(--black)', letterSpacing: '-.02em' }}>
            Dashboard
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--gray-1)' }}>
            Welcome back, {session.user.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/reports"
            className="inline-flex items-center gap-1.5 text-[13px] font-[600] px-[14px] py-[7px] rounded-[6px] border-[1.5px] bg-transparent transition-colors"
            style={{ borderColor: 'var(--gray-3)', color: 'var(--black-3)' }}
          >
            Export Report
          </Link>
          <Link
            href="/dashboard/students"
            className="inline-flex items-center gap-1.5 text-[13px] font-[600] px-[14px] py-[7px] rounded-[6px] transition-opacity active:scale-[0.97]"
            style={{ background: 'var(--yellow)', color: 'var(--black)' }}
          >
            <Users className="w-[13px] h-[13px]" />
            View Students
          </Link>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-[14px]">
        <Link href="/dashboard/students" className="no-underline">
          <StatCard
            label="Total Students"
            value={totalStudents}
            meta="Active members"
            icon={<Users className="w-5 h-5" />}
          />
        </Link>

        <Link href="/dashboard/teams" className="no-underline">
          <StatCard
            label="Active Teams"
            value={activeTeams}
            meta="VEX V5 & VIQRC"
            accent="yellow"
            icon={<Cpu className="w-5 h-5" />}
          />
        </Link>

        <StatCard
          label="Attendance"
          value="—"
          meta="Coming soon"
          icon={<Percent className="w-5 h-5" />}
        />

        <StatCard
          label="Meetings"
          value="—"
          meta="No upcoming meetings"
          icon={<CalendarCheck className="w-5 h-5" />}
        />

        <Link href="/dashboard/tasks" className="no-underline">
          <StatCard
            label="Overdue Tasks"
            value={overdueTasks}
            meta={overdueTasks > 0 ? "Needs attention" : "All caught up"}
            accent={overdueTasks > 0 ? "red" : undefined}
            icon={<TriangleAlert className="w-5 h-5" />}
          />
        </Link>

        <StatCard
          label="Next Comp"
          value="TBD"
          meta="No upcoming competitions"
          accent="black"
          icon={<Trophy className="w-5 h-5" />}
        />
      </div>

      {/* Quick Links Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[14px]">
        <Link
          href="/dashboard/students"
          className="bg-white border border-[var(--gray-3)] rounded-[10px] p-5 hover:shadow-[0_4px_12px_rgba(0,0,0,.10)] transition-shadow no-underline group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-[6px] flex items-center justify-center" style={{ background: 'var(--yellow)' }}>
              <Users className="w-5 h-5" style={{ color: 'var(--black)' }} />
            </div>
            <div className="text-[14px] font-[700]" style={{ color: 'var(--black)' }}>
              Student Management
            </div>
          </div>
          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--gray-1)' }}>
            View roster, track progress, and manage student profiles
          </p>
        </Link>

        <Link
          href="/dashboard/curriculum"
          className="bg-white border border-[var(--gray-3)] rounded-[10px] p-5 hover:shadow-[0_4px_12px_rgba(0,0,0,.10)] transition-shadow no-underline group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-[6px] flex items-center justify-center" style={{ background: 'var(--gray-4)', border: '1px solid var(--gray-3)' }}>
              <CalendarCheck className="w-5 h-5" style={{ color: 'var(--black)' }} />
            </div>
            <div className="text-[14px] font-[700]" style={{ color: 'var(--black)' }}>
              Foundation Bootcamp
            </div>
          </div>
          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--gray-1)' }}>
            Track bootcamp milestones from safety training to competition prep
          </p>
        </Link>

        <Link
          href="/dashboard/projects"
          className="bg-white border border-[var(--gray-3)] rounded-[10px] p-5 hover:shadow-[0_4px_12px_rgba(0,0,0,.10)] transition-shadow no-underline group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-[6px] flex items-center justify-center" style={{ background: 'var(--gray-4)', border: '1px solid var(--gray-3)' }}>
              <Trophy className="w-5 h-5" style={{ color: 'var(--black)' }} />
            </div>
            <div className="text-[14px] font-[700]" style={{ color: 'var(--black)' }}>
              Projects & Roles
            </div>
          </div>
          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--gray-1)' }}>
            Manage robot builds, documentation, and student responsibilities
          </p>
        </Link>
      </div>
    </div>
  )
}
