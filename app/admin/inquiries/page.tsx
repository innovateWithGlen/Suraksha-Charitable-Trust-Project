"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function InquiriesPage() {
  const { data, isLoading } = useSWR("/api/contact", fetcher, { refreshInterval: 5000 })
  const inquiries = data?.inquiries || []
  const [activeInquiry, setActiveInquiry] = useState<any | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [sendEmail, setSendEmail] = useState(true)
  const [sending, setSending] = useState(false)

  const setStatus = async (id: string, status: "new" | "read" | "replied") => {
    const res = await fetch(`/api/contact/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) {
      toast.error("Failed to update inquiry status")
      return
    }
    mutate("/api/contact")
    toast.success(`Status updated to ${status}`)
  }

  const openReply = (inquiry: any) => {
    setActiveInquiry(inquiry)
    setReplyContent(inquiry.replyContent || "")
    setSendEmail(true)
  }

  const submitReply = async () => {
    if (!activeInquiry) return
    if (replyContent.trim().length < 10) {
      toast.error("Reply must be at least 10 characters")
      return
    }

    setSending(true)
    const res = await fetch(`/api/contact/${activeInquiry._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "replied",
        replyContent,
        sendEmail,
      }),
    })
    setSending(false)

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to send reply" }))
      toast.error(err.error || "Failed to send reply")
      return
    }

    toast.success(sendEmail ? "Reply sent via email" : "Reply saved")
    setActiveInquiry(null)
    setReplyContent("")
    mutate("/api/contact")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contact Inquiries</h1>
        <p className="text-sm text-muted-foreground">Manage website contact form submissions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Inquiries</CardTitle>
          <CardDescription>{inquiries.length} inquiry(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : inquiries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No inquiries yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Read</TableHead>
                  <TableHead>Replied</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inq: any) => (
                  <TableRow key={inq._id}>
                    <TableCell className="font-medium">{inq.subject}</TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{inq.name}</p>
                      <p className="text-xs text-muted-foreground">{inq.email}</p>
                    </TableCell>
                    <TableCell className="max-w-md truncate text-sm text-muted-foreground">{inq.message}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{inq.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={inq.status === "read" || inq.status === "replied"}
                        onCheckedChange={(checked) => setStatus(inq._id, checked ? "read" : "new")}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={inq.status === "replied"}
                        onCheckedChange={(checked) => setStatus(inq._id, checked ? "replied" : "read")}
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => openReply(inq)}>
                        Reply
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(activeInquiry)} onOpenChange={(open) => !open && setActiveInquiry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Inquiry</DialogTitle>
            <DialogDescription>
              Respond to {activeInquiry?.name} regarding "{activeInquiry?.subject}".
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={6}
              placeholder="Type your response..."
            />
            <label className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
              Send reply email to donor
              <Switch checked={sendEmail} onCheckedChange={setSendEmail} />
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveInquiry(null)}>
              Cancel
            </Button>
            <Button onClick={submitReply} disabled={sending}>
              {sending ? "Sending..." : "Send Reply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
