"use client"

import { useState } from "react"
import useSWR from "swr"
import { Search, Mail, Phone } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DonorsPage() {
  const [search, setSearch] = useState("")
  const { data, isLoading } = useSWR(`/api/donors?limit=100&search=${encodeURIComponent(search)}`, fetcher, {
    refreshInterval: 5000,
  })

  const donors = data?.donors || []
  const activeCount = donors.filter((d: any) => d.status === "active").length
  const topDonor = donors.reduce((max: any, d: any) => (d.totalDonated > (max?.totalDonated || 0) ? d : max), null)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Donors</h1>
        <p className="text-sm text-muted-foreground">Directory of donors with their transaction history</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="pt-6"><p className="text-xs font-medium text-muted-foreground">Total Donors</p><p className="mt-1 text-2xl font-bold text-foreground">{donors.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs font-medium text-muted-foreground">Active Donors</p><p className="mt-1 text-2xl font-bold text-foreground">{activeCount}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs font-medium text-muted-foreground">Top Donor</p><p className="mt-1 text-lg font-bold text-foreground">{topDonor?.name || "—"}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Donors</CardTitle>
              <CardDescription>{donors.length} donor(s)</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Search donors..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-56 pl-9 h-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Total Donated</TableHead>
                <TableHead>Donations</TableHead>
                <TableHead>Last Donation</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow>
              ) : donors.length === 0 ? (
                <TableRow><TableCell colSpan={6}>No donors found</TableCell></TableRow>
              ) : (
                donors.map((d: any) => (
                  <TableRow key={d._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="bg-secondary/10 text-secondary text-xs">
                            {d.name?.split(" ").map((n: string) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{d.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Mail className="size-3" /> {d.email}</span>
                        <span className="flex items-center gap-1"><Phone className="size-3" /> {d.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">₹ {Number(d.totalDonated || 0).toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-sm">{d.donationCount || 0}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {d.lastDonationDate ? new Date(d.lastDonationDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={d.status === "active" ? "border-green-200 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-gray-500"}>
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
