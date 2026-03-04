'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link as LinkIcon, Copy, CheckCircle2, Calendar, Eye, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { generateParentShareLink, getShareLinkForStudent } from '@/app/actions/sharing'

export function ShareLinkManager({
  studentId,
  studentName,
  coachUserId,
}: {
  studentId: string
  studentName: string
  coachUserId: string
}) {
  const [linkData, setLinkData] = useState<{
    exists: boolean
    shareUrl?: string
    expiresAt?: Date | null
    accessCount?: number
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Load existing link on mount
  useEffect(() => {
    loadExistingLink()
  }, [studentId])

  const loadExistingLink = async () => {
    const result = await getShareLinkForStudent(studentId)
    if (result.success) {
      setLinkData({
        exists: result.exists || false,
        shareUrl: result.shareUrl,
        expiresAt: result.expiresAt,
        accessCount: result.accessCount,
      })
    }
  }

  const handleGenerateLink = async () => {
    setLoading(true)
    try {
      const result = await generateParentShareLink(studentId, coachUserId)
      if (result.success) {
        setLinkData({
          exists: true,
          shareUrl: result.shareUrl,
          expiresAt: result.expiresAt,
          accessCount: 0,
        })
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      alert('Failed to generate link')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = async () => {
    if (!linkData?.shareUrl) return

    try {
      await navigator.clipboard.writeText(linkData.shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      alert('Failed to copy link')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          Parent Share Link
        </CardTitle>
        <CardDescription>
          Generate a secure link to share {studentName}'s portfolio with parents. Copy and send via email or text before showcase days.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {linkData?.exists && linkData.shareUrl ? (
          <>
            {/* Existing Link Display */}
            <div className="p-3 bg-gray-50 rounded border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  Active
                </Badge>
                {linkData.expiresAt && (
                  <span className="text-xs text-gray-600 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Expires {format(new Date(linkData.expiresAt), 'MMM d, yyyy')}
                  </span>
                )}
                {linkData.accessCount !== undefined && (
                  <span className="text-xs text-gray-600 flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    Viewed {linkData.accessCount} times
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={linkData.shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded font-mono"
                />
                <Button
                  size="sm"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
                <a
                  href={linkData.shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Preview
                  </Button>
                </a>
              </div>
            </div>

            {/* Usage Instructions */}
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
              <p className="font-medium text-blue-900 mb-1">How to share with parents:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800">
                <li>Click "Copy" to copy the link</li>
                <li>Send via email, text message, or parent communication platform</li>
                <li>Parents can view without creating an account</li>
                <li>Link expires automatically after 90 days</li>
              </ol>
            </div>
          </>
        ) : (
          <>
            {/* Generate Link Button */}
            <div className="text-center py-8">
              <Button
                onClick={handleGenerateLink}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <LinkIcon className="h-4 w-4" />
                {loading ? 'Generating...' : 'Generate Parent Link'}
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Creates a secure, read-only link valid for 90 days
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
