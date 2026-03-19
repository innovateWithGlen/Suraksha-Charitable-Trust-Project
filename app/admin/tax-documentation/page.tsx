"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Download, RefreshCw, Search, ChevronDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const idTypeLabel: Record<string, string> = {
  aadhaar: "Aadhaar",
  passport: "Passport",
  voterId: "Voter ID",
};

function maskIdentity(value?: string) {
  if (!value) return "-";
  const visible = value.slice(-4);
  return `XXXX${visible}`;
}

function toAbsoluteReceiptUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

  const configuredBase = process.env.NEXT_PUBLIC_APP_URL || "";
  const base = configuredBase || window.location.origin || "";
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;

  return `${normalizedBase}${normalizedPath}`;
}

function resolveReceiptDownloadUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return "";

  if (/^https?:\/\//i.test(pathOrUrl)) {
    try {
      const parsed = new URL(pathOrUrl);
      if (parsed.pathname.startsWith("/api/certificates/")) {
        return `${window.location.origin}${parsed.pathname}${parsed.search}`;
      }
      return pathOrUrl;
    } catch {
      return pathOrUrl;
    }
  }

  return toAbsoluteReceiptUrl(pathOrUrl);
}

export default function TaxDocumentationPage() {
  const [search, setSearch] = useState("");

  const query = `/api/certificates${search ? `?search=${encodeURIComponent(search)}` : ""}`;
  const { data, isLoading } = useSWR(query, fetcher, { refreshInterval: 5000 });
  const certificates = data?.certificates || [];

  const resend = async (certificateId: string) => {
    const res = await fetch("/api/certificates/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ certificateId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Failed to resend" }));
      toast.error(err.error || "Failed to resend receipt");
      return;
    }

    toast.success("Receipt email sent");
    mutate(query);
  };

  const openManualEmail = (item: any) => {
    const receiptUrl = resolveReceiptDownloadUrl(item.pdfUrl);
    const subject = `80G Receipt ${item.certificateNumber} | Suraksha Charitable Trust`;
    const body =
      `Dear ${item.donorName},\n\nPlease find your 80G receipt below:\n${receiptUrl}\n\nRegards,\nSuraksha Charitable Trust`
    ;
    const gmailCompose = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent("glenmonteiro47@gmail.com")}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailCompose, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tax Documentation</h1>
        <p className="text-sm text-muted-foreground">View, download, and resend generated 80G donation receipts.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>80G Receipts</CardTitle>
              <CardDescription>{certificates.length} receipt(s) found</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-9 w-64 pl-9"
                placeholder="Search donor / receipt no"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt No</TableHead>
                <TableHead>Donor</TableHead>
                <TableHead>Filing ID</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>URN</TableHead>
                <TableHead>Generated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={9}>Loading...</TableCell></TableRow>
              ) : certificates.length === 0 ? (
                <TableRow><TableCell colSpan={9}>No tax receipts found</TableCell></TableRow>
              ) : (
                certificates.map((item: any) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-mono text-xs">{item.certificateNumber}</TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{item.donorName}</p>
                      <p className="text-xs text-muted-foreground">{item.donorEmail || "-"}</p>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.donorPan
                        ? `PAN: ${maskIdentity(item.donorPan)}`
                        : item.donorIdType && item.donorIdNumber
                          ? `${idTypeLabel[item.donorIdType] || item.donorIdType}: ${maskIdentity(item.donorIdNumber)}`
                          : "-"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{item.transactionId || "-"}</TableCell>
                    <TableCell>INR {item.amount.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-xs">{item.urnUsed}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(item.generatedAt).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.receiptSent ? "default" : "secondary"}>
                        {item.receiptSent ? "Sent" : "Generated"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline" className="gap-1">
                            Manage
                            <ChevronDown className="size-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onSelect={(event) => {
                              event.preventDefault();
                              const url = resolveReceiptDownloadUrl(item.pdfUrl);
                              if (!url) {
                                toast.error("No receipt available for download");
                                return;
                              }
                              window.open(url, "_blank", "noopener,noreferrer");
                            }}
                          >
                            <Download className="size-3.5" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={(event) => {
                              event.preventDefault();
                              void resend(item._id);
                            }}
                          >
                            <RefreshCw className="size-3.5" />
                            Resend
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={(event) => {
                              event.preventDefault();
                              openManualEmail(item);
                            }}
                          >
                            Manual Email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
