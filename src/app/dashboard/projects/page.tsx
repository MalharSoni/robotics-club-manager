import { Suspense } from 'react'
import { getProjects } from '@/app/actions/projects'
import { ProjectsListClient } from '@/components/projects/projects-list-client'
import { Card, CardContent } from '@/components/ui/card'

export default async function ProjectsPage() {
  const result = await getProjects()

  if ('error' in result) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-gray-500">Manage team projects and initiatives</p>
        </div>
        <Card>
          <CardContent className="py-8">
            <p className="text-red-600">{result.error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-gray-500">
          Manage team projects and initiatives - {result.projects?.length || 0} projects total
        </p>
      </div>

      <Suspense fallback={<div>Loading projects...</div>}>
        <ProjectsListClient initialProjects={result.projects || []} />
      </Suspense>
    </div>
  )
}
