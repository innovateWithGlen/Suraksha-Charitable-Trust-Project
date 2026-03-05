"use client"

import { useEffect, useState } from "react"
import { Save, Plus, Trash2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

type ContentDoc = {
  _id: string
  title: string
  subtitle?: string
  content: string
  order?: number
  isActive?: boolean
}

type EditableFaq = {
  id: string
  question: string
  answer: string
}

type EditableProgram = {
  id: string
  title: string
  description: string
}

const makeTempId = () => `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

export default function ContentPage() {
  const [faqs, setFaqs] = useState<EditableFaq[]>([])
  const [programs, setPrograms] = useState<EditableProgram[]>([])
  const [hero, setHero] = useState({
    id: "",
    heading: "",
    subtext: "",
    subtitle: "",
  })
  const [deletedFaqIds, setDeletedFaqIds] = useState<string[]>([])
  const [deletedProgramIds, setDeletedProgramIds] = useState<string[]>([])

  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const loadContent = async () => {
    try {
      setLoading(true)
      setError("")

      const [faqRes, programRes, heroRes] = await Promise.all([
        fetch("/api/content?type=faq"),
        fetch("/api/content?type=program"),
        fetch("/api/content?type=hero"),
      ])

      if (!faqRes.ok || !programRes.ok || !heroRes.ok) {
        throw new Error("Failed to load content")
      }

      const faqJson = await faqRes.json()
      const programJson = await programRes.json()
      const heroJson = await heroRes.json()

      const faqItems = (faqJson.content as ContentDoc[]).map((item) => ({
        id: item._id,
        question: item.title,
        answer: item.content,
      }))

      const programItems = (programJson.content as ContentDoc[]).map((item) => ({
        id: item._id,
        title: item.title,
        description: item.content,
      }))

      const heroItem = (heroJson.content as ContentDoc[])[0]

      setFaqs(faqItems)
      setPrograms(programItems)
      setHero({
        id: heroItem?._id || "",
        heading: heroItem?.title || "",
        subtext: heroItem?.content || "",
        subtitle: heroItem?.subtitle || "",
      })
      setDeletedFaqIds([])
      setDeletedProgramIds([])
    } catch {
      setError("Failed to load content. Please refresh and try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContent()
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      setError("")

      const requests: Promise<Response>[] = []

      for (const id of deletedFaqIds) {
        requests.push(fetch(`/api/content/${id}`, { method: "DELETE" }))
      }

      for (const id of deletedProgramIds) {
        requests.push(fetch(`/api/content/${id}`, { method: "DELETE" }))
      }

      const cleanFaqs = faqs.filter((faq) => faq.question.trim() && faq.answer.trim())
      const cleanPrograms = programs.filter(
        (program) => program.title.trim() && program.description.trim()
      )

      for (const [index, faq] of cleanFaqs.entries()) {
        const payload = {
          type: "faq",
          title: faq.question.trim(),
          content: faq.answer.trim(),
          order: index + 1,
          isActive: true,
        }

        if (faq.id.startsWith("temp_")) {
          requests.push(
            fetch("/api/content", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          )
        } else {
          requests.push(
            fetch(`/api/content/${faq.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          )
        }
      }

      for (const [index, program] of cleanPrograms.entries()) {
        const payload = {
          type: "program",
          title: program.title.trim(),
          content: program.description.trim(),
          order: index + 1,
          isActive: true,
        }

        if (program.id.startsWith("temp_")) {
          requests.push(
            fetch("/api/content", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          )
        } else {
          requests.push(
            fetch(`/api/content/${program.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          )
        }
      }

      if (hero.heading.trim() && hero.subtext.trim()) {
        const payload = {
          type: "hero",
          title: hero.heading.trim(),
          subtitle: hero.subtitle.trim(),
          content: hero.subtext.trim(),
          order: 1,
          isActive: true,
        }

        if (hero.id && !hero.id.startsWith("temp_")) {
          requests.push(
            fetch(`/api/content/${hero.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          )
        } else {
          requests.push(
            fetch("/api/content", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          )
        }
      }

      const results = await Promise.all(requests)
      const failed = results.find((result) => !result.ok)
      if (failed) {
        throw new Error("Failed to save content")
      }

      await loadContent()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setError("Failed to save changes. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const addFaq = () => {
    setFaqs([
      ...faqs,
      { id: makeTempId(), question: "", answer: "" },
    ])
  }

  const removeFaq = (id: string) => {
    if (!id.startsWith("temp_")) {
      setDeletedFaqIds((prev) => [...prev, id])
    }
    setFaqs(faqs.filter((f) => f.id !== id))
  }

  const updateFaq = (
    id: string,
    field: "question" | "answer",
    value: string
  ) => {
    setFaqs(faqs.map((f) => (f.id === id ? { ...f, [field]: value } : f)))
  }

  const addProgram = () => {
    setPrograms([
      ...programs,
      { id: makeTempId(), title: "", description: "" },
    ])
  }

  const removeProgram = (id: string) => {
    if (!id.startsWith("temp_")) {
      setDeletedProgramIds((prev) => [...prev, id])
    }
    setPrograms(programs.filter((p) => p.id !== id))
  }

  const updateProgram = (
    id: string,
    field: "title" | "description",
    value: string
  ) => {
    setPrograms(
      programs.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Content Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Edit the content of public-facing pages
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2" disabled={loading || saving}>
          <Save className="size-4" />
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">Loading content...</CardContent>
        </Card>
      ) : null}

      <Tabs defaultValue="faqs" className={loading ? "pointer-events-none opacity-70" : ""}>
        <TabsList>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
        </TabsList>

        {/* FAQs Tab */}
        <TabsContent value="faqs" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>
                    Manage FAQ items shown on the Contact page
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={addFaq} className="gap-1">
                  <Plus className="size-3" />
                  Add FAQ
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {faqs.map((faq, index) => (
                <div
                  key={faq.id}
                  className="flex gap-3 rounded-lg border border-border p-4"
                >
                  <GripVertical className="mt-2 size-4 shrink-0 text-muted-foreground/40 cursor-grab" />
                  <div className="flex flex-1 flex-col gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Question {index + 1}
                      </Label>
                      <Input
                        value={faq.question}
                        onChange={(e) =>
                          updateFaq(faq.id, "question", e.target.value)
                        }
                        placeholder="Enter the question"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Answer
                      </Label>
                      <Textarea
                        value={faq.answer}
                        onChange={(e) =>
                          updateFaq(faq.id, "answer", e.target.value)
                        }
                        placeholder="Enter the answer"
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFaq(faq.id)}
                    className="mt-2 size-8 shrink-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    <span className="sr-only">Remove FAQ</span>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Programs Tab */}
        <TabsContent value="programs" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Programs</CardTitle>
                  <CardDescription>
                    Manage programs on the {"\""}What We Do{"\""} page
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={addProgram} className="gap-1">
                  <Plus className="size-3" />
                  Add Program
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {programs.map((prog, index) => (
                <div
                  key={prog.id}
                  className="flex gap-3 rounded-lg border border-border p-4"
                >
                  <GripVertical className="mt-2 size-4 shrink-0 text-muted-foreground/40 cursor-grab" />
                  <div className="flex flex-1 flex-col gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Program {index + 1} Title
                      </Label>
                      <Input
                        value={prog.title}
                        onChange={(e) =>
                          updateProgram(prog.id, "title", e.target.value)
                        }
                        placeholder="Program title"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Description
                      </Label>
                      <Textarea
                        value={prog.description}
                        onChange={(e) =>
                          updateProgram(prog.id, "description", e.target.value)
                        }
                        placeholder="Program description"
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeProgram(prog.id)}
                    className="mt-2 size-8 shrink-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    <span className="sr-only">Remove program</span>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hero Section Tab */}
        <TabsContent value="hero" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>
                Edit the main hero section on the homepage
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <Label>Heading</Label>
                <Input
                  value={hero.heading}
                  onChange={(event) =>
                    setHero((current) => ({ ...current, heading: event.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input
                  value={hero.subtitle}
                  onChange={(event) =>
                    setHero((current) => ({ ...current, subtitle: event.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Subtext</Label>
                <Textarea
                  value={hero.subtext}
                  onChange={(event) =>
                    setHero((current) => ({ ...current, subtext: event.target.value }))
                  }
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
