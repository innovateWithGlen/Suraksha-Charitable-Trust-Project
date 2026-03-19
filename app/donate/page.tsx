"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import Script from "next/script"
import {
  Heart,
  Shield,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  IndianRupee,
  FileText,
  Lock,
  User,
  Mail,
  Phone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { IdProofType, isValidIdProofNumber, isValidPanNumber, normalizeIdProofNumber, normalizePanNumber } from "@/lib/identity-format"

declare global {
  interface Window {
    Razorpay: any
  }
}

const presetAmounts = [500, 1000, 1500, 2000, 5000, 10000]

type DonationStep = "select" | "details" | "processing" | "success" | "failure"

const normalizeIndianPhone = (value: string) => {
  const digitsOnly = value.replace(/\D/g, "")
  const withoutCountryCode = digitsOnly.startsWith("91")
    ? digitsOnly.slice(2)
    : digitsOnly
  const localTenDigits = withoutCountryCode.slice(0, 10)

  return localTenDigits ? `+91${localTenDigits}` : ""
}

const formatAadhaarInput = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 12)
  if (!digits) return ""

  const chunks = [digits.slice(0, 4), digits.slice(4, 8), digits.slice(8, 12)].filter(Boolean)
  return chunks.join("-")
}

export default function DonatePage() {
  const [step, setStep] = useState<DonationStep>("select")
  const [amount, setAmount] = useState<number | null>(1000)
  const [customAmount, setCustomAmount] = useState("")
  const [requires80G, setRequires80G] = useState(false)
  const [donorInfo, setDonorInfo] = useState({
    name: "",
    email: "",
    phone: "",
    panNumber: "",
    idProofType: "" as "" | IdProofType,
    idProofNumber: "",
  })
  const [formError, setFormError] = useState("")
  const [txnId, setTxnId] = useState("")
  const [donationId, setDonationId] = useState("")

  const selectedAmount = customAmount ? parseInt(customAmount) : amount
  const minimumAmount = requires80G ? 5000 : 100

  const handleAmountSelect = (value: number) => {
    setAmount(value)
    setCustomAmount("")
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    if (value) setAmount(null)
  }

  const handleRequires80GChange = (checked: boolean) => {
    setRequires80G(checked)
    setFormError("")

    if (checked && (!selectedAmount || selectedAmount < 5000)) {
      setAmount(5000)
      setCustomAmount("5000")
    }
  }

  const handleProceed = () => {
    if (!selectedAmount || selectedAmount < minimumAmount) return
    setStep("details")
  }

  const handlePayment = async () => {
    const normalizedPhone = normalizeIndianPhone(donorInfo.phone)
    const panNumber = normalizePanNumber(donorInfo.panNumber) || ""
    const idProofType = donorInfo.idProofType
    const idProofNumber = idProofType
      ? normalizeIdProofNumber(idProofType, donorInfo.idProofNumber) || ""
      : donorInfo.idProofNumber.trim()

    if (!donorInfo.name || !donorInfo.email || !selectedAmount || selectedAmount < minimumAmount) return

    if (normalizedPhone && !/^\+91\d{10}$/.test(normalizedPhone)) {
      setFormError("Enter a valid phone number with 10 digits")
      return
    }

    if (requires80G) {
      const hasPan = !!panNumber
      const hasAlternate = !!idProofType && !!idProofNumber

      if (hasPan && !isValidPanNumber(panNumber)) {
        setFormError("Enter a valid PAN number (e.g., ABCDE1234F)")
        return
      }

      if (!hasPan && !hasAlternate) {
        setFormError("For 80G filing, provide PAN or alternate ID (Aadhaar/Passport/Voter ID)")
        return
      }

      if (hasAlternate && idProofType && !isValidIdProofNumber(idProofType, idProofNumber)) {
        setFormError("Enter a valid alternate ID number")
        return
      }
    }

    setFormError("")

    try {
      setStep("processing")

      const donationRes = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName: donorInfo.name,
          donorEmail: donorInfo.email,
          donorPhone: normalizedPhone,
          panNumber,
          idProofType: idProofType || undefined,
          idProofNumber: idProofNumber || undefined,
          amount: selectedAmount,
          requires80G,
          method: "other",
          notes: requires80G ? "80G certificate requested" : undefined,
        }),
      })

      if (!donationRes.ok) {
        const err = await donationRes.json().catch(() => ({}))
        setFormError(err?.error || "Unable to process donation details")
        setStep("failure")
        return
      }

      const donationData = await donationRes.json()
      setDonationId(donationData.donation._id)
      setTxnId(donationData.transactionId)

      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donationId: donationData.donation._id,
          amount: selectedAmount,
        }),
      })

      if (!orderRes.ok) {
        setStep("failure")
        return
      }

      const orderData = await orderRes.json()

      if (orderData.demoMode) {
        const verifyRes = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            donationId: donationData.donation._id,
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: `demo_pay_${Date.now()}`,
            razorpay_signature: "demo_signature",
          }),
        })

        if (verifyRes.ok) {
          const verifyData = await verifyRes.json()
          setTxnId(verifyData?.donation?.transactionId || donationData.transactionId)
          setStep("success")
        } else {
          setStep("failure")
        }
        return
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Suraksha Charitable Trust",
        description: "Donation",
        order_id: orderData.orderId,
        prefill: {
          name: donorInfo.name,
          email: donorInfo.email,
          contact: normalizedPhone,
        },
        theme: {
          color: "#1a365d",
        },
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              donationId: donationData.donation._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })

          if (verifyRes.ok) {
            setTxnId(response.razorpay_payment_id)
            setStep("success")
          } else {
            setStep("failure")
          }
        },
        modal: {
          ondismiss: function () {
            setStep("failure")
          },
        },
      }

      if (!window.Razorpay) {
        setStep("failure")
        return
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch {
      setStep("failure")
    }
  }

  const handleRetry = () => {
    setStep("details")
  }

  const handleNewDonation = () => {
    setStep("select")
    setAmount(1000)
    setCustomAmount("")
    setRequires80G(false)
    setDonorInfo({ name: "", email: "", phone: "", panNumber: "", idProofType: "", idProofNumber: "" })
    setFormError("")
    setTxnId("")
    setDonationId("")
  }

  // Processing state
  if (step === "processing") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative size-20">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-muted border-t-secondary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Processing Payment
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Please wait while we process your donation of{" "}
              <span className="font-semibold">
                {"₹"}
                {selectedAmount?.toLocaleString("en-IN")}
              </span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (step === "success") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-green-200 bg-green-50/50">
          <CardContent className="flex flex-col items-center gap-6 pt-10 pb-8">
            <div className="flex size-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="size-10 text-green-600" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-green-800">
                Donation Successful!
              </h2>
              <p className="mt-2 text-3xl font-bold text-green-700">
                {"₹"} {selectedAmount?.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="w-full rounded-lg bg-card p-4">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                  <User className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Donor</p>
                  <p className="text-sm font-medium text-foreground">
                    {donorInfo.name}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-foreground">{txnId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="text-foreground">
                    {new Date().toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold text-foreground">
                    {"₹"} {selectedAmount?.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              A receipt has been sent to {donorInfo.email}
            </p>

            <div className="flex w-full gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleNewDonation}
              >
                <ArrowLeft className="mr-2 size-4" />
                New Donation
              </Button>
              <Button asChild className="flex-1 bg-green-600 hover:bg-green-700 text-card">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Failure state
  if (step === "failure") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-red-200 bg-red-50/50">
          <CardContent className="flex flex-col items-center gap-6 pt-10 pb-8">
            <div className="flex size-20 items-center justify-center rounded-full bg-red-100">
              <XCircle className="size-10 text-red-600" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-red-800">
                Transaction Failed
              </h2>
              <p className="mt-2 text-3xl font-bold text-red-700">
                {"₹"} {selectedAmount?.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="w-full rounded-lg bg-red-100/50 p-4">
              <p className="text-sm text-red-700">
                The payment could not be processed. Please check your payment
                details and try again. If the issue persists, contact your bank
                or our support team.
              </p>
            </div>

            <div className="w-full rounded-lg bg-card p-4">
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-foreground">{txnId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="text-foreground">
                    {new Date().toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <a
              href="mailto:SurakshaCharitableTrust@gmail.com"
              className="text-sm text-secondary hover:underline"
            >
              Contact Support
            </a>

            <div className="flex w-full gap-3">
              <Button variant="outline" className="flex-1" onClick={handleRetry}>
                Try Again
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Donor details step
  if (step === "details") {
    return (
      <section className="bg-background py-16 lg:py-24">
        <div className="mx-auto max-w-lg px-6">
          <button
            onClick={() => setStep("select")}
            className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to amount selection
          </button>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Complete Your Donation</CardTitle>
              <CardDescription>
                You are donating{" "}
                <span className="font-bold text-foreground">
                  {"₹"} {selectedAmount?.toLocaleString("en-IN")}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="donor-name" className="flex items-center gap-2">
                  <User className="size-4 text-muted-foreground" />
                  Full Name *
                </Label>
                <Input
                  id="donor-name"
                  placeholder="Enter your full name"
                  value={donorInfo.name}
                  onChange={(e) =>
                    setDonorInfo({ ...donorInfo, name: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="donor-email" className="flex items-center gap-2">
                  <Mail className="size-4 text-muted-foreground" />
                  Email Address *
                </Label>
                <Input
                  id="donor-email"
                  type="email"
                  placeholder="you@example.com"
                  value={donorInfo.email}
                  onChange={(e) =>
                    setDonorInfo({ ...donorInfo, email: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="donor-phone" className="flex items-center gap-2">
                  <Phone className="size-4 text-muted-foreground" />
                  Phone Number
                </Label>
                <Input
                  id="donor-phone"
                  type="tel"
                  placeholder="+91XXXXXXXXXX"
                  maxLength={13}
                  value={donorInfo.phone}
                  onChange={(e) => {
                    setFormError("")
                    setDonorInfo({ ...donorInfo, phone: normalizeIndianPhone(e.target.value) })
                  }}
                />
                <p className="text-xs text-muted-foreground">Only 10 digits are allowed after +91</p>
              </div>

              <label className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3 text-sm">
                <input
                  type="checkbox"
                  checked={requires80G}
                  onChange={(event) => handleRequires80GChange(event.target.checked)}
                  className="mt-0.5"
                />
                <span className="text-muted-foreground">
                  I require an 80G tax certificate (Minimum donation ₹5,000)
                </span>
              </label>

              {requires80G ? (
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="mb-3 text-xs text-muted-foreground">
                    For 80G filing, provide PAN. If PAN is unavailable, provide Aadhaar, Passport, or Voter ID.
                  </p>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="pan-number">PAN Number</Label>
                    <Input
                      id="pan-number"
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      value={donorInfo.panNumber}
                      onChange={(e) => {
                        setFormError("")
                        setDonorInfo({ ...donorInfo, panNumber: e.target.value.toUpperCase() })
                      }}
                    />
                    <p className="text-xs text-muted-foreground">Format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F) • Max 10 characters</p>
                  </div>

                  <p className="my-3 text-center text-xs text-muted-foreground">OR</p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label>Alternate ID Type</Label>
                      <Select
                        value={donorInfo.idProofType || undefined}
                        onValueChange={(value) => {
                          setFormError("")
                          setDonorInfo({ ...donorInfo, idProofType: value as IdProofType })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose ID" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aadhaar">Aadhaar</SelectItem>
                          <SelectItem value="passport">Passport</SelectItem>
                          <SelectItem value="voterId">Voter ID</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="id-proof-number">Alternate ID Number</Label>
                      <Input
                        id="id-proof-number"
                        placeholder={donorInfo.idProofType === "aadhaar" ? "XXXX-XXXX-XXXX" : donorInfo.idProofType === "passport" ? "A1234567" : "ABC1234567"}
                        maxLength={donorInfo.idProofType === "aadhaar" ? 14 : donorInfo.idProofType === "passport" ? 8 : 10}
                        value={donorInfo.idProofNumber}
                        onChange={(e) => {
                          setFormError("")
                          const value = e.target.value

                          if (donorInfo.idProofType === "aadhaar") {
                            setDonorInfo({ ...donorInfo, idProofNumber: formatAadhaarInput(value) })
                            return
                          }

                          if (donorInfo.idProofType === "passport" || donorInfo.idProofType === "voterId") {
                            setDonorInfo({
                              ...donorInfo,
                              idProofNumber: value.toUpperCase().replace(/\s+/g, ""),
                            })
                            return
                          }

                          setDonorInfo({ ...donorInfo, idProofNumber: value })
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        {donorInfo.idProofType === "aadhaar" ? "Format: 12 digits with dashes (e.g., 2541-7890-1234) • Max 14 characters" : donorInfo.idProofType === "passport" ? "Format: 1 letter + 7 alphanumerics (e.g., A1234567) • Max 8 characters" : "Format: 3 letters + 7 digits (e.g., ABC1234567) • Max 10 characters"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {formError ? (
                <p className="text-xs font-medium text-destructive">{formError}</p>
              ) : null}

              <div className="mt-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Lock className="size-3.5 shrink-0" />
                  <span>
                    Your payment will be processed securely via Razorpay. We
                    never store your card details.
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                className="mt-2 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
                onClick={handlePayment}
                disabled={!donorInfo.name || !donorInfo.email || (requires80G && !donorInfo.panNumber && !(donorInfo.idProofType && donorInfo.idProofNumber))}
              >
                <IndianRupee className="mr-1 size-4" />
                Pay {"₹"} {selectedAmount?.toLocaleString("en-IN")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  // Amount selection step (default)
  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      {/* Hero banner */}
      <section className="relative bg-primary py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <Heart className="mx-auto mb-4 size-12 text-accent" />
          <h1 className="text-balance text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
            Make a Difference Today
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-primary-foreground/70 leading-relaxed">
            Your generous donation helps us provide education, healthcare, and
            community support to those who need it most.
          </p>
        </div>
      </section>

      {/* Donation form */}
      <section className="bg-background py-16 lg:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Amount selection */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IndianRupee className="size-5 text-secondary" />
                    Select Donation Amount
                  </CardTitle>
                  <CardDescription>
                    Choose a preset amount or enter a custom amount
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  {/* Preset chips */}
                  <div className="grid grid-cols-3 gap-3">
                    {presetAmounts.map((value) => (
                      <button
                        key={value}
                        onClick={() => handleAmountSelect(value)}
                        disabled={requires80G && value < 5000}
                        className={cn(
                          "rounded-lg border-2 px-4 py-3 text-center font-semibold transition-all",
                          amount === value && !customAmount
                            ? "border-accent bg-accent/10 text-accent-foreground"
                            : "border-border bg-card text-foreground hover:border-accent/50",
                          requires80G && value < 5000
                            ? "cursor-not-allowed opacity-40 hover:border-border"
                            : ""
                        )}
                      >
                        {"₹"} {value.toLocaleString("en-IN")}
                      </button>
                    ))}
                  </div>

                  <label className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3 text-sm">
                    <input
                      type="checkbox"
                      checked={requires80G}
                      onChange={(event) => handleRequires80GChange(event.target.checked)}
                      className="mt-0.5"
                    />
                    <span className="text-muted-foreground">
                      I require an 80G tax certificate (Minimum donation ₹5,000)
                    </span>
                  </label>

                  {/* Custom amount */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="custom-amount">Custom Amount</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="custom-amount"
                        type="number"
                        min={minimumAmount}
                        placeholder={`Enter amount (min ₹${minimumAmount.toLocaleString("en-IN")})`}
                        className="pl-9"
                        value={customAmount}
                        onChange={(e) =>
                          handleCustomAmountChange(e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Total display */}
                  <div className="rounded-lg bg-primary/5 p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Your Donation
                    </p>
                    <p className="mt-1 text-4xl font-bold text-foreground">
                      {"₹"}{" "}
                      {selectedAmount
                        ? selectedAmount.toLocaleString("en-IN")
                        : "0"}
                    </p>
                  </div>

                  <Button
                    size="lg"
                    className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
                    onClick={handleProceed}
                    disabled={!selectedAmount || selectedAmount < minimumAmount}
                  >
                    Proceed to Donate
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Trust indicators sidebar */}
            <div className="flex flex-col gap-4 lg:col-span-2">
              <Card>
                <CardContent className="flex flex-col gap-4 pt-6">
                  <div className="flex items-start gap-3">
                    <Shield className="mt-0.5 size-5 shrink-0 text-secondary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Secure Payment
                      </p>
                      <p className="text-xs text-muted-foreground">
                        256-bit SSL encryption via Razorpay
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 size-5 shrink-0 text-secondary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Tax Deductible
                      </p>
                      <p className="text-xs text-muted-foreground">
                        80G tax benefit on all donations
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-secondary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Instant Receipt
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Get your donation receipt via email
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Image
                      src="/images/logo.png"
                      alt="Suraksha Charitable Trust"
                      width={40}
                      height={40}
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Suraksha Charitable Trust
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Registered Non-Profit
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    100% of your donation goes directly to funding education,
                    healthcare, and community welfare programs across India.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
