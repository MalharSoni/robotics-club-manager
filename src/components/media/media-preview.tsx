'use client'
import { ProjectMedia } from '@prisma/client'
import { X, Download, Calendar, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { useEffect } from 'react'

export function MediaPreview({
  media,
  onClose,
}: {
  media: ProjectMedia
  onClose: () => void
}) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size'
    const mb = bytes / (1024 * 1024)
    return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{media.title || 'Untitled'}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(media.uploadedAt), 'MMM d, yyyy h:mm a')}
              </div>
              {media.fileSize && <span>{formatFileSize(media.fileSize)}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={media.url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="Download"
            >
              <Download className="h-5 w-5 text-gray-600" />
            </a>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="Close (Esc)"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-auto max-h-[calc(90vh-8rem)]">
          {media.type === 'IMAGE' ? (
            <img
              src={media.url}
              alt={media.title || 'Project media'}
              className="w-full h-auto rounded"
            />
          ) : media.type === 'VIDEO' ? (
            <video src={media.url} controls className="w-full h-auto rounded">
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Document preview not available</p>
              <a
                href={media.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline mt-2 inline-block"
              >
                Open in new tab
              </a>
            </div>
          )}

          {media.description && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-700">{media.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
