"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Trash2, Upload } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DocumentsPage() {
  const { data, isLoading } = useSWR("/api/documents", fetcher, { refreshInterval: 5000 })
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [saving, setSaving] = useState(false)

  const docs = data?.documents || []

  const addDocument = async () => {
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, filename: `${title}.txt`, fileType: "text" }),
    })
    setSaving(false)
    if (res.ok) {
      setTitle("")
      setContent("")
      mutate("/api/documents")
    }
  }

  const removeDocument = async (id: string) => {
    await fetch(`/api/documents/${id}`, { method: "DELETE" })
    mutate("/api/documents")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Trust Documents</h1>
        <p className="text-sm text-muted-foreground">Upload knowledge-base content for the RAG chatbot.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Document</CardTitle>
          <CardDescription>The chatbot will answer only from these documents.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 80G Policy" />
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} placeholder="Paste document text here..." />
          </div>
          <Button onClick={addDocument} disabled={saving}>
            <Upload className="mr-2 size-4" />
            {saving ? "Uploading..." : "Upload Document"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
          <CardDescription>{docs.length} document(s)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : docs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
          ) : (
            docs.map((doc: any) => (
              <div key={doc._id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium text-sm">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">Chunks: {doc.totalChunks}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => removeDocument(doc._id)}>
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
