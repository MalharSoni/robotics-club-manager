'use server'
import prisma from '@/lib/prisma'
import { generatePresignedUrl, getPublicUrl } from '@/lib/r2'
import { z } from 'zod'
import { MediaType } from '@prisma/client'
import { revalidatePath } from 'next/cache'

// Validation schema for upload request
const uploadRequestSchema = z.object({
  projectId: z.string().cuid(),
  fileName: z.string().min(1).max(255),
  fileType: z.enum([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'video/mp4',
    'video/quicktime',
    'video/webm',
  ]),
  fileSize: z.number().min(1).max(100 * 1024 * 1024), // 100MB max
})

export async function generateUploadUrl(
  input: z.infer<typeof uploadRequestSchema>
) {
  try {
    // Validate input
    const validated = uploadRequestSchema.parse(input)

    // Generate unique key with timestamp
    const timestamp = Date.now()
    const sanitizedFileName = validated.fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const key = `projects/${validated.projectId}/${timestamp}-${sanitizedFileName}`

    // Generate presigned URL
    const uploadUrl = await generatePresignedUrl({
      key,
      contentType: validated.fileType,
      expiresIn: 3600, // 1 hour
    })

    return {
      success: true,
      uploadUrl,
      key,
      publicUrl: getPublicUrl(key),
    }
  } catch (error) {
    console.error('Error generating upload URL:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate upload URL',
    }
  }
}

// Validation schema for metadata save
const saveMetadataSchema = z.object({
  projectId: z.string().cuid(),
  key: z.string(),
  type: z.enum(['IMAGE', 'VIDEO', 'DOCUMENT']),
  title: z.string().optional(),
  fileSize: z.number(),
  mimeType: z.string(),
})

export async function saveMediaMetadata(
  input: z.infer<typeof saveMetadataSchema>
) {
  try {
    const validated = saveMetadataSchema.parse(input)

    // Get current max order for this project
    const maxOrder = await prisma.projectMedia.findFirst({
      where: { projectId: validated.projectId },
      select: { order: true },
      orderBy: { order: 'desc' },
    })

    // Create media record
    const media = await prisma.projectMedia.create({
      data: {
        projectId: validated.projectId,
        type: validated.type as MediaType,
        title: validated.title,
        url: getPublicUrl(validated.key),
        fileSize: validated.fileSize,
        mimeType: validated.mimeType,
        order: (maxOrder?.order || 0) + 1, // Append to end
      },
    })

    // Revalidate project pages that show media
    revalidatePath(`/dashboard/projects/${validated.projectId}`)
    revalidatePath(`/dashboard/projects/${validated.projectId}/upload`)

    return {
      success: true,
      media,
    }
  } catch (error) {
    console.error('Error saving media metadata:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save media metadata',
    }
  }
}
