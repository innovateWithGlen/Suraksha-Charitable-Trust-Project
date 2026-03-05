"use client"

import { useState } from "react"
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

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
        <Button onClick={handleSave} className="gap-2">
          <Save className="size-4" />
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

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
                defaultValue="Suraksha Charitable Trust"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Registration Number</Label>
              <Input defaultValue="SCT-2015-IN-001" className="mt-1" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Email</Label>
              <Input
                defaultValue="SurakshaCharitableTrust@gmail.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input defaultValue="+91 99999-00000" className="mt-1" />
            </div>
          </div>
          <div>
            <Label>Address</Label>
            <Textarea defaultValue="India" className="mt-1" rows={2} />
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
                defaultValue="rzp_test_xxxxxxxxxxxxx"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Razorpay Key Secret</Label>
              <Input type="password" defaultValue="*************" className="mt-1" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch defaultChecked id="test-mode" />
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
            <Switch defaultChecked />
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
            <Switch defaultChecked />
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
            <Switch />
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
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
