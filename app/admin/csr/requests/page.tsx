"use client";

import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function CSRRequestsPage() {
  const { data, isLoading, mutate } = useSWR("/api/donations?requires80G=true&limit=100", fetcher, {
    refreshInterval: 10000,
  });

  const requests = data?.donations || [];

  const markIssued = async (donation: any) => {
    const notes = donation.notes
      ? `${donation.notes} | 80G certificate issued`
      : "80G certificate issued";

    const response = await fetch(`/api/donations/${donation._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) return;
    mutate();
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">80G Requests</h1>
        <p className="text-sm text-muted-foreground">Review and manage 80G tax certificate requests from donors.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Requested Certificates</CardTitle>
          <CardDescription>Only donations marked with 80G request are shown.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p className="text-sm text-muted-foreground">Loading requests...</p> : null}
          {!isLoading && requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending requests.</p>
          ) : null}

          {requests.map((donation: any) => {
            const issued = String(donation.notes || "").toLowerCase().includes("80g certificate issued");

            return (
              <div key={donation._id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{donation.donorName}</p>
                    <p className="text-sm text-muted-foreground">{donation.donorEmail} • ₹{donation.amount.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-muted-foreground">Txn: {donation.transactionId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={issued ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                      {issued ? "Issued" : "Pending"}
                    </Badge>
                    {!issued ? (
                      <Button size="sm" onClick={() => markIssued(donation)}>
                        Mark Issued
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
