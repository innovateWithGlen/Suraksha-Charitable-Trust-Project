"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { Save, Plus, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const categories = ["Health", "Education", "Empowerment", "Environment"] as const;
const statuses = ["Open", "Funded", "Closed"] as const;

const initialForm = {
  title: "",
  description: "",
  category: "Health",
  goalAmount: "",
  coverImageUrl: "",
  status: "Open",
};

export default function AdminCSRPage() {
  const { data, isLoading, mutate } = useSWR("/api/csr-projects?limit=100", fetcher, {
    refreshInterval: 8000,
  });
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [saving, setSaving] = useState(false);

  const projects = data?.projects || [];

  const financial = useMemo(() => {
    const totalBudget = projects.reduce((sum: number, p: any) => sum + (p.goalAmount || 0), 0);
    const utilizedFunds = projects.reduce((sum: number, p: any) => sum + (p.raisedAmount || 0), 0);
    const remainingFunds = Math.max(totalBudget - utilizedFunds, 0);
    return { totalBudget, utilizedFunds, remainingFunds };
  }, [projects]);

  const submit = async () => {
    if (!form.title || !form.description || !form.goalAmount) return;
    setSaving(true);

    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      goalAmount: Number(form.goalAmount),
      coverImageUrl: form.coverImageUrl,
      status: form.status,
    };

    const response = await fetch(editingId ? `/api/csr-projects/${editingId}` : "/api/csr-projects", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (!response.ok) return;

    setForm(initialForm);
    setEditingId("");
    mutate();
  };

  const closeProject = async (id: string) => {
    const response = await fetch(`/api/csr-projects/${id}`, { method: "DELETE" });
    if (!response.ok) return;
    mutate();
  };

  const startEdit = (project: any) => {
    setEditingId(project._id);
    setForm({
      title: project.title,
      description: project.description,
      category: project.category,
      goalAmount: String(project.goalAmount || 0),
      coverImageUrl: project.coverImageUrl || "",
      status: project.status,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">CSR Project Management</h1>
        <p className="text-sm text-muted-foreground">Add, edit, and close CSR project openings for FY 2025-26.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Total Budget</p><p className="text-2xl font-bold">₹{financial.totalBudget.toLocaleString("en-IN")}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Utilized Funds</p><p className="text-2xl font-bold">₹{financial.utilizedFunds.toLocaleString("en-IN")}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Remaining Funds</p><p className="text-2xl font-bold">₹{financial.remainingFunds.toLocaleString("en-IN")}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit CSR Project" : "Add New CSR Project"}</CardTitle>
          <CardDescription>title, description, category, goalAmount, coverImageUrl, status</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <Label>Description</Label>
            <Textarea rows={3} value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
          </div>
          <div>
            <Label>Category</Label>
            <select className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.category} onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}>
              {categories.map((category) => (<option key={category} value={category}>{category}</option>))}
            </select>
          </div>
          <div>
            <Label>Goal Amount</Label>
            <Input type="number" min={1} value={form.goalAmount} onChange={(e) => setForm((s) => ({ ...s, goalAmount: e.target.value }))} />
          </div>
          <div>
            <Label>Cover Image URL</Label>
            <Input value={form.coverImageUrl} onChange={(e) => setForm((s) => ({ ...s, coverImageUrl: e.target.value }))} />
          </div>
          <div>
            <Label>Status</Label>
            <select className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}>
              {statuses.map((status) => (<option key={status} value={status}>{status}</option>))}
            </select>
          </div>

          <div className="md:col-span-2 flex gap-3">
            <Button onClick={submit} disabled={saving}><Save className="mr-2 size-4" />{editingId ? "Update Project" : "Create Project"}</Button>
            {editingId ? (
              <Button variant="outline" onClick={() => { setEditingId(""); setForm(initialForm); }}><XCircle className="mr-2 size-4" />Cancel Edit</Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current CSR Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p className="text-sm text-muted-foreground">Loading projects...</p> : null}
          {projects.map((project: any) => (
            <div key={project._id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{project.title}</p>
                  <p className="text-sm text-muted-foreground">{project.category} • Goal ₹{project.goalAmount.toLocaleString("en-IN")} • Raised ₹{(project.raisedAmount || 0).toLocaleString("en-IN")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{project.status}</Badge>
                  <Button size="sm" variant="outline" onClick={() => startEdit(project)}>Edit</Button>
                  {project.status !== "Closed" ? (
                    <Button size="sm" variant="destructive" onClick={() => closeProject(project._id)}>Close</Button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
