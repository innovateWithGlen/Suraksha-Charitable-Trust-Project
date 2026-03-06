"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Download, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DocumentsPage() {
  const { data, isLoading } = useSWR("/api/documents", fetcher, { refreshInterval: 5000 })
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string>("")
  const [statusType, setStatusType] = useState<"success" | "error" | "">("")

  const docs = data?.documents || []

  const addDocument = async () => {
    if (!title.trim() && !file) {
      toast.error("Title is required when no PDF is selected")
      return
    }

    if (!file && !content.trim()) {
      toast.error("Provide content or upload a PDF")
      return
    }

    if (file && file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed")
      return
    }

    setSaving(true)
    setStatusMessage("")
    setStatusType("")
    try {
      let res: Response

      if (file) {
        const formData = new FormData()
        formData.set("title", title)
        formData.set("content", content)
        formData.set("file", file)

        res = await fetch("/api/documents", {
          method: "POST",
          body: formData,
        })
      } else {
        res = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, filename: `${title || "manual-entry"}.txt`, fileType: "text" }),
        })
      }

      if (res.ok) {
        setTitle("")
        setContent("")
        setFile(null)
        mutate("/api/documents")
        setStatusType("success")
        setStatusMessage("Document uploaded and indexed for chatbot.")
        toast.success("Document uploaded and indexed for chatbot")
      } else {
        const payload = await res.json().catch(() => ({ error: "Upload failed" }))
        const message = payload.error || "Upload failed"
        setStatusType("error")
        setStatusMessage(message)
        toast.error(message)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error while uploading"
      setStatusType("error")
      setStatusMessage(message)
      toast.error(message)
    } finally {
      setSaving(false)
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
            <Label>Upload PDF</Label>
            <Input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-muted-foreground">
              Upload a PDF to store it in MongoDB and index it for RAG chat.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Content (optional if PDF uploaded)</Label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} placeholder="Paste document text here..." />
          </div>
          <Button onClick={addDocument} disabled={saving}>
            <Upload className="mr-2 size-4" />
            {saving ? "Uploading..." : "Upload Document"}
          </Button>
          {statusMessage ? (
            <p
              className={`text-sm ${
                statusType === "error" ? "text-red-600" : "text-emerald-700"
              }`}
            >
              {statusMessage}
            </p>
          ) : null}
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
                  <p className="text-xs text-muted-foreground">
                    {doc.filename} {doc.fileSize ? `- ${(doc.fileSize / 1024).toFixed(1)} KB` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">Chunks: {doc.totalChunks}</p>
                </div>
                <div className="flex items-center gap-2">
                  {doc.fileType === "pdf" ? (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/api/documents/${doc._id}/download`} target="_blank" rel="noreferrer">
                        <Download className="mr-2 size-4" />
                        Download
                      </a>
                    </Button>
                  ) : null}
                  <Button variant="outline" size="sm" onClick={() => removeDocument(doc._id)}>
                    <Trash2 className="mr-2 size-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
