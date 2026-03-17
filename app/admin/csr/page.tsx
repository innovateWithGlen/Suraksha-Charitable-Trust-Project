"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import { Save, XCircle, CheckCircle, Ban, ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function getApiErrorMessage(payload: any, fallback: string) {
  if (typeof payload?.error === "string" && payload.error.trim()) {
    if (Array.isArray(payload?.details) && payload.details.length > 0) {
      const firstDetail = payload.details[0];
      const field = Array.isArray(firstDetail?.path) ? firstDetail.path.join(".") : undefined;
      const message = typeof firstDetail?.message === "string" ? firstDetail.message : undefined;
      if (field && message) {
        return `${field}: ${message}`;
      }
      if (message) {
        return message;
      }
    }

    return payload.error;
  }

  return fallback;
}

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

const sectionOptions = {
  project: "Add New CSR Project",
  expense: "Log Expense",
  pledges: "CSR Pledge Requests",
} as const;

type SectionKey = keyof typeof sectionOptions;

export default function AdminCSRPage() {
  const { data, isLoading, mutate } = useSWR("/api/csr-projects?limit=100", fetcher, {
    refreshInterval: 8000,
  });
  const { data: dashboardData } = useSWR("/api/csr-dashboard", fetcher, {
    refreshInterval: 8000,
  });
  const { data: pledgesData, mutate: mutatePledges } = useSWR(
    "/api/csr-pledges?limit=100&sort=createdAt&order=desc",
    fetcher,
    { refreshInterval: 8000 }
  );
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [saving, setSaving] = useState(false);
  const [projectFeedback, setProjectFeedback] = useState("");
  const [expenseFeedback, setExpenseFeedback] = useState("");
  const [listFeedback, setListFeedback] = useState("");
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [activeSection, setActiveSection] = useState<SectionKey>("project");
  const [expenseForm, setExpenseForm] = useState({
    projectId: "",
    amountPaid: "",
    details: "",
    date: new Date().toISOString().slice(0, 10),
    billDocument: null as File | null,
  });

  const projects = data?.projects || [];

  useEffect(() => {
    if (!expenseForm.projectId && projects.length > 0) {
      setExpenseForm((prev) => ({ ...prev, projectId: projects[0]._id }));
    }
  }, [projects, expenseForm.projectId]);

  const financial = useMemo(() => {
    const totalBudget = Number(dashboardData?.totalCSRFund || 0);
    const utilizedFunds = Number(dashboardData?.utilizedFunds || 0);
    const remainingFunds = Math.max(totalBudget - utilizedFunds, 0);
    return { totalBudget, utilizedFunds, remainingFunds };
  }, [dashboardData]);

  const submitExpense = async () => {
    if (!expenseForm.projectId || !expenseForm.amountPaid || !expenseForm.details || !expenseForm.billDocument) {
      setExpenseFeedback("Expense form requires project, amount, details, and bill document.");
      return;
    }

    if (Number(expenseForm.amountPaid) <= 0) {
      setExpenseFeedback("Amount paid must be greater than 0.");
      return;
    }

    setExpenseSubmitting(true);
    setExpenseFeedback("");

    const payload = new FormData();
    payload.append("amountPaid", expenseForm.amountPaid);
    payload.append("details", expenseForm.details);
    payload.append("date", expenseForm.date);
    payload.append("billDocument", expenseForm.billDocument);

    const response = await fetch(`/api/csr-projects/${expenseForm.projectId}/expenses`, {
      method: "POST",
      body: payload,
    });

    setExpenseSubmitting(false);

    if (!response.ok) {
      const resBody = await response.json().catch(() => ({}));
      setExpenseFeedback(getApiErrorMessage(resBody, "Failed to save expense."));
      return;
    }

    setExpenseForm((prev) => ({
      ...prev,
      amountPaid: "",
      details: "",
      billDocument: null,
      date: new Date().toISOString().slice(0, 10),
    }));

    setExpenseFeedback("Expense logged successfully.");
    await Promise.all([
      mutate(),
      globalMutate("/api/csr-dashboard"),
    ]);
  };

  const submit = async () => {
    if (!form.title || !form.description || !form.goalAmount) {
      setProjectFeedback("Title, description, and goal amount are required.");
      return;
    }
    if (Number(form.goalAmount) <= 0) {
      setProjectFeedback("Goal amount must be greater than 0.");
      return;
    }

    setProjectFeedback("");
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
    if (!response.ok) {
      const responseBody = await response.json().catch(() => ({}));
      setProjectFeedback(getApiErrorMessage(responseBody, "Failed to save CSR project."));
      return;
    }

    setForm(initialForm);
    setEditingId("");
    setProjectFeedback(editingId ? "CSR project updated successfully." : "CSR project created successfully.");
    await Promise.all([
      mutate(),
      globalMutate("/api/csr-projects?status=Open&limit=100"),
    ]);
  };

  const deleteProject = async (project: any) => {
    const confirmed = window.confirm(`Delete "${project.title}"? This only works if the project has no linked expenses or pledges.`);
    if (!confirmed) {
      return;
    }

    setDeletingId(project._id);
    setListFeedback("");

    const response = await fetch(`/api/csr-projects/${project._id}`, { method: "DELETE" });
    const responseBody = await response.json().catch(() => ({}));

    setDeletingId("");

    if (!response.ok) {
      setListFeedback(getApiErrorMessage(responseBody, "Failed to delete CSR project."));
      return;
    }

    if (editingId === project._id) {
      setEditingId("");
      setForm(initialForm);
    }

    if (expenseForm.projectId === project._id) {
      setExpenseForm((prev) => ({ ...prev, projectId: "" }));
    }

    setListFeedback("CSR project deleted successfully.");
    await Promise.all([
      mutate(),
      globalMutate("/api/csr-dashboard"),
      globalMutate("/api/csr-projects?status=Open&limit=100"),
    ]);
  };

  const updatePledgeStatus = async (pledgeId: string, status: "confirmed" | "cancelled") => {
    const response = await fetch(`/api/csr-pledges/${pledgeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) return;
    await Promise.all([
      mutatePledges(),
      mutate(),
      globalMutate("/api/csr-dashboard"),
    ]);
  };

  const pledges = pledgesData?.pledges || [];

  const startEdit = (project: any) => {
    setActiveSection("project");
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
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>CSR Management Sections</CardTitle>
            <CardDescription>Select a section to manage CSR projects, expenses, or pledge requests.</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="justify-between sm:w-[240px]">
                {sectionOptions[activeSection]}
                <ChevronDown className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px]">
              {(Object.entries(sectionOptions) as [SectionKey, string][]).map(([key, label]) => (
                <DropdownMenuItem key={key} onClick={() => setActiveSection(key)}>
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
      </Card>

      {activeSection === "project" ? (
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

            {projectFeedback ? <p className="md:col-span-2 text-sm text-muted-foreground">{projectFeedback}</p> : null}
          </CardContent>
        </Card>
      ) : null}

      {activeSection === "expense" ? (
        <Card>
          <CardHeader>
            <CardTitle>Log Expense</CardTitle>
            <CardDescription>Record project expenses and upload scanned bill documents.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Project</Label>
              <select
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={expenseForm.projectId}
                onChange={(e) => setExpenseForm((s) => ({ ...s, projectId: e.target.value }))}
              >
                <option value="">Select project</option>
                {projects.map((project: any) => (
                  <option key={project._id} value={project._id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Amount Paid</Label>
              <Input
                type="number"
                min={1}
                value={expenseForm.amountPaid}
                onChange={(e) => setExpenseForm((s) => ({ ...s, amountPaid: e.target.value }))}
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm((s) => ({ ...s, date: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Details</Label>
              <Textarea
                rows={2}
                value={expenseForm.details}
                onChange={(e) => setExpenseForm((s) => ({ ...s, details: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Bill Document (PDF/Image)</Label>
              <Input
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) =>
                  setExpenseForm((s) => ({ ...s, billDocument: e.target.files?.[0] || null }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <Button onClick={submitExpense} disabled={expenseSubmitting}>
                {expenseSubmitting ? "Uploading..." : "Save Expense"}
              </Button>
            </div>
            {expenseFeedback ? <p className="md:col-span-2 text-sm text-muted-foreground">{expenseFeedback}</p> : null}
          </CardContent>
        </Card>
      ) : null}

      {activeSection === "pledges" ? (
        <Card>
          <CardHeader>
            <CardTitle>CSR Pledge Requests</CardTitle>
            <CardDescription>Review and approve incoming pledge commitments from corporate sponsors.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pledges.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pledges yet.</p>
            ) : null}
            {pledges.map((pledge: any) => {
              const project = pledge.projectId;
              const isPending = pledge.status === "pledged";
              const statusColor =
                pledge.status === "confirmed"
                  ? "bg-green-100 text-green-700 hover:bg-green-100"
                  : pledge.status === "cancelled"
                  ? "bg-red-100 text-red-700 hover:bg-red-100"
                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
              return (
                <div key={pledge._id} className="rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">{pledge.companyName}</p>
                      <p className="text-sm text-muted-foreground">
                        ₹{Number(pledge.amount).toLocaleString("en-IN")} •{" "}
                        {typeof project === "object" ? project?.title : project}
                      </p>
                      {pledge.contactEmail || pledge.contactPhone ? (
                        <p className="text-xs text-muted-foreground">
                          {pledge.contactEmail}{pledge.contactEmail && pledge.contactPhone ? " • " : ""}{pledge.contactPhone}
                        </p>
                      ) : null}
                      {pledge.notes ? (
                        <p className="text-xs text-muted-foreground italic">{pledge.notes}</p>
                      ) : null}
                      <p className="text-xs text-muted-foreground">
                        {new Date(pledge.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColor}>
                        {pledge.status.charAt(0).toUpperCase() + pledge.status.slice(1)}
                      </Badge>
                      {isPending ? (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => updatePledgeStatus(pledge._id, "confirmed")}
                          >
                            <CheckCircle className="mr-1 size-3.5" />Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updatePledgeStatus(pledge._id, "cancelled")}
                          >
                            <Ban className="mr-1 size-3.5" />Cancel
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Current CSR Projects</CardTitle>
          <CardDescription>Review active projects and manage them from the action buttons.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p className="text-sm text-muted-foreground">Loading projects...</p> : null}
          {listFeedback ? <p className="text-sm text-muted-foreground">{listFeedback}</p> : null}
          {projects.map((project: any) => (
            <div key={project._id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{project.title}</p>
                  <p className="text-sm text-muted-foreground">{project.category} • Goal ₹{project.goalAmount.toLocaleString("en-IN")} • Raised ₹{(project.raisedAmount || 0).toLocaleString("en-IN")} • Utilized ₹{(project.utilizedAmount || 0).toLocaleString("en-IN")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{project.status}</Badge>
                  <Button size="sm" variant="outline" onClick={() => startEdit(project)}>Edit</Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteProject(project)}
                    disabled={deletingId === project._id}
                  >
                    <Trash2 className="mr-1 size-3.5" />
                    {deletingId === project._id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
