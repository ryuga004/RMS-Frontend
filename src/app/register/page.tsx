"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ChevronLeft } from "lucide-react";
import * as registerApi from "@/lib/api/register";
import { getApiErrorMessage } from "@/lib/api";
import { ROLE_ID_ADMIN, ROLE_ID_TENANT } from "@/types";
import { AuthLayout } from "@/components/AuthLayout";

type Step = "email" | "verify" | "details";

export default function RegisterPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState<number>(ROLE_ID_TENANT);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const msg = await registerApi.requestVerification(email);
      toast.success(msg || "Verification email sent.");
      setStep("verify");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await registerApi.verifyEmail(email, verificationCode);
      toast.success("Email verified.");
      setStep("details");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await registerApi.register({ email, password, name, roleId });
      toast.success("Account created. Please sign in.");
      router.push("/login");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (step) {
      case "verify":
        return "Verify Email";
      case "details":
        return "Complete Your Profile";
      default:
        return "Create Account";
    }
  };

  const getDescription = () => {
    switch (step) {
      case "verify":
        return "Enter the code sent to your email";
      case "details":
        return "Choose your role and set a password";
      default:
        return "Join AssertRent today";
    }
  };

  return (
    <AuthLayout title="Get Started" description="Rent or list properties easily">
      <div className="space-y-8">
        <div className="space-y-2 text-center lg:text-left">
          <h1 className="text-3xl font-bold text-foreground">{getTitle()}</h1>
          <p className="text-sm text-foreground/60">{getDescription()}</p>
        </div>

        {/* Step Indicator */}
        {step !== "email" && (
          <div className="flex gap-2">
            {["email", "verify", "details"].map((s, idx) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  step === s || (step === "verify" && s === "email")
                    ? "bg-primary"
                    : step === "details" && (s === "email" || s === "verify")
                    ? "bg-primary"
                    : "bg-secondary"
                }`}
              />
            ))}
          </div>
        )}

        {/* EMAIL STEP */}
        {step === "email" && (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending code...
                </>
              ) : (
                "Send Verification Code"
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-foreground/60">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        )}

        {/* VERIFY STEP */}
        {step === "verify" && (
          <form onSubmit={handleVerifyEmail} className="space-y-5">
            <div className="p-3 rounded-lg bg-secondary/50 text-center">
              <p className="text-sm font-medium text-foreground">{email}</p>
              <p className="text-xs text-foreground/60 mt-1">We sent a code to this email</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium">Verification Code</Label>
              <Input
                id="code"
                placeholder="Enter 6-digit code"
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={isLoading}
                className="h-11 text-center text-lg tracking-widest"
              />
              <p className="text-xs text-foreground/60">Check your spam folder if you don't see it</p>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border-secondary"
              onClick={() => setStep("email")}
              disabled={isLoading}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </form>
        )}

        {/* DETAILS STEP */}
        {step === "details" && (
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">I want to</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRoleId(ROLE_ID_TENANT)}
                  disabled={isLoading}
                  className={`p-4 rounded-lg border-2 transition-all text-sm font-medium ${
                    roleId === ROLE_ID_TENANT
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-secondary hover:border-primary/30 text-foreground/70"
                  }`}
                >
                  🏠 Rent Items
                </button>
                <button
                  type="button"
                  onClick={() => setRoleId(ROLE_ID_ADMIN)}
                  disabled={isLoading}
                  className={`p-4 rounded-lg border-2 transition-all text-sm font-medium ${
                    roleId === ROLE_ID_ADMIN
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-secondary hover:border-primary/30 text-foreground/70"
                  }`}
                >
                  📋 List Items
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-11"
              />
              <p className="text-xs text-foreground/60">Must be at least 8 characters long</p>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border-secondary"
              onClick={() => setStep("verify")}
              disabled={isLoading}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
