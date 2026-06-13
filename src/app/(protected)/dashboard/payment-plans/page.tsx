"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MoreHorizontal, Plus, Wallet, Pencil, Trash2 } from "lucide-react";
import {
  getOwnerPaymentOptions,
  createPaymentOption,
  updatePaymentOption,
  deletePaymentOption,
} from "@/lib/api/payments";
import { getApiErrorMessage } from "@/lib/api";
import type { PaymentOption, CreatePaymentOptionRequest, UpdatePaymentOptionRequest } from "@/types/payment";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import { getMyAssets } from "@/lib/api/assets";
import type { AssetListItem } from "@/types";

const EMPTY_FORM: CreatePaymentOptionRequest = {
  assetId: 0,
  name: "",
  description: "",
  amount: 0,
  currency: "USD",
  paymentType: "RENT",
  isRecurring: false,
  recurringInterval: undefined,
};

export default function PaymentOptionsPage() {
  const [options, setOptions] = useState<PaymentOption[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<AssetListItem[]>([]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreatePaymentOptionRequest>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchOptions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOwnerPaymentOptions(page, pageSize);
      if (res.success && res.data) {
        setOptions((res.data.result as PaymentOption[]) ?? []);
        setTotalCount(res.data.totalCount ?? 0);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  const fetchAssets = useCallback(async () => {
    try {
      const res = await getMyAssets({ pageSize: 100 });
      setAssets((res.result as AssetListItem[]) ?? []);
    } catch {
      // silent — assets are just for the dropdown
    }
  }, []);

  useEffect(() => {
    fetchOptions();
    fetchAssets();
  }, [fetchOptions, fetchAssets]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (option: PaymentOption) => {
    setEditingId(option.id);
    setForm({
      assetId: option.assetId,
      name: option.name,
      description: option.description ?? "",
      amount: option.amount,
      currency: option.currency,
      paymentType: option.paymentType,
      isRecurring: option.isRecurring,
      recurringInterval: option.recurringInterval ?? undefined,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.assetId || !form.name || !form.amount) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    try {
      if (editingId !== null) {
        const updateReq: UpdatePaymentOptionRequest = {
          name: form.name,
          description: form.description,
          amount: form.amount,
          currency: form.currency,
          paymentType: form.paymentType,
          isRecurring: form.isRecurring,
          recurringInterval: form.recurringInterval,
          isActive: true,
        };
        await updatePaymentOption(editingId, updateReq);
        toast.success("Payment option updated.");
      } else {
        await createPaymentOption(form);
        toast.success("Payment option created.");
      }
      setDialogOpen(false);
      fetchOptions();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await deletePaymentOption(deleteId);
      toast.success("Payment option deleted.");
      setDeleteId(null);
      fetchOptions();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Wallet className="h-7 w-7 text-primary" />
            Payment Options
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure payment options for your properties.
          </p>
        </div>
        <Button onClick={openCreate} className="w-fit gap-2">
          <Plus className="h-4 w-4" />
          Add Payment Option
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 border-border/50">
              <TableHead>Name</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell colSpan={6} className="h-16 bg-muted/20" />
                </TableRow>
              ))
            ) : options.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                  <Wallet className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="font-medium">No payment options yet</p>
                  <p className="text-sm mt-1">Create your first payment option to let tenants pay.</p>
                </TableCell>
              </TableRow>
            ) : (
              options.map((opt) => (
                <TableRow key={opt.id} className="border-border/50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{opt.name}</p>
                      {opt.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{opt.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{opt.assetTitle}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{opt.paymentType}</Badge>
                    {opt.isRecurring && (
                      <Badge variant="outline" className="text-xs ml-1">{opt.recurringInterval}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {opt.currency} {Number(opt.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={opt.isActive ? "default" : "secondary"}>
                      {opt.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(opt)}>
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(opt.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
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
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId !== null ? "Edit Payment Option" : "Add Payment Option"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Property */}
            <div className="space-y-1.5">
              <Label>Property <span className="text-destructive">*</span></Label>
              <Select
                value={form.assetId ? String(form.assetId) : ""}
                onValueChange={(v) => setForm((f) => ({ ...f, assetId: Number(v) }))}
                disabled={editingId !== null}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>{a.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label>Name <span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g. Monthly Rent"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                placeholder="Optional description..."
                rows={2}
                value={form.description ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            {/* Amount + Currency */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Amount <span className="text-destructive">*</span></Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount || ""}
                  onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Select
                  value={form.currency ?? "USD"}
                  onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payment Type */}
            <div className="space-y-1.5">
              <Label>Payment Type</Label>
              <Select
                value={form.paymentType ?? "RENT"}
                onValueChange={(v) => setForm((f) => ({ ...f, paymentType: v as typeof f.paymentType }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="RENT">Rent</SelectItem>
                  <SelectItem value="DEPOSIT">Security Deposit</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recurring */}
            <div className="flex items-center gap-3">
              <Switch
                checked={form.isRecurring ?? false}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isRecurring: v }))}
              />
              <Label className="cursor-pointer">Recurring payment</Label>
            </div>
            {form.isRecurring && (
              <div className="space-y-1.5">
                <Label>Recurring Interval</Label>
                <Select
                  value={form.recurringInterval ?? "MONTHLY"}
                  onValueChange={(v) => setForm((f) => ({ ...f, recurringInterval: v as typeof f.recurringInterval }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : editingId !== null ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Option</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment option? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive hover:bg-destructive/90">
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
