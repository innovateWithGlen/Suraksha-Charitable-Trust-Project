"use client";

import { useEffect, useState } from "react";
import { CSRProjectCard } from "@/components/csr/csr-project-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
  const [projects, setProjects] = useState<CSRProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [form, setForm] = useState({
    companyName: "",
    amount: "",
    contactName: "",
    contactEmail: "",
    notes: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch("/api/csr-projects?status=Open&limit=100");
        if (!response.ok) return;
        const data = await response.json();
        setProjects(data.projects || []);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const submitPledge = async () => {
    if (!selectedProjectId) return;

    const response = await fetch("/api/csr-pledges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: selectedProjectId,
        companyName: form.companyName,
        amount: Number(form.amount),
        contactName: form.contactName,
        contactEmail: form.contactEmail,
        notes: form.notes,
        status: "pledged",
      }),
    });

    if (!response.ok) {
      setMessage("Unable to submit pledge. Please review details and try again.");
      return;
    }

    setMessage("Pledge submitted successfully. Our CSR team will contact you soon.");
    setForm({ companyName: "", amount: "", contactName: "", contactEmail: "", notes: "" });
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

        {loading ? (
          <p className="mt-10 text-center text-muted-foreground">Loading projects...</p>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <CSRProjectCard key={project._id} project={project} onPledge={setSelectedProjectId} />
            ))}
          </div>
        )}

        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Corporate Pledge</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Select Project</Label>
              <select
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
            <div className="md:col-span-2">
              <Label>Notes</Label>
              <Input value={form.notes} onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))} />
            </div>

            <div className="md:col-span-2">
              <Button onClick={submitPledge} disabled={!selectedProjectId || !form.companyName || !form.amount}>
                Submit Pledge
              </Button>
              {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
