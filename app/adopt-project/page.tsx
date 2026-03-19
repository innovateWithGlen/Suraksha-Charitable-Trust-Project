"use client";

import { useRef, useState } from "react";
import useSWR from "swr";
import { CSRProjectCard } from "@/components/csr/csr-project-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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

  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Adopt a Project</h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Explore currently open CSR projects and pledge your corporate support.
          </p>
        </div>

        {isLoading ? (
          <p className="mt-10 text-center text-muted-foreground">Loading projects...</p>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <CSRProjectCard key={project._id} project={project} onPledge={handleAdoptClick} />
            ))}
          </div>
        )}

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
      </div>
    </section>
  );
}
