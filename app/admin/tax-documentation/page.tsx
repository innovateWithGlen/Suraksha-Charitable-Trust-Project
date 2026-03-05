"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Download, RefreshCw, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

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
                <TableRow><TableCell colSpan={8}>Loading...</TableCell></TableRow>
              ) : certificates.length === 0 ? (
                <TableRow><TableCell colSpan={8}>No tax receipts found</TableCell></TableRow>
              ) : (
                certificates.map((item: any) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-mono text-xs">{item.certificateNumber}</TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{item.donorName}</p>
                      <p className="text-xs text-muted-foreground">{item.donorEmail || "-"}</p>
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
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <a href={item.pdfUrl} target="_blank" rel="noreferrer">
                            <Download className="mr-1 size-3" />
                            Download
                          </a>
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => resend(item._id)}>
                          <RefreshCw className="mr-1 size-3" />
                          Re-send
                        </Button>
                      </div>
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
