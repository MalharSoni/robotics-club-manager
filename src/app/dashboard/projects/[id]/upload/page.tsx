import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { FileUploadForm } from '@/components/media/file-upload-form'
import { MediaGallery } from '@/components/media/media-gallery'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Upload } from 'lucide-react'
import Link from 'next/link'

export default async function ProjectUploadPage({
  params,
}: {
  params: { id: string }
}) {
  // Fetch project with existing media
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      media: {
        orderBy: { uploadedAt: 'asc' }, // Chronological order (oldest first)
      },
      team: true,
    },
  })

  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/dashboard/projects/${project.id}`}
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {project.name}
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Upload className="h-6 w-6" />
          Upload Photos & Videos
        </h1>
        <p className="text-gray-600 mt-1">
          Document your build process with photos and videos. Upload regularly, not just at the end!
        </p>
      </div>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Media</CardTitle>
          <CardDescription>
            Select photos or videos from your device. Files upload directly to cloud storage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploadForm projectId={project.id} />
        </CardContent>
      </Card>

      {/* Existing Media Gallery */}
      {project.media.length > 0 && (
        <>
          <Separator />
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Project Documentation ({project.media.length} {project.media.length === 1 ? 'file' : 'files'})
            </h2>
            <MediaGallery media={project.media} />
          </div>
        </>
      )}

      {/* Empty State */}
      {project.media.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-gray-500">
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No photos or videos yet.</p>
              <p className="text-sm mt-1">Upload your first files using the form above.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
