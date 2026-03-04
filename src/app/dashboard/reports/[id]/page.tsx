'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Eye,
  Edit,
  CheckCircle,
  Circle,
  Trash2,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ReportCardForm } from '@/components/reports/report-card-form'
import { ReportCardPreview } from '@/components/reports/report-card-preview'
import { SendReportDialog } from '@/components/reports/send-report-dialog'
import {
  getReportCardById,
  publishReportCard,
  unpublishReportCard,
  deleteReportCard,
} from '@/app/actions/reports'
import { useToast } from '@/hooks/use-toast'
import { useEffect } from 'react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ReportCardDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [reportCard, setReportCard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Fetch report card
  useEffect(() => {
    async function fetchReportCard() {
      setLoading(true)
      const result = await getReportCardById(resolvedParams.id)

      if ('error' in result) {
        setError(result.error || 'Unknown error')
      } else {
        setReportCard(result.reportCard)
      }
      setLoading(false)
    }

    fetchReportCard()
  }, [resolvedParams.id])

  const handlePublish = async () => {
    if (!reportCard) return

    setPublishing(true)

    try {
      const result = await publishReportCard({ id: reportCard.id })

      if ('error' in result) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Report card published successfully',
        })
        setReportCard(result.reportCard)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to publish report card',
        variant: 'destructive',
      })
    } finally {
      setPublishing(false)
    }
  }

  const handleUnpublish = async () => {
    if (!reportCard) return

    setPublishing(true)

    try {
      const result = await unpublishReportCard(reportCard.id)

      if ('error' in result) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Report card unpublished successfully',
        })
        setReportCard(result.reportCard)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to unpublish report card',
        variant: 'destructive',
      })
    } finally {
      setPublishing(false)
    }
  }

  const handleDelete = async () => {
    if (!reportCard) return

    setDeleting(true)

    try {
      const result = await deleteReportCard(reportCard.id)

      if ('error' in result) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Report card deleted successfully',
        })
        router.push('/dashboard/reports')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete report card',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !reportCard) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/reports">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reports
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="py-8">
            <p className="text-red-600">{error || 'Report card not found'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const studentName = `${reportCard.student.firstName} ${reportCard.student.lastName}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/reports">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{studentName}</h1>
            <p className="text-gray-500">{reportCard.periodName}</p>
          </div>
        </div>
        <div>
          {reportCard.published ? (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              <CheckCircle className="h-3 w-3 mr-1" />
              Published
            </Badge>
          ) : (
            <Badge variant="secondary">
              <Circle className="h-3 w-3 mr-1" />
              Draft
            </Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {reportCard.published ? (
          <>
            <Button onClick={handleUnpublish} disabled={publishing}>
              {publishing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Edit className="h-4 w-4 mr-2" />
              )}
              Unpublish to Edit
            </Button>
            <SendReportDialog
              reportCardId={reportCard.id}
              studentName={studentName}
              parentEmail={reportCard.student.parentEmail}
            />
          </>
        ) : (
          <>
            <Button onClick={handlePublish} disabled={publishing}>
              {publishing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Publish Report Card
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </>
        )}
      </div>

      {/* Warning for published reports */}
      {reportCard.published && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-900 font-medium">
                  This report card is published
                </p>
                <p className="text-sm text-blue-800">
                  To make changes, you must unpublish it first. Published reports cannot be
                  edited to maintain data integrity.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="edit" className="space-y-6">
        <TabsList>
          <TabsTrigger value="edit">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-4">
          <ReportCardForm reportCard={reportCard} />
        </TabsContent>

        <TabsContent value="preview">
          <ReportCardPreview reportCard={reportCard} />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Report Card</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this report card for {studentName}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Report Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
