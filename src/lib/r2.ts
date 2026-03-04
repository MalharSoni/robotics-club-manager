import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Singleton R2 client instance
let r2Client: S3Client | null = null

export function getR2Client(): S3Client {
  if (r2Client) return r2Client

  // Validate required env vars
  const endpoint = process.env.R2_ENDPOINT
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'Missing R2 configuration. Required: R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY'
    )
  }

  r2Client = new S3Client({
    region: 'auto', // R2 uses 'auto' region
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })

  return r2Client
}

export async function generatePresignedUrl(params: {
  key: string
  contentType: string
  expiresIn?: number
}): Promise<string> {
  const client = getR2Client()
  const bucketName = process.env.R2_BUCKET_NAME

  if (!bucketName) {
    throw new Error('Missing R2_BUCKET_NAME environment variable')
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: params.key,
    ContentType: params.contentType,
  })

  // Generate presigned URL valid for specified time (default 1 hour)
  const url = await getSignedUrl(client, command, {
    expiresIn: params.expiresIn || 3600,
  })

  return url
}

export function getPublicUrl(key: string): string {
  const publicUrl = process.env.R2_PUBLIC_URL

  if (!publicUrl) {
    throw new Error('Missing R2_PUBLIC_URL environment variable')
  }

  return `${publicUrl}/${key}`
}
