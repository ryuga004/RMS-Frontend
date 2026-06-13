"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Receipt, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import { getOwnerPaymentHistory, getTenantPaymentHistory } from "@/lib/api/payments";
import { getApiErrorMessage } from "@/lib/api";
import type { Payment, PaymentStatus } from "@/types/payment";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import { isAdmin } from "@/types";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status: PaymentStatus }) {
  const map: Record<PaymentStatus, { label: string; icon: React.ReactNode; className: string }> = {
    COMPLETED: {
      label: "Completed",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      className: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    },
    PENDING: {
      label: "Pending",
      icon: <Clock className="h-3.5 w-3.5" />,
      className: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
    },
    FAILED: {
      label: "Failed",
      icon: <XCircle className="h-3.5 w-3.5" />,
      className: "bg-rose-500/10 text-rose-700 border-rose-200",
    },
    CANCELLED: {
      label: "Cancelled",
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      className: "bg-muted text-muted-foreground border-border",
    },
  };
  const cfg = map[status] ?? map.PENDING;
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 text-xs font-medium", cfg.className)}
    >
      {cfg.icon}
      {cfg.label}
    </Badge>
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PaymentHistoryPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const admin = user ? isAdmin(user.roleId) : false;

  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, admin]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = admin
        ? await getOwnerPaymentHistory(page, pageSize)
        : await getTenantPaymentHistory(page, pageSize);
      if (res.success && res.data) {
        setPayments((res.data.result as Payment[]) ?? []);
        setTotalCount(res.data.totalCount ?? 0);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Receipt className="h-7 w-7 text-primary" />
          Payment History
        </h1>
        <p className="text-muted-foreground mt-1">
          {admin
            ? "Review all payments received for your properties."
            : "Track your payment history across all properties."}
        </p>
      </div>

      {/* Summary */}
      {!loading && payments.length > 0 && (
        <div className="flex gap-4 flex-wrap">
          <div className="rounded-lg border border-border/50 bg-card/30 px-4 py-3">
            <p className="text-xs text-muted-foreground">Total Records</p>
            <p className="text-xl font-bold mt-0.5">{totalCount}</p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-500/5 px-4 py-3">
            <p className="text-xs text-emerald-600">Completed</p>
            <p className="text-xl font-bold mt-0.5 text-emerald-700">
              {payments.filter((p) => p.status === "COMPLETED").length}
            </p>
          </div>
          <div className="rounded-lg border border-yellow-200 bg-yellow-500/5 px-4 py-3">
            <p className="text-xs text-yellow-600">Pending</p>
            <p className="text-xl font-bold mt-0.5 text-yellow-700">
              {payments.filter((p) => p.status === "PENDING").length}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 border-border/50">
              <TableHead>Property</TableHead>
              <TableHead>Option</TableHead>
              <TableHead>{admin ? "Tenant" : "Owner"}</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              {!admin && <TableHead>Transaction</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse border-border/50">
                  <TableCell colSpan={admin ? 6 : 7} className="h-16 bg-muted/20" />
                </TableRow>
              ))
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={admin ? 6 : 7} className="py-16 text-center text-muted-foreground">
                  <Receipt className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="font-medium">No payment history yet</p>
                  <p className="text-sm mt-1">
                    {admin
                      ? "Payments from tenants will appear here."
                      : "Your payments will appear here after you complete them."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id} className="border-border/50 hover:bg-muted/20">
                  <TableCell className="font-medium text-sm">{payment.assetTitle}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{payment.paymentOptionName}</TableCell>
                  <TableCell className="text-sm">
                    {admin ? (
                      <div>
                        <p className="font-medium">{payment.tenantName}</p>
                        <p className="text-xs text-muted-foreground">{payment.tenantEmail}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">{payment.ownerName}</p>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">
                      {payment.currency} {Number(payment.amount).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(payment.paidAt ?? payment.createdAt)}
                  </TableCell>
                  {!admin && (
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {payment.stripePaymentIntentId
                        ? payment.stripePaymentIntentId.slice(0, 20) + "…"
                        : "—"}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalCount)} of {totalCount}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
