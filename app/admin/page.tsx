"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import {
  IndianRupee,
  Users,
  TrendingUp,
  ArrowUpRight,
  Heart,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminDashboard() {
  const [range, setRange] = useState<"1M" | "3M" | "6M" | "1Y" | "3Y" | "MAX">("1Y")

  const query = useMemo(() => `/api/dashboard?range=${range}`, [range])

  const { data, isLoading, error } = useSWR(query, fetcher, {
    refreshInterval: 5000,
  })

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive">Failed to load dashboard data</p>
        <p className="text-sm text-muted-foreground">Please check your database connection and try again.</p>
      </div>
    )
  }

  const metrics = data?.metrics
  const donationTrend = data?.donationTrend || []
  const donorGrowth = data?.donorGrowth || []
  const recentDonations = data?.recentDonations || []

  const metricCards = [
    {
      title: "Total Donations",
      value: metrics ? `₹${metrics.totalDonations.toLocaleString("en-IN")}` : "—",
      change: `${metrics?.totalDonationCount || 0} donations`,
      icon: IndianRupee,
      description: "completed",
    },
    {
      title: "Total Donors",
      value: metrics ? metrics.totalDonors.toString() : "—",
      change: `${metrics?.activeDonors || 0} active`,
      icon: Users,
      description: "",
    },
    {
      title: "Avg Donation",
      value: metrics ? `₹${metrics.avgDonation.toLocaleString("en-IN")}` : "—",
      change: "per donation",
      icon: TrendingUp,
      description: "",
    },
    {
      title: "Active Donors",
      value: metrics ? metrics.activeDonors.toString() : "—",
      change: "currently",
      icon: Heart,
      description: "active",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back. Here is a summary of your trust{"'"}s performance.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="flex items-start justify-between pt-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{metric.title}</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-24 mt-1" />
                ) : (
                  <p className="mt-1 text-2xl font-bold text-foreground">{metric.value}</p>
                )}
                <div className="mt-1 flex items-center gap-1">
                  <span className="flex items-center text-xs font-medium text-green-600">
                    <ArrowUpRight className="size-3" />
                    {metric.change}
                  </span>
                  <span className="text-xs text-muted-foreground">{metric.description}</span>
                </div>
              </div>
              <div className="flex size-10 items-center justify-center rounded-lg bg-secondary/10">
                <metric.icon className="size-5 text-secondary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="flex flex-col overflow-hidden lg:col-span-3">
          <CardHeader className="flex-none">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Donations</CardTitle>
                <CardDescription>Monthly donation volume in INR</CardDescription>
              </div>
              <ButtonGroup className="rounded-md border border-border bg-muted/30 p-1">
                {(["1M", "3M", "6M", "1Y", "3Y", "MAX"] as const).map((option) => (
                  <Button
                    key={option}
                    type="button"
                    size="sm"
                    variant={range === option ? "default" : "ghost"}
                    className="h-8 px-3 text-xs"
                    onClick={() => setRange(option)}
                  >
                    {option}
                  </Button>
                ))}
              </ButtonGroup>
            </div>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col">
            {isLoading ? (
              <Skeleton className="w-full h-[280px]" />
            ) : donationTrend.length === 0 ? (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">No donation data yet</div>
            ) : (
              <div className="relative min-h-0 w-full flex-1" style={{ minHeight: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={donationTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4A7AB5" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4A7AB5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} width={55} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Donations"]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="total" stroke="#4A7AB5" fill="url(#colorAmount)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col overflow-hidden lg:col-span-2">
          <CardHeader className="flex-none">
            <CardTitle>Donor Growth</CardTitle>
            <CardDescription>New donors per month</CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col">
            {isLoading ? (
              <Skeleton className="w-full h-[280px]" />
            ) : donorGrowth.length === 0 ? (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">No donor data yet</div>
            ) : (
              <div className="relative min-h-0 w-full flex-1" style={{ minHeight: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={donorGrowth} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} width={35} />
                    <Tooltip formatter={(value: number) => [value, "Donors"]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="count" stroke="#E8B931" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest donation transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-12 w-full" />))}
            </div>
          ) : recentDonations.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Donor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDonations.map((txn: any) => (
                  <TableRow key={txn._id}>
                    <TableCell className="font-mono text-xs">{txn.transactionId}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{txn.donorName}</p>
                        <p className="text-xs text-muted-foreground">{txn.donorEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">₹{txn.amount.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(txn.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={txn.status === "completed" || txn.status === "success" ? "default" : txn.status === "pending" ? "secondary" : "destructive"}
                        className={txn.status === "completed" || txn.status === "success" ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
                      >
                        {txn.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
