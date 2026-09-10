"use client";

import { useRef, useState } from "react";
import useSWR from "swr";
import { CSRProjectCard } from "@/components/csr/csr-project-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lightbulb, Send } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type CSRProject = {
  _id: string;
  title: string;
  description: string;
  category: "Health" | "Education" | "Empowerment" | "Environment";
  goalAmount: number;
  raisedAmount: number;
  coverImageUrl?: string;
  status: "Open" | "Funded" | "Closed";
};

export default function AdoptProjectPage() {
  const { data, isLoading, mutate } = useSWR(
    "/api/csr-projects?status=Open&limit=100",
    fetcher,
    { refreshInterval: 5000 }
  );

  const { data: publicSettings } = useSWR("/api/public/settings", fetcher);
  const csrEnabled = publicSettings?.csrProjectsEnabled !== false;

  const projects = (data?.projects || []) as CSRProject[];
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const pledgeSelectRef = useRef<HTMLSelectElement | null>(null);
  const pledgeSectionRef = useRef<HTMLElement | null>(null);
  const [form, setForm] = useState({
    companyName: "",
    amount: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    notes: "",
  });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Suggestion form state
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestionForm, setSuggestionForm] = useState({
    projectName: "",
    category: "" as "" | "Health" | "Education" | "Empowerment" | "Environment",
    description: "",
    location: "",
    estimatedBudget: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    companyName: "",
  });
  const [suggestionMessage, setSuggestionMessage] = useState("");
  const [suggestionSubmitting, setSuggestionSubmitting] = useState(false);

  const handleAdoptClick = (projectId: string) => {
    setSelectedProjectId(projectId);

    requestAnimationFrame(() => {
      pledgeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      pledgeSelectRef.current?.focus();
    });
  };

  const submitPledge = async () => {
    if (!selectedProjectId) return;
    setSubmitting(true);
    setMessage("");

    const response = await fetch("/api/csr-pledges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: selectedProjectId,
        companyName: form.companyName,
        amount: Number(form.amount),
        contactName: form.contactName,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        notes: form.notes,
        status: "pledged",
      }),
    });

    setSubmitting(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setMessage(payload?.error || "Unable to submit pledge. Please review details and try again.");
      return;
    }

    setMessage("Pledge submitted successfully and is pending admin confirmation.");
    setForm({
      companyName: "",
      amount: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      notes: "",
    });
    await mutate();
  };

  const submitSuggestion = async () => {
    if (!suggestionForm.projectName || !suggestionForm.category || !suggestionForm.description || !suggestionForm.contactName || !suggestionForm.contactEmail) return;
    setSuggestionSubmitting(true);
    setSuggestionMessage("");

    const response = await fetch("/api/csr-suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...suggestionForm,
        estimatedBudget: suggestionForm.estimatedBudget ? Number(suggestionForm.estimatedBudget) : undefined,
      }),
    });

    setSuggestionSubmitting(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setSuggestionMessage(payload?.error || "Unable to submit suggestion. Please try again.");
      return;
    }

    setSuggestionMessage("Thank you! Your project suggestion has been submitted. Our team will review it and get back to you.");
    setSuggestionForm({
      projectName: "",
      category: "",
      description: "",
      location: "",
      estimatedBudget: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      companyName: "",
    });
  };

  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">CSR Projects</h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Explore open CSR projects for corporate partnership, or suggest your own initiative. We review all proposals and work together to create lasting impact.
          </p>
        </div>

        {!csrEnabled ? (
          <div className="mx-auto mt-10 max-w-xl rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="text-xl font-semibold text-foreground">
              CSR projects are currently unavailable
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The trust has temporarily hidden this section. Please check back
              later or contact us directly for CSR partnership inquiries.
            </p>
          </div>
        ) : (
          <>
            {isLoading ? (
              <p className="mt-10 text-center text-muted-foreground">Loading projects...</p>
            ) : projects.length > 0 ? (
              <>
                <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {projects.map((project) => (
                    <CSRProjectCard key={project._id} project={project} onPledge={handleAdoptClick} />
                  ))}
                </div>

                <section ref={pledgeSectionRef} id="corporate-pledge" className="mt-12">
                  <Card>
                    <CardHeader>
                      <CardTitle>Corporate Pledge</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <Label>Select Project</Label>
                        <select
                          ref={pledgeSelectRef}
                          className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                          value={selectedProjectId}
                          onChange={(e) => setSelectedProjectId(e.target.value)}
                        >
                          <option value="">Choose an open project</option>
                          {projects.map((project) => (
                            <option key={project._id} value={project._id}>
                              {project.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label>Company Name</Label>
                        <Input value={form.companyName} onChange={(e) => setForm((s) => ({ ...s, companyName: e.target.value }))} />
                      </div>
                      <div>
                        <Label>Pledge Amount (INR)</Label>
                        <Input type="number" min={1} value={form.amount} onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))} />
                      </div>
                      <div>
                        <Label>Contact Name</Label>
                        <Input value={form.contactName} onChange={(e) => setForm((s) => ({ ...s, contactName: e.target.value }))} />
                      </div>
                      <div>
                        <Label>Contact Email</Label>
                        <Input type="email" value={form.contactEmail} onChange={(e) => setForm((s) => ({ ...s, contactEmail: e.target.value }))} />
                      </div>
                      <div>
                        <Label>Contact Phone</Label>
                        <Input value={form.contactPhone} onChange={(e) => setForm((s) => ({ ...s, contactPhone: e.target.value }))} />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Notes</Label>
                        <Input value={form.notes} onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))} />
                      </div>

                      <div className="md:col-span-2">
                        <Button onClick={submitPledge} disabled={submitting || !selectedProjectId || !form.companyName || !form.amount}>
                          {submitting ? "Submitting..." : "Submit Pledge"}
                        </Button>
                        {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </>
            ) : (
              <div className="mx-auto mt-10 max-w-xl rounded-xl border border-border bg-card p-8 text-center">
                <h2 className="text-xl font-semibold text-foreground">
                  No open projects at the moment
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  We currently don&apos;t have any open CSR projects. However, you can suggest
                  your own initiative below and we&apos;ll review it.
                </p>
              </div>
            )}
          </>
        )}

        {/* Suggest a CSR Project Section */}
        <div className="mt-16">
          <div className="text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary/10 text-secondary">
              <Lightbulb className="size-7" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
              Have a Project in Mind?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Don&apos;t see a project that fits your vision? Suggest your own CSR initiative.
              We review all proposals and collaborate to bring impactful projects to life.
            </p>
            {!showSuggestion && (
              <Button
                onClick={() => setShowSuggestion(true)}
                className="mt-6"
                size="lg"
              >
                Suggest a CSR Project
              </Button>
            )}
          </div>

          {showSuggestion && (
            <Card className="mt-8 mx-auto max-w-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="size-5 text-secondary" />
                  Suggest a CSR Project
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Fill in the details below. Our team will review your proposal and get back to you.
                </p>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="projectName">Project Name *</Label>
                  <Input
                    id="projectName"
                    placeholder="e.g., Digital Literacy Program for Rural Schools"
                    value={suggestionForm.projectName}
                    onChange={(e) => setSuggestionForm((s) => ({ ...s, projectName: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={suggestionForm.category}
                    onChange={(e) => setSuggestionForm((s) => ({ ...s, category: e.target.value as typeof s.category }))}
                  >
                    <option value="">Select category</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                    <option value="Empowerment">Empowerment</option>
                    <option value="Environment">Environment</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="location">Target Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Sirsi, Karnataka"
                    value={suggestionForm.location}
                    onChange={(e) => setSuggestionForm((s) => ({ ...s, location: e.target.value }))}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Project Description *</Label>
                  <textarea
                    id="description"
                    rows={4}
                    placeholder="Describe the project idea, target beneficiaries, expected outcomes, and how it aligns with CSR objectives..."
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={suggestionForm.description}
                    onChange={(e) => setSuggestionForm((s) => ({ ...s, description: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="estimatedBudget">Estimated Budget (INR)</Label>
                  <Input
                    id="estimatedBudget"
                    type="number"
                    min={0}
                    placeholder="e.g., 500000"
                    value={suggestionForm.estimatedBudget}
                    onChange={(e) => setSuggestionForm((s) => ({ ...s, estimatedBudget: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="companyName">Company Name (Optional)</Label>
                  <Input
                    id="companyName"
                    placeholder="Your organization name"
                    value={suggestionForm.companyName}
                    onChange={(e) => setSuggestionForm((s) => ({ ...s, companyName: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="sugContactName">Contact Name *</Label>
                  <Input
                    id="sugContactName"
                    placeholder="Your full name"
                    value={suggestionForm.contactName}
                    onChange={(e) => setSuggestionForm((s) => ({ ...s, contactName: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="sugContactEmail">Contact Email *</Label>
                  <Input
                    id="sugContactEmail"
                    type="email"
                    placeholder="you@company.com"
                    value={suggestionForm.contactEmail}
                    onChange={(e) => setSuggestionForm((s) => ({ ...s, contactEmail: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="sugContactPhone">Contact Phone</Label>
                  <Input
                    id="sugContactPhone"
                    placeholder="+91 98765 43210"
                    value={suggestionForm.contactPhone}
                    onChange={(e) => setSuggestionForm((s) => ({ ...s, contactPhone: e.target.value }))}
                  />
                </div>

                <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button
                    onClick={submitSuggestion}
                    disabled={suggestionSubmitting || !suggestionForm.projectName || !suggestionForm.category || !suggestionForm.description || !suggestionForm.contactName || !suggestionForm.contactEmail}
                    className="flex items-center gap-2"
                  >
                    {suggestionSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="size-4" />
                        Submit Suggestion
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowSuggestion(false)}
                  >
                    Cancel
                  </Button>
                </div>

                {suggestionMessage && (
                  <div className="md:col-span-2">
                    <p className={`text-sm ${suggestionMessage.startsWith("Thank") ? "text-green-600" : "text-destructive"}`}>
                      {suggestionMessage}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
