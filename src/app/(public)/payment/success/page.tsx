"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Receipt, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/20 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-emerald-500/10 p-6">
            <CheckCircle2 className="h-16 w-16 text-emerald-600" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Your payment has been processed successfully. You&apos;ll receive a receipt by email shortly.
          </p>
        </div>

        {/* Session ID (for reference) */}
        {sessionId && (
          <div className="rounded-lg bg-muted/40 border border-border/50 px-4 py-3 text-left">
            <p className="text-xs text-muted-foreground mb-1">Session Reference</p>
            <p className="text-xs font-mono text-foreground break-all">{sessionId}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/dashboard/transactions" className="gap-2">
              <Receipt className="h-4 w-4" />
              View Payment History
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard" className="gap-2">
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading…</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
