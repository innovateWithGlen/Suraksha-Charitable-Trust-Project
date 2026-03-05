"use client"

import { useState, useRef } from "react"
import {
  Plus,
  Trash2,
  Upload,
  ImageIcon,
  Calendar,
  MapPin,
  X,
  Save,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import Link from "next/link"

interface GalleryEvent {
  id: string
  title: string
  category: string
  date: string
  location: string
  images: string[]
}

const categoryOptions = [
  "Education",
  "Healthcare",
  "Environment",
  "Women Empowerment",
  "Child Welfare",
]

const categoryColors: Record<string, string> = {
  Education: "bg-blue-100 text-blue-800",
  Healthcare: "bg-rose-100 text-rose-800",
  Environment: "bg-emerald-100 text-emerald-800",
  "Women Empowerment": "bg-amber-100 text-amber-800",
  "Child Welfare": "bg-indigo-100 text-indigo-800",
}

export default function AdminGalleryPage() {
  const [events, setEvents] = useState<GalleryEvent[]>([
    {
      id: "1",
      title: "Annual Education Drive 2025",
      category: "Education",
      date: "2025-03-15",
      location: "Andheri, Mumbai",
      images: [
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80",
      ],
    },
    {
      id: "2",
      title: "Free Health Camp - Thane",
      category: "Healthcare",
      date: "2025-04-10",
      location: "Thane, Maharashtra",
      images: [
        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
      ],
    },
    {
      id: "3",
      title: "Tree Plantation Drive",
      category: "Environment",
      date: "2025-06-05",
      location: "Sanjay Gandhi National Park",
      images: [
        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
        "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&q=80",
      ],
    },
  ])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<GalleryEvent | null>(null)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [formTitle, setFormTitle] = useState("")
  const [formCategory, setFormCategory] = useState("")
  const [formDate, setFormDate] = useState("")
  const [formLocation, setFormLocation] = useState("")
  const [formImages, setFormImages] = useState<string[]>([])

  const resetForm = () => {
    setFormTitle("")
    setFormCategory("")
    setFormDate("")
    setFormLocation("")
    setFormImages([])
    setEditingEvent(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (event: GalleryEvent) => {
    setEditingEvent(event)
    setFormTitle(event.title)
    setFormCategory(event.category)
    setFormDate(event.date)
    setFormLocation(event.location)
    setFormImages([...event.images])
    setDialogOpen(true)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    // Simulate upload - in production this would upload to storage
    const newImages: string[] = []
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file)
      newImages.push(url)
    })
    setFormImages([...formImages, ...newImages])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const removeImage = (index: number) => {
    setFormImages(formImages.filter((_, i) => i !== index))
  }

  const saveEvent = () => {
    if (!formTitle || !formCategory || !formDate || !formLocation) return

    if (editingEvent) {
      setEvents(
        events.map((ev) =>
          ev.id === editingEvent.id
            ? {
                ...ev,
                title: formTitle,
                category: formCategory,
                date: formDate,
                location: formLocation,
                images: formImages,
              }
            : ev
        )
      )
    } else {
      const newEvent: GalleryEvent = {
        id: Date.now().toString(),
        title: formTitle,
        category: formCategory,
        date: formDate,
        location: formLocation,
        images: formImages,
      }
      setEvents([newEvent, ...events])
    }

    setDialogOpen(false)
    resetForm()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const deleteEvent = (id: string) => {
    setEvents(events.filter((ev) => ev.id !== id))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gallery Management</h1>
          <p className="text-sm text-muted-foreground">
            Upload images and manage events shown on the Gallery page
          </p>
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
                <DialogTitle>
                  {editingEvent ? "Edit Event" : "Add New Event"}
                </DialogTitle>
                <DialogDescription>
                  {editingEvent
                    ? "Update the event details and images."
                    : "Fill in the event details and upload images."}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4 py-4">
                <div>
                  <Label>Event Title</Label>
                  <Input
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Annual Education Drive 2025"
                    className="mt-1"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Category</Label>
                    <Select value={formCategory} onValueChange={setFormCategory}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Location</Label>
                  <Input
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Andheri, Mumbai"
                    className="mt-1"
                  />
                </div>

                {/* Image upload area */}
                <div>
                  <Label>Images</Label>
                  <div className="mt-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="gallery-upload"
                    />
                    <label
                      htmlFor="gallery-upload"
                      className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors hover:border-secondary hover:bg-muted/50"
                    >
                      <Upload className="size-8 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Click to upload images
                      </span>
                      <span className="text-xs text-muted-foreground/60">
                        PNG, JPG, WEBP up to 5MB each
                      </span>
                    </label>
                  </div>

                  {/* Image preview grid */}
                  {formImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {formImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="group relative aspect-square overflow-hidden rounded-lg border border-border"
                        >
                          <img
                            src={img}
                            alt={`Upload ${idx + 1}`}
                            className="size-full object-cover"
                            crossOrigin="anonymous"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                            aria-label="Remove image"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={saveEvent}
                  disabled={!formTitle || !formCategory || !formDate || !formLocation}
                  className="gap-1.5"
                >
                  <Save className="size-4" />
                  {editingEvent ? "Update Event" : "Create Event"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {saved && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Event saved successfully!
        </div>
      )}

      {/* Events list */}
      <div className="grid gap-4">
        {events.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <ImageIcon className="size-12 text-muted-foreground/30" />
              <div>
                <p className="font-medium text-foreground">No events yet</p>
                <p className="text-sm text-muted-foreground">
                  Add your first event to get started.
                </p>
              </div>
              <Button onClick={openCreateDialog} className="gap-1.5">
                <Plus className="size-4" />
                Add Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                {/* Thumbnail */}
                <div className="relative aspect-video w-full shrink-0 sm:aspect-square sm:w-40">
                  {event.images.length > 0 ? (
                    <img
                      src={event.images[0]}
                      alt={event.title}
                      className="size-full object-cover"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-muted">
                      <ImageIcon className="size-8 text-muted-foreground/30" />
                    </div>
                  )}
                  {event.images.length > 1 && (
                    <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
                      {event.images.length} photos
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Badge
                        variant="secondary"
                        className={`w-fit text-xs ${categoryColors[event.category] || ""}`}
                      >
                        {event.category}
                      </Badge>
                      <h3 className="text-lg font-semibold text-foreground">
                        {event.title}
                      </h3>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(event)}
                        className="text-xs"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteEvent(event.id)}
                        className="size-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      {new Date(event.date).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3.5" />
                      {event.location}
                    </span>
                  </div>

                  {/* Image thumbnails */}
                  {event.images.length > 0 && (
                    <div className="mt-auto flex gap-2 pt-2">
                      {event.images.slice(0, 5).map((img, idx) => (
                        <div
                          key={idx}
                          className="relative size-10 shrink-0 overflow-hidden rounded border border-border"
                        >
                          <img
                            src={img}
                            alt={`${event.title} ${idx + 1}`}
                            className="size-full object-cover"
                            crossOrigin="anonymous"
                          />
                        </div>
                      ))}
                      {event.images.length > 5 && (
                        <div className="flex size-10 items-center justify-center rounded border border-border bg-muted text-xs text-muted-foreground">
                          +{event.images.length - 5}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
