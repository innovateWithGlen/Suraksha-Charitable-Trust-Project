"use client"

import { useMemo, useState } from "react"
import useSWR, { mutate } from "swr"
import { Download, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DonationsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const query = useMemo(() => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (statusFilter !== "all") params.set("status", statusFilter)
    params.set("limit", "100")
    return `/api/donations?${params.toString()}`
  }, [search, statusFilter])

  const { data, isLoading } = useSWR(query, fetcher, { refreshInterval: 5000 })
  const donations = data?.donations || []

  const exportCsv = () => {
    const rows = [
      ["Transaction ID", "Donor", "Email", "Amount", "Method", "Status", "Date"],
      ...donations.map((d: any) => [
        d.transactionId,
        d.donorName,
        d.donorEmail,
        d.amount,
        d.method,
        d.status,
        new Date(d.createdAt).toISOString(),
      ]),
    ]

    const csv = rows
      .map((row) =>
        row
          .map((cell: string | number) => `"${String(cell).replaceAll("\"", "\"\"")}"`)
          .join(",")
      )
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `donations-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Donations</h1>
          <p className="text-sm text-muted-foreground">Manage and track all received donations</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={exportCsv}>
          <Download className="size-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>{donations.length} donations found</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input placeholder="Search donor or ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-48 pl-9 h-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 h-9">
                  <Filter className="mr-2 size-3" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Donor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow>
              ) : donations.length === 0 ? (
                <TableRow><TableCell colSpan={6}>No donations found</TableCell></TableRow>
              ) : (
                donations.map((d: any) => (
                  <TableRow key={d._id}>
                    <TableCell className="font-mono text-xs">{d.transactionId}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{d.donorName}</p>
                        <p className="text-xs text-muted-foreground">{d.donorEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">₹ {d.amount.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{d.method}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(d.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={d.status === "completed" ? "default" : d.status === "pending" ? "secondary" : "destructive"}
                        className={d.status === "completed" ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                        {d.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
