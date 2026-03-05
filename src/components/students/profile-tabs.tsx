'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OverviewTab } from './overview-tab'
import { SkillsTab } from './skills-tab'
import { ProjectsTab } from './projects-tab'
import { ReportCardsTab } from './report-cards-tab'

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  grade: number | null
  gradYear: number | null
  parentName: string | null
  parentEmail: string | null
  parentPhone: string | null
  bio: string | null
  avatar: string | null
  active: boolean
  teams: Array<{
    team: {
      id: string
      name: string
      teamNumber: string | null
    }
    primaryRole: string
  }>
  skills: Array<{
    skill: {
      id: string
      name: string
      description: string | null
      category: string
    }
    proficiency: string
    verified: boolean
    notes: string | null
    acquiredAt: Date
  }>
  tasks: Array<{
    task: {
      id: string
      title: string
      description: string | null
      priority: string
      status: string
      dueDate: Date | null
    }
    status: string
    notes: string | null
    assignedAt: Date
  }>
  projectRoles: Array<{
    project: {
      id: string
      name: string
      description: string | null
      category: string
      status: string
      startDate: Date | null
      endDate: Date | null
    }
    role: string
    contributions: string | null
    hoursSpent: number | null
  }>
  reportCards: Array<{
    id: string
    periodName: string
    startDate: Date
    endDate: Date
    overallGrade: string | null
    attendance: number | null
    technicalSkills: number | null
    teamwork: number | null
    leadership: number | null
    communication: number | null
    problemSolving: number | null
    initiative: number | null
    strengths: string | null
    areasForGrowth: string | null
    coachComments: string | null
    published: boolean
    publishedAt: Date | null
    createdAt: Date
  }>
}

interface ProfileTabsProps {
  student: Student
}

export function ProfileTabs({ student }: ProfileTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
        <TabsTrigger value="projects">Projects</TabsTrigger>
        <TabsTrigger value="reports">Report Cards</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-6">
        <OverviewTab student={student} />
      </TabsContent>
      <TabsContent value="skills" className="mt-6">
        <SkillsTab student={student} />
      </TabsContent>
      <TabsContent value="projects" className="mt-6">
        <ProjectsTab student={student} />
      </TabsContent>
      <TabsContent value="reports" className="mt-6">
        <ReportCardsTab student={student} />
      </TabsContent>
    </Tabs>
  )
}
