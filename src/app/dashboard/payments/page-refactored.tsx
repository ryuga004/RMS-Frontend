"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreditCard, Building2, RefreshCw } from "lucide-react";
import { getPaymentOptionsByAsset, createCheckoutSession } from "@/lib/api/payments";
import { getMyRentals } from "@/lib/api/assets";
import { getApiErrorMessage } from "@/lib/api";
import type { PaymentOption } from "@/types/payment";
import type { AssetListItem } from "@/types";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ROUTES } from "@/constants";

function PaymentsContent() {
  const [rentals, setRentals] = useState<AssetListItem[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [loadingRentals, setLoadingRentals] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [confirmOption, setConfirmOption] = useState<PaymentOption | null>(null);
  const [paying, setPaying] = useState(false);

  const fetchRentals = useCallback(async () => {
    setLoadingRentals(true);
    try {
      const data = await getMyRentals();
      setRentals(data);
      if (data.length === 1) {
        setSelectedAssetId(data[0].id);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoadingRentals(false);
    }
  }, []);

  useEffect(() => {
    fetchRentals();
  }, [fetchRentals]);

  const fetchPaymentOptions = useCallback(async (assetId: number) => {
    setLoadingOptions(true);
    setPaymentOptions([]);
    try {
      const res = await getPaymentOptionsByAsset(assetId);
      if (res.success && res.data) {
        setPaymentOptions(res.data);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    if (selectedAssetId) {
      fetchPaymentOptions(selectedAssetId);
    }
  }, [selectedAssetId, fetchPaymentOptions]);

  const handlePay = async () => {
    if (!confirmOption) return;
    setPaying(true);
    try {
      const res = await createCheckoutSession(confirmOption.id);
      if (res.success && res.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else {
        toast.error("Failed to create checkout session.");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setPaying(false);
      setConfirmOption(null);
    }
  };

  const selectedAsset = rentals.find((r) => r.id === selectedAssetId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <CreditCard className="h-7 w-7 text-primary" />
          Make a Payment
        </h1>
        <p className="text-muted-foreground mt-1">
          Select your rented property and choose a payment option.
        </p>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Select Property</h2>
        </div>
        {loadingRentals ? (
          <div className="h-10 bg-muted/30 rounded-md animate-pulse" />
        ) : rentals.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You don&apos;t have any active rentals. Rent a property first to make payments.
          </p>
        ) : (
          <Select
            value={selectedAssetId ? String(selectedAssetId) : ""}
            onValueChange={(v) => setSelectedAssetId(Number(v))}
          >
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue placeholder="Choose a property…" />
            </SelectTrigger>
            <SelectContent>
              {rentals.map((r) => (
                <SelectItem key={r.id} value={String(r.id)}>
                  {r.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {selectedAssetId && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">
              Payment Options{selectedAsset ? ` for ${selectedAsset.title}` : ""}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchPaymentOptions(selectedAssetId)}
              disabled={loadingOptions}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loadingOptions ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {loadingOptions ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-40 rounded-xl bg-muted/20 animate-pulse" />
              ))}
            </div>
          ) : paymentOptions.length === 0 ? (
            <div className="rounded-xl border border-border/50 p-12 text-center text-muted-foreground">
              <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No payment options available</p>
              <p className="text-sm mt-1">
                The owner hasn&apos;t set up any payment options for this property yet.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paymentOptions.map((option) => (
                <Card
                  key={option.id}
                  className="border-border/50 bg-card/50 hover:border-primary/30 transition-colors"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-semibold">{option.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {option.paymentType}
                      </Badge>
                    </div>
                    {option.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{option.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          {option.currency} {Number(option.amount).toFixed(2)}
                        </p>
                        {option.isRecurring && option.recurringInterval && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            / {option.recurringInterval.toLowerCase()}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setConfirmOption(option)}
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        Pay Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <AlertDialog open={confirmOption !== null} onOpenChange={(open) => { if (!open) setConfirmOption(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>You&apos;re about to pay:</p>
                <div className="rounded-lg bg-muted/40 p-3 space-y-1 text-sm text-foreground">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Option</span>
                    <span className="font-medium">{confirmOption?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-bold text-base">
                      {confirmOption?.currency} {Number(confirmOption?.amount ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  You&apos;ll be redirected to Stripe&apos;s secure checkout page to complete the payment.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={paying}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePay} disabled={paying}>
              {paying ? "Redirecting…" : "Continue to Payment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <ProtectedRoute requiredPrivileges={ROUTES.DASHBOARD.PAYMENTS.privileges}>
      <PaymentsContent />
    </ProtectedRoute>
  );
}
