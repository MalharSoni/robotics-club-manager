'use client'

import { useState } from 'react'
import { Mail, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { sendReportCard } from '@/app/actions/reports'
import { useToast } from '@/hooks/use-toast'

interface SendReportDialogProps {
  reportCardId: string
  studentName: string
  parentEmail?: string | null
}

export function SendReportDialog({
  reportCardId,
  studentName,
  parentEmail,
}: SendReportDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState(parentEmail || '')
  const [recipientName, setRecipientName] = useState('')
  const [message, setMessage] = useState(
    `Dear Parent/Guardian,\n\nPlease find attached the report card for ${studentName}.\n\nBest regards,\nThe Coaching Team`
  )
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!recipientEmail) {
      toast({
        title: 'Missing email',
        description: 'Please enter a recipient email address',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const result = await sendReportCard({
        id: reportCardId,
        recipientEmail,
        recipientName: recipientName || undefined,
        message: message || undefined,
      })

      if ('error' in result) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: result.message,
        })
        setOpen(false)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send report card',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Mail className="h-4 w-4 mr-2" />
          Send Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Report Card</DialogTitle>
          <DialogDescription>
            Send this report card via email to parent/guardian
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="recipientName">Recipient Name (Optional)</Label>
            <Input
              id="recipientName"
              placeholder="Parent or guardian name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="recipientEmail">
              Recipient Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="recipientEmail"
              type="email"
              placeholder="parent@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            Note: Email functionality is not yet fully implemented. This is a placeholder for
            future email integration.
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Report Card
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
