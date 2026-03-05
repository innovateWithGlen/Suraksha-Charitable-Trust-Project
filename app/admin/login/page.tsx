"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Mail, KeyRound, Loader2, Chrome } from "lucide-react";

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  // Email + Password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Email OTP state
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);

  // Google state
  const [googleLoading, setGoogleLoading] = useState(false);

  // Email + Password login
  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setLoginError("Invalid email or password");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setLoginError("Something went wrong. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setOtpError(data.error || "Failed to send OTP");
      } else {
        setOtpSent(true);
      }
    } catch {
      setOtpError("Something went wrong. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    setOtpVerifying(true);
    setOtpError("");

    try {
      const result = await signIn("email-otp", {
        email: otpEmail,
        otp,
        redirect: false,
      });

      if (result?.error) {
        setOtpError("Invalid or expired OTP");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setOtpError("Something went wrong. Please try again.");
    } finally {
      setOtpVerifying(false);
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img
              src="/images/logo.png"
              alt="Suraksha Charitable Trust"
              className="h-16 w-16 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Suraksha Charitable Trust
          </h1>
          <p className="text-muted-foreground mt-1">Admin Portal</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="email" className="text-xs">
                  <KeyRound className="w-3 h-3 mr-1" />
                  Password
                </TabsTrigger>
                <TabsTrigger value="otp" className="text-xs">
                  <Mail className="w-3 h-3 mr-1" />
                  Email OTP
                </TabsTrigger>
                <TabsTrigger value="google" className="text-xs">
                  <Chrome className="w-3 h-3 mr-1" />
                  Google
                </TabsTrigger>
              </TabsList>

              {/* Email + Password Tab */}
              <TabsContent value="email">
                <form onSubmit={handleCredentialsLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="glenmonteiro47@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  {loginError && (
                    <p className="text-sm text-destructive">{loginError}</p>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginLoading}
                  >
                    {loginLoading && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Sign In
                  </Button>
                </form>
              </TabsContent>

              {/* Email OTP Tab */}
              <TabsContent value="otp">
                {!otpSent ? (
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp-email">Email</Label>
                      <Input
                        id="otp-email"
                        type="email"
                        placeholder="glenmonteiro47@gmail.com"
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      We&apos;ll send a 6-digit code to your email
                    </p>
                    {otpError && (
                      <p className="text-sm text-destructive">{otpError}</p>
                    )}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={otpLoading}
                    >
                      {otpLoading && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      Send OTP
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">
                        Enter the code sent to
                      </p>
                      <p className="font-medium text-sm">{otpEmail}</p>
                    </div>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={(val) => setOtp(val)}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    {otpError && (
                      <p className="text-sm text-destructive text-center">
                        {otpError}
                      </p>
                    )}
                    <Button
                      className="w-full"
                      onClick={handleVerifyOTP}
                      disabled={otp.length !== 6 || otpVerifying}
                    >
                      {otpVerifying && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      Verify & Sign In
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full text-xs"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp("");
                        setOtpError("");
                      }}
                    >
                      Use a different email
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Google Tab */}
              <TabsContent value="google">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Sign in with your Google account linked to the admin portal
                  </p>
                  <Button
                    variant="outline"
                    className="w-full h-12"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading}
                  >
                    {googleLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                    )}
                    Continue with Google
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Only pre-approved admin accounts can sign in
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          &copy; {new Date().getFullYear()} Suraksha Charitable Trust. All
          rights reserved.
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <AdminLoginContent />
    </Suspense>
  );
}
