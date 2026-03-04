import { getProjectById } from '@/app/actions/projects'
import { getStudents } from '@/app/actions/students'
import { ProjectDetailClient } from '@/components/projects/project-detail-client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface ProjectDetailPageProps {
  params: {
    id: string
  }
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const [projectResult, studentsResult] = await Promise.all([
    getProjectById(params.id),
    getStudents(),
  ])

  if ('error' in projectResult) {
    if (projectResult.error === 'Project not found') {
      notFound()
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="py-8">
            <p className="text-red-600">{projectResult.error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const availableStudents = 'students' in studentsResult ? studentsResult.students || [] : []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
      </div>

      <ProjectDetailClient
        project={projectResult.project}
        availableStudents={availableStudents}
      />
    </div>
  )
}
