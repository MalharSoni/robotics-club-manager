'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react'
import { generateUploadUrl, saveMediaMetadata } from '@/app/actions/media'
import { useRouter } from 'next/navigation'

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'video/mp4',
  'video/quicktime',
  'video/webm',
]

const uploadFormSchema = z.object({
  files: z
    .custom<FileList>()
    .refine((files) => files && files.length > 0, 'Select at least one file')
    .refine(
      (files) => Array.from(files || []).every((file) => file.size <= MAX_FILE_SIZE),
      'Files must be under 100MB'
    )
    .refine(
      (files) => Array.from(files || []).every((file) => ACCEPTED_TYPES.includes(file.type)),
      'Only images (.jpg, .png, .webp, .heic) and videos (.mp4, .mov, .webm) allowed'
    ),
  title: z.string().optional(),
})

type UploadFormData = z.infer<typeof uploadFormSchema>

export function FileUploadForm({ projectId }: { projectId: string }) {
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'uploading' | 'success' | 'error'>>({})
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({})
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadFormSchema),
  })

  const onSubmit = async (data: UploadFormData) => {
    setIsUploading(true)
    setUploadStatus({})
    setErrorMessages({})

    const files = Array.from(data.files || [])

    for (const file of files) {
      setUploadStatus((prev) => ({ ...prev, [file.name]: 'uploading' }))

      try {
        // Step 1: Generate presigned URL
        const urlResult = await generateUploadUrl({
          projectId,
          fileName: file.name,
          fileType: file.type as any,
          fileSize: file.size,
        })

        if (!urlResult.success || !urlResult.uploadUrl || !urlResult.key) {
          throw new Error(urlResult.error || 'Failed to generate upload URL')
        }

        // Step 2: Upload file to R2
        const uploadResponse = await fetch(urlResult.uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        })

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.statusText}`)
        }

        // Step 3: Save metadata to database
        const metadataResult = await saveMediaMetadata({
          projectId,
          key: urlResult.key,
          type: file.type.startsWith('image/') ? 'IMAGE' : 'VIDEO',
          title: data.title,
          fileSize: file.size,
          mimeType: file.type,
        })

        if (!metadataResult.success) {
          throw new Error(metadataResult.error || 'Failed to save metadata')
        }

        setUploadStatus((prev) => ({ ...prev, [file.name]: 'success' }))
      } catch (error) {
        console.error(`Upload error for ${file.name}:`, error)
        setUploadStatus((prev) => ({ ...prev, [file.name]: 'error' }))
        setErrorMessages((prev) => ({
          ...prev,
          [file.name]: error instanceof Error ? error.message : 'Upload failed',
        }))
      }
    }

    setIsUploading(false)

    // If all uploads succeeded, reset form and refresh
    const allSuccess = Object.values(uploadStatus).every((status) => status === 'success')
    if (allSuccess) {
      reset()
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="files">Upload Photos/Videos</Label>
        <Input
          id="files"
          type="file"
          multiple
          accept="image/*,video/*"
          capture="environment" // Enable camera on mobile
          {...register('files')}
          disabled={isUploading}
          className="cursor-pointer"
        />
        {errors.files && (
          <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.files.message as string}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Max 100MB per file. Supports JPEG, PNG, WebP, HEIC, MP4, MOV, WebM.
        </p>
      </div>

      <div>
        <Label htmlFor="title">Title (optional)</Label>
        <Input
          id="title"
          placeholder="Week 3 progress photos"
          {...register('title')}
          disabled={isUploading}
        />
      </div>

      {/* Upload status display */}
      {Object.keys(uploadStatus).length > 0 && (
        <div className="space-y-2 p-3 bg-gray-50 rounded-md">
          {Object.entries(uploadStatus).map(([filename, status]) => (
            <div key={filename} className="flex items-center gap-2">
              {status === 'uploading' && (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                  <span className="text-sm text-gray-700">{filename}</span>
                </>
              )}
              {status === 'success' && (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">{filename}</span>
                </>
              )}
              {status === 'error' && (
                <>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-gray-700">{filename}</span>
                  {errorMessages[filename] && (
                    <span className="text-xs text-red-500">({errorMessages[filename]})</span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <Button type="submit" disabled={isUploading} className="w-full">
        <Upload className="h-4 w-4 mr-2" />
        {isUploading ? 'Uploading...' : 'Upload Files'}
      </Button>
    </form>
  )
}
