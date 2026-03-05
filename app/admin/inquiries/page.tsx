"use client"

import useSWR, { mutate } from "swr"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function InquiriesPage() {
  const { data, isLoading } = useSWR("/api/contact", fetcher, { refreshInterval: 5000 })
  const inquiries = data?.inquiries || []

  const setStatus = async (id: string, status: string) => {
    await fetch(`/api/contact/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
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
        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : inquiries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No inquiries yet.</p>
          ) : (
            inquiries.map((inq: any) => (
              <div key={inq._id} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{inq.subject}</p>
                  <Badge variant="outline">{inq.status}</Badge>
                </div>
                <p className="text-sm"><span className="font-medium">{inq.name}</span> ({inq.email})</p>
                {inq.phone ? <p className="text-xs text-muted-foreground">Phone: {inq.phone}</p> : null}
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{inq.message}</p>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => setStatus(inq._id, "read")}>Mark Read</Button>
                  <Button size="sm" onClick={() => setStatus(inq._id, "replied")}>Mark Replied</Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
