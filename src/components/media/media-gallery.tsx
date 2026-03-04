'use client'
import { ProjectMedia } from '@prisma/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Image as ImageIcon, Video, Calendar, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { MediaPreview } from './media-preview'
import { useState } from 'react'

export function MediaGallery({ media }: { media: ProjectMedia[] }) {
  const [selectedMedia, setSelectedMedia] = useState<ProjectMedia | null>(null)

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return <ImageIcon className="h-4 w-4" />
      case 'VIDEO':
        return <Video className="h-4 w-4" />
      case 'DOCUMENT':
        return <FileText className="h-4 w-4" />
      default:
        return null
    }
  }

  const getMediaTypeColor = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'VIDEO':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'DOCUMENT':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size'
    const mb = bytes / (1024 * 1024)
    if (mb < 1) {
      return `${(bytes / 1024).toFixed(0)} KB`
    }
    return `${mb.toFixed(1)} MB`
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {media.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedMedia(item)}
          >
            {/* Media Preview */}
            <div className="aspect-video bg-gray-100 relative">
              {item.type === 'IMAGE' ? (
                <img
                  src={item.url}
                  alt={item.title || 'Project media'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : item.type === 'VIDEO' ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <Video className="h-12 w-12 text-gray-400" />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
              )}
              {/* Type Badge Overlay */}
              <div className="absolute top-2 right-2">
                <Badge className={getMediaTypeColor(item.type)} variant="outline">
                  {getMediaIcon(item.type)}
                  <span className="ml-1 text-xs">{item.type}</span>
                </Badge>
              </div>
            </div>

            {/* Media Info */}
            <div className="p-3">
              {item.title && (
                <h4 className="font-medium text-sm mb-1 truncate">{item.title}</h4>
              )}
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(item.uploadedAt), 'MMM d, yyyy')}
              </div>
              {item.fileSize && (
                <div className="text-xs text-gray-500">{formatFileSize(item.fileSize)}</div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Media Preview Modal */}
      {selectedMedia && (
        <MediaPreview media={selectedMedia} onClose={() => setSelectedMedia(null)} />
      )}
    </>
  )
}
