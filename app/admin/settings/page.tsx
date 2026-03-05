"use client"

import { useEffect, useState } from "react"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type SettingsForm = {
  orgName: string
  registrationNumber: string
  orgEmail: string
  orgPhone: string
  orgAddress: string
  workingHours: string
  razorpayKeyId: string
  razorpayKeySecret: string
  paymentTestMode: boolean
  notifyNewDonation: boolean
  notifyFailedTransactions: boolean
  notifyWeeklySummary: boolean
  notifyMonthlyReports: boolean
}

const defaultSettings: SettingsForm = {
  orgName: "Suraksha Charitable Trust",
  registrationNumber: "SCT-2015-IN-001",
  orgEmail: "SurakshaCharitableTrust@gmail.com",
  orgPhone: "+91 99999-00000",
  orgAddress: "India",
  workingHours: "Mon - Sat: 9:00 AM - 6:00 PM",
  razorpayKeyId: "",
  razorpayKeySecret: "",
  paymentTestMode: true,
  notifyNewDonation: true,
  notifyFailedTransactions: true,
  notifyWeeklySummary: false,
  notifyMonthlyReports: true,
}

const toBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback
  return value.toLowerCase() === "true"
}

export default function SettingsPage() {
  const [form, setForm] = useState<SettingsForm>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/settings")
      if (!response.ok) {
        throw new Error("Failed to load settings")
      }

      const data = await response.json()
      const grouped = data.grouped || {}
      const general = grouped.general || {}
      const payment = grouped.payment || {}
      const notification = grouped.notification || {}

      setForm({
        orgName: general.orgName || defaultSettings.orgName,
        registrationNumber:
          general.registrationNumber || defaultSettings.registrationNumber,
        orgEmail: general.orgEmail || defaultSettings.orgEmail,
        orgPhone: general.orgPhone || defaultSettings.orgPhone,
        orgAddress: general.orgAddress || defaultSettings.orgAddress,
        workingHours: general.workingHours || defaultSettings.workingHours,
        razorpayKeyId: payment.razorpayKeyId || defaultSettings.razorpayKeyId,
        razorpayKeySecret:
          payment.razorpayKeySecret || defaultSettings.razorpayKeySecret,
        paymentTestMode: toBoolean(
          payment.paymentTestMode,
          defaultSettings.paymentTestMode
        ),
        notifyNewDonation: toBoolean(
          notification.notifyNewDonation,
          defaultSettings.notifyNewDonation
        ),
        notifyFailedTransactions: toBoolean(
          notification.notifyFailedTransactions,
          defaultSettings.notifyFailedTransactions
        ),
        notifyWeeklySummary: toBoolean(
          notification.notifyWeeklySummary,
          defaultSettings.notifyWeeklySummary
        ),
        notifyMonthlyReports: toBoolean(
          notification.notifyMonthlyReports,
          defaultSettings.notifyMonthlyReports
        ),
      })
    } catch {
      setError("Failed to load settings.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      setError("")

      const payload = {
        settings: [
          { key: "orgName", value: form.orgName, category: "general" },
          {
            key: "registrationNumber",
            value: form.registrationNumber,
            category: "general",
          },
          { key: "orgEmail", value: form.orgEmail, category: "general" },
          { key: "orgPhone", value: form.orgPhone, category: "general" },
          { key: "orgAddress", value: form.orgAddress, category: "general" },
          {
            key: "workingHours",
            value: form.workingHours,
            category: "general",
          },
          {
            key: "razorpayKeyId",
            value: form.razorpayKeyId,
            category: "payment",
          },
          {
            key: "razorpayKeySecret",
            value: form.razorpayKeySecret,
            category: "payment",
          },
          {
            key: "paymentTestMode",
            value: String(form.paymentTestMode),
            category: "payment",
          },
          {
            key: "notifyNewDonation",
            value: String(form.notifyNewDonation),
            category: "notification",
          },
          {
            key: "notifyFailedTransactions",
            value: String(form.notifyFailedTransactions),
            category: "notification",
          },
          {
            key: "notifyWeeklySummary",
            value: String(form.notifyWeeklySummary),
            category: "notification",
          },
          {
            key: "notifyMonthlyReports",
            value: String(form.notifyMonthlyReports),
            category: "notification",
          },
        ],
      }

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setError("Failed to save settings.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Platform configuration and preferences
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2" disabled={loading || saving}>
          <Save className="size-4" />
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>
            Basic trust information and contact details
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Organization Name</Label>
              <Input
                value={form.orgName}
                onChange={(e) => setForm((s) => ({ ...s, orgName: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Registration Number</Label>
              <Input
                value={form.registrationNumber}
                onChange={(e) =>
                  setForm((s) => ({ ...s, registrationNumber: e.target.value }))
                }
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Email</Label>
              <Input
                value={form.orgEmail}
                onChange={(e) => setForm((s) => ({ ...s, orgEmail: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={form.orgPhone}
                onChange={(e) => setForm((s) => ({ ...s, orgPhone: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label>Address</Label>
            <Textarea
              value={form.orgAddress}
              onChange={(e) => setForm((s) => ({ ...s, orgAddress: e.target.value }))}
              className="mt-1"
              rows={2}
            />
          </div>
          <div>
            <Label>Working Hours</Label>
            <Input
              value={form.workingHours}
              onChange={(e) => setForm((s) => ({ ...s, workingHours: e.target.value }))}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateway</CardTitle>
          <CardDescription>
            Configure Razorpay payment integration
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Razorpay Key ID</Label>
              <Input
                type="password"
                value={form.razorpayKeyId}
                onChange={(e) =>
                  setForm((s) => ({ ...s, razorpayKeyId: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Razorpay Key Secret</Label>
              <Input
                type="password"
                value={form.razorpayKeySecret}
                onChange={(e) =>
                  setForm((s) => ({ ...s, razorpayKeySecret: e.target.value }))
                }
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={form.paymentTestMode}
              onCheckedChange={(value) =>
                setForm((s) => ({ ...s, paymentTestMode: value }))
              }
              id="test-mode"
            />
            <Label htmlFor="test-mode" className="text-sm">
              Test Mode (no real charges)
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure email and alert preferences</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                New Donation Alerts
              </p>
              <p className="text-xs text-muted-foreground">
                Receive email when a new donation is received
              </p>
            </div>
            <Switch
              checked={form.notifyNewDonation}
              onCheckedChange={(value) =>
                setForm((s) => ({ ...s, notifyNewDonation: value }))
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Failed Transaction Alerts
              </p>
              <p className="text-xs text-muted-foreground">
                Receive email when a transaction fails
              </p>
            </div>
            <Switch
              checked={form.notifyFailedTransactions}
              onCheckedChange={(value) =>
                setForm((s) => ({ ...s, notifyFailedTransactions: value }))
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Weekly Summary
              </p>
              <p className="text-xs text-muted-foreground">
                Receive a weekly summary of donations and donor activity
              </p>
            </div>
            <Switch
              checked={form.notifyWeeklySummary}
              onCheckedChange={(value) =>
                setForm((s) => ({ ...s, notifyWeeklySummary: value }))
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Monthly Reports
              </p>
              <p className="text-xs text-muted-foreground">
                Automatically generate and email monthly reports
              </p>
            </div>
            <Switch
              checked={form.notifyMonthlyReports}
              onCheckedChange={(value) =>
                setForm((s) => ({ ...s, notifyMonthlyReports: value }))
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
