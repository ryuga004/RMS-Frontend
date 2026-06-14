"use client";

import { useState, useEffect, useMemo } from "react";
import { Country, State, City } from "country-state-city";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Minus,
  DollarSign,
  Camera,
  Info,
  X,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getCategories } from "@/lib/api/categories";
import { createAsset } from "@/lib/api/assets";
import { getApiErrorMessage } from "@/lib/api";
import type { Category } from "@/types";

// ── Constants ─────────────────────────────────────────────────────────────────

const STEPS = ["Basic Info", "Specification", "Pricing & Location", "Photos"] as const;

// ── Types ─────────────────────────────────────────────────────────────────────

type FormState = {
  title: string;
  categoryId: number | null;
  capacity: string;
  description: string;
  rent: string;
  localAddress: string;
  countryCode: string;
  stateCode: string;
  city: string;
  tags: string[];
};

const INITIAL_FORM: FormState = {
  title: "",
  categoryId: null,
  capacity: "1",
  description: "",
  rent: "10",
  localAddress: "",
  countryCode: "",
  stateCode: "",
  city: "",
  tags: [""],
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function ListingFormDrawer({ open, onOpenChange, onSuccess }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [images, setImages] = useState<File[]>([]);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // ── Location data (derived) ───────────────────────────────────────────────
  const countries = useMemo(() => Country.getAllCountries(), []);
  const states = useMemo(
    () => (form.countryCode ? State.getStatesOfCountry(form.countryCode) : []),
    [form.countryCode]
  );
  const cities = useMemo(
    () =>
      form.countryCode && form.stateCode
        ? City.getCitiesOfState(form.countryCode, form.stateCode)
        : [],
    [form.countryCode, form.stateCode]
  );

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => toast.error("Could not load categories"));
  }, []);

  useEffect(() => {
    if (!open) {
      setForm(INITIAL_FORM);
      setImages([]);
      setStep(0);
    }
  }, [open]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const patch = (fields: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...fields }));

  const patchTag = (idx: number, value: string) => {
    const next = [...form.tags];
    next[idx] = value;
    patch({ tags: next });
  };

  const handleNext = () => {
    if (step === 0 && !form.title.trim()) {
      toast.error("Item title is required.");
      return;
    }
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Item title is required.");
      setStep(0);
      return;
    }
    setSubmitting(true);
    try {
      const countryName = Country.getCountryByCode(form.countryCode)?.name;
      const stateName = State.getStateByCodeAndCountry(form.stateCode, form.countryCode)?.name;

      const fd = new FormData();
      fd.append(
        "asset",
        new Blob(
          [
            JSON.stringify({
              title: form.title,
              description: form.description || undefined,
              categoryId: form.categoryId ?? undefined,
              capacity: Number(form.capacity) || 0,
              rent: Number(form.rent) || 0,
              tags: form.tags.filter((t) => t.trim() !== ""),
              addressDetails: {
                localAddress: form.localAddress || undefined,
                city: form.city || undefined,
                state: stateName || undefined,
                country: countryName || undefined,
              },
            }),
          ],
          { type: "application/json" }
        )
      );
      images.forEach((file) => fd.append("images", file));

      await createAsset(fd);
      toast.success("Listing created!");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const rent = Number(form.rent) || 0;
  const isLastStep = step === STEPS.length - 1;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-[580px] w-full flex flex-col p-0 gap-0"
      >
        {/* ── Header ── */}
        <SheetHeader className="px-6 pt-5 pb-4 border-b shrink-0">
          <SheetTitle className="text-xl font-bold">List New Item</SheetTitle>
          <SheetDescription>
            Start earning by renting out your unused items.
          </SheetDescription>
        </SheetHeader>

        {/* ── Step indicator ── */}
        <div className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center">
            {STEPS.map((label, idx) => (
              <div key={idx} className="flex items-center flex-1 last:flex-none">
                {/* Circle */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                      step > idx
                        ? "bg-primary text-primary-foreground"
                        : step === idx
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground border border-border"
                    )}
                  >
                    {step > idx ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap",
                      step >= idx ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {label}
                  </span>
                </div>
                {/* Connector line */}
                {idx < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-px mx-2 mb-4 transition-colors",
                      step > idx ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Step content ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">

            {/* Step 0 — Basic Info */}
            {step === 0 && (
              <div className="space-y-5 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <Field label="Item Title" required hint="Catchy titles help your listing stand out.">
                  <Input
                    placeholder="e.g. Sony Alpha a7 IV Camera"
                    className="h-11"
                    value={form.title}
                    onChange={(e) => patch({ title: e.target.value })}
                    autoFocus
                  />
                </Field>

                <div className="grid grid-cols-2 gap-5">
                  <Field label="Category">
                    <Select
                      value={form.categoryId ? String(form.categoryId) : ""}
                      onValueChange={(v) => patch({ categoryId: Number(v) })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="Capacity" hint="People / items it holds">
                    <Input
                      type="number"
                      min="0"
                      className="h-11"
                      value={form.capacity}
                      onChange={(e) => patch({ capacity: e.target.value })}
                    />
                  </Field>
                </div>
              </div>
            )}

            {/* Step 1 — Specification */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <Field label="Description">
                  <textarea
                    rows={5}
                    placeholder="Describe your item, its features, and any rental terms..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                    value={form.description}
                    onChange={(e) => patch({ description: e.target.value })}
                  />
                </Field>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Tags / Features</Label>
                  <div className="space-y-2">
                    {form.tags.map((tag, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          placeholder={`Feature ${idx + 1}`}
                          className="h-10"
                          value={tag}
                          onChange={(e) => patchTag(idx, e.target.value)}
                        />
                        {idx === form.tags.length - 1 ? (
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="h-10 w-10 shrink-0"
                            onClick={() => patch({ tags: [...form.tags, ""] })}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 shrink-0 text-destructive hover:bg-destructive/10"
                            onClick={() =>
                              patch({ tags: form.tags.filter((_, i) => i !== idx) })
                            }
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — Pricing & Location */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                {/* Pricing */}
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wider text-foreground/60">
                    Rental Price
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="pl-10 h-14 text-2xl font-bold"
                      value={form.rent}
                      onChange={(e) => patch({ rent: e.target.value })}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium pointer-events-none">
                      / PERIOD
                    </span>
                  </div>
                  <div className="rounded-lg border border-border/50 bg-muted/40 divide-y divide-border/50 text-sm">
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-muted-foreground">Platform fee (10%)</span>
                      <span className="font-semibold text-red-500">
                        −${(rent * 0.1).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between px-4 py-2.5 font-bold">
                      <span>You will earn</span>
                      <span className="text-emerald-600">${(rent * 0.9).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wider text-foreground/60">
                    Address Details
                  </Label>

                  <Input
                    placeholder="Street Address"
                    className="h-10"
                    value={form.localAddress}
                    onChange={(e) => patch({ localAddress: e.target.value })}
                  />

                  {/* Country */}
                  <Select
                    value={form.countryCode}
                    onValueChange={(v) =>
                      patch({ countryCode: v, stateCode: "", city: "" })
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[240px]">
                      {countries.map((c) => (
                        <SelectItem key={c.isoCode} value={c.isoCode}>
                          {c.flag} {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* State + City */}
                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      value={form.stateCode}
                      onValueChange={(v) => patch({ stateCode: v, city: "" })}
                      disabled={states.length === 0}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue
                          placeholder={
                            form.countryCode ? "Select State" : "Select country first"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="max-h-[240px]">
                        {states.map((s) => (
                          <SelectItem key={s.isoCode} value={s.isoCode}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={form.city}
                      onValueChange={(v) => patch({ city: v })}
                      disabled={cities.length === 0}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue
                          placeholder={
                            form.stateCode ? "Select City" : "Select state first"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="max-h-[240px]">
                        {cities.map((c) => (
                          <SelectItem key={c.name} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 — Photos */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <p className="text-sm text-muted-foreground">
                  Listings with 5+ real photos rent 3× faster.
                </p>

                <div className="grid grid-cols-4 gap-3">
                  <label className="aspect-square rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-primary/10 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files)
                          setImages((prev) => [
                            ...prev,
                            ...Array.from(e.target.files!),
                          ]);
                      }}
                    />
                    <Camera className="h-5 w-5 text-primary" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-primary text-center">
                      Add Photos
                    </span>
                  </label>

                  {images.map((file, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-xl overflow-hidden group border border-border"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-background/80 hover:bg-destructive hover:text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                        onClick={() =>
                          setImages((prev) => prev.filter((_, idx) => idx !== i))
                        }
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 rounded-lg border border-orange-200 bg-orange-50 px-3.5 py-3 dark:border-orange-800 dark:bg-orange-950/30">
                  <Info className="h-4 w-4 shrink-0 text-orange-500 mt-0.5" />
                  <p className="text-xs font-medium leading-relaxed text-orange-700 dark:text-orange-400">
                    Ensure you have rights to all uploaded photos. Avoid manufacturer
                    stock images — real photos build more trust with local renters.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Footer navigation ── */}
        <div className="shrink-0 border-t bg-background px-6 py-4 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            className="min-w-[90px] gap-1.5"
            onClick={step === 0 ? () => onOpenChange(false) : () => setStep((s) => s - 1)}
            disabled={submitting}
          >
            {step === 0 ? (
              "Cancel"
            ) : (
              <>
                <ArrowLeft className="h-4 w-4" /> Back
              </>
            )}
          </Button>

          <Button
            className="flex-1 gap-2"
            onClick={handleNext}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Publishing…
              </>
            ) : isLastStep ? (
              "Publish Listing"
            ) : (
              <>
                Continue <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Private helpers ───────────────────────────────────────────────────────────

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}
