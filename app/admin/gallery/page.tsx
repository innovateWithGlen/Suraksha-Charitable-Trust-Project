"use client"

import { useMemo, useState } from "react"
import useSWR, { mutate } from "swr"
import Link from "next/link"
import { Plus, Trash2, ImageIcon, X, Save, Eye, Pencil, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

type ApiGalleryEvent = {
  _id: string
  title: string
  category: "education" | "healthcare" | "environment" | "community" | "events" | "other"
  date: string
  location: string
  description?: string
  images: Array<{ url: string; caption?: string }>
  isActive: boolean
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const categoryOptions = [
  { value: "education", label: "Education" },
  { value: "healthcare", label: "Healthcare" },
  { value: "environment", label: "Environment" },
  { value: "community", label: "Community" },
  { value: "events", label: "Events" },
  { value: "other", label: "Other" },
] as const

const categoryColors: Record<string, string> = {
  education: "bg-blue-100 text-blue-800",
  healthcare: "bg-rose-100 text-rose-800",
  environment: "bg-emerald-100 text-emerald-800",
  community: "bg-amber-100 text-amber-800",
  events: "bg-indigo-100 text-indigo-800",
  other: "bg-slate-100 text-slate-700",
}

type ImageInputMode = "url" | "upload"

export default function AdminGalleryPage() {
  const { data, isLoading } = useSWR("/api/gallery?active=false", fetcher, { refreshInterval: 5000 })
  const events: ApiGalleryEvent[] = data?.events || []

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [formTitle, setFormTitle] = useState("")
  const [formCategory, setFormCategory] = useState<ApiGalleryEvent["category"] | "">("")
  const [formDate, setFormDate] = useState("")
  const [formLocation, setFormLocation] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formImageUrl, setFormImageUrl] = useState("")
  const [formImages, setFormImages] = useState<string[]>([])
  const [imageInputMode, setImageInputMode] = useState<ImageInputMode>("url")
  const [uploadingImage, setUploadingImage] = useState(false)

  const editingEvent = useMemo(
    () => events.find((event) => event._id === editingEventId) || null,
    [events, editingEventId]
  )

  const resetForm = () => {
    setFormTitle("")
    setFormCategory("")
    setFormDate("")
    setFormLocation("")
    setFormDescription("")
    setFormImageUrl("")
    setFormImages([])
    setImageInputMode("url")
    setUploadingImage(false)
    setEditingEventId(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (event: ApiGalleryEvent) => {
    setEditingEventId(event._id)
    setFormTitle(event.title)
    setFormCategory(event.category)
    setFormDate(new Date(event.date).toISOString().slice(0, 10))
    setFormLocation(event.location)
    setFormDescription(event.description || "")
    setFormImages(event.images.map((image) => image.url))
    setFormImageUrl("")
    setDialogOpen(true)
  }

  const addImageUrl = () => {
    const url = formImageUrl.trim()
    if (!url) return

    try {
      new URL(url)
      setFormImages((prev) => [...prev, url])
      setFormImageUrl("")
    } catch {
      toast.error("Enter a valid image URL")
    }
  }

  const uploadImageFromFile = async (file: File | null) => {
    if (!file) return

    setUploadingImage(true)

    try {
      const payload = new FormData()
      payload.append("image", file)

      const response = await fetch("/api/uploads/images", {
        method: "POST",
        body: payload,
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result?.url) {
        toast.error(result.error || "Failed to upload image")
        return
      }

      setFormImages((prev) => [...prev, result.url])
      toast.success("Image uploaded")
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = (index: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== index))
  }

  const saveEvent = async () => {
    if (!formTitle || !formCategory || !formDate || !formLocation) {
      toast.error("Please fill required fields")
      return
    }

    const payload = {
      title: formTitle,
      category: formCategory,
      date: formDate,
      location: formLocation,
      description: formDescription || undefined,
      images: formImages.map((url) => ({ url })),
      isActive: true,
    }

    setSaving(true)
    try {
      const res = await fetch(editingEvent ? `/api/gallery/${editingEvent._id}` : "/api/gallery", {
        method: editingEvent ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(result.error || "Failed to save gallery event")
        return
      }

      toast.success(editingEvent ? "Event updated" : "Event created")
      setDialogOpen(false)
      resetForm()
      mutate("/api/gallery?active=false")
      mutate("/api/gallery?active=true")
    } finally {
      setSaving(false)
    }
  }

  const deleteEvent = async (id: string) => {
    const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" })
    if (!res.ok) {
      const result = await res.json().catch(() => ({}))
      toast.error(result.error || "Failed to delete event")
      return
    }

    toast.success("Event deleted")
    mutate("/api/gallery?active=false")
    mutate("/api/gallery?active=true")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gallery Management</h1>
          <p className="text-sm text-muted-foreground">Manage events shown on the public gallery page.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/gallery" target="_blank">
              <Eye className="size-3.5" />
              View Gallery
            </Link>
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="gap-1.5">
                <Plus className="size-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
                <DialogDescription>All changes here are saved to database and shown publicly.</DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4 py-4">
                <div>
                  <Label>Event Title</Label>
                  <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="mt-1" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Category</Label>
                    <Select value={formCategory} onValueChange={(value) => setFormCategory(value as ApiGalleryEvent["category"])}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="mt-1" />
                  </div>
                </div>

                <div>
                  <Label>Location</Label>
                  <Input value={formLocation} onChange={(e) => setFormLocation(e.target.value)} className="mt-1" />
                </div>

                <div>
                  <Label>Description (optional)</Label>
                  <Input value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="mt-1" />
                </div>

                <div>
                  <Label>Add Image</Label>
                  <div className="mt-1 flex gap-2">
                    <Button
                      type="button"
                      variant={imageInputMode === "url" ? "default" : "outline"}
                      onClick={() => setImageInputMode("url")}
                    >
                      URL
                    </Button>
                    <Button
                      type="button"
                      variant={imageInputMode === "upload" ? "default" : "outline"}
                      onClick={() => setImageInputMode("upload")}
                    >
                      Upload
                    </Button>
                  </div>

                  {imageInputMode === "url" ? (
                    <div className="mt-2 flex gap-2">
                      <Input
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                        placeholder="https://..."
                      />
                      <Button type="button" variant="outline" onClick={addImageUrl}>
                        Add
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-2 flex flex-col gap-2">
                      <Input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          uploadImageFromFile(file)
                          e.currentTarget.value = ""
                        }}
                      />
                      <p className="text-xs text-muted-foreground">Upload from local drive (JPG, PNG, WEBP • up to 5MB)</p>
                    </div>
                  )}

                  {uploadingImage ? <p className="mt-2 text-xs text-muted-foreground">Uploading image...</p> : null}

                  {formImages.length > 0 ? (
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {formImages.map((img, idx) => (
                        <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                          <img src={img} alt={`Event image ${idx + 1}`} className="size-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveEvent} disabled={saving} className="gap-1.5">
                  <Save className="size-4" />
                  {saving ? "Saving..." : editingEvent ? "Update Event" : "Create Event"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">Loading events...</CardContent>
          </Card>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <ImageIcon className="size-12 text-muted-foreground/30" />
              <div>
                <p className="font-medium text-foreground">No events yet</p>
                <p className="text-sm text-muted-foreground">Add your first event to get started.</p>
              </div>
              <Button onClick={openCreateDialog} className="gap-1.5">
                <Plus className="size-4" />
                Add Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event._id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <div className="relative aspect-video w-full shrink-0 sm:aspect-square sm:w-40">
                  {event.images?.[0]?.url ? (
                    <img src={event.images[0].url} alt={event.title} className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-muted">
                      <ImageIcon className="size-8 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Badge variant="secondary" className={`w-fit text-xs ${categoryColors[event.category] || ""}`}>
                        {categoryOptions.find((c) => c.value === event.category)?.label || event.category}
                      </Badge>
                      <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {new Date(event.date).toLocaleDateString("en-IN")}
                        </p>
                        <p className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          {event.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button variant="outline" size="icon" onClick={() => openEditDialog(event)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => deleteEvent(event._id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
