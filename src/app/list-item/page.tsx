"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Plus,
  Minus,
  Check,
  ArrowRight,
  ArrowLeft,
  Info,
  Camera,
  DollarSign,
  Box,
  MapPin,
  Building,
  Globe2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getCategories } from "@/lib/api/categories";
import { createAsset } from "@/lib/api/assets";
import { getApiErrorMessage } from "@/lib/api";
import type { Category } from "@/types";

const steps = ["Basic Info", "Details", "Pricing & App", "Photos"];

export default function ListItemPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    categoryId: null as number | null,
    capacity: "1",
    description: "",
    rent: "10",
    localAddress: "",
    city: "",
    state: "",
    country: "",
    tags: [""],
  });
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => toast.error("Could not load categories"));
  }, []);

  const handleNext = () => {
    // Basic validation before moving to next steps
    if (currentStep === 0) {
      if (!formData.title.trim()) {
        toast.error("Title is required.");
        return;
      }
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required.");
      setCurrentStep(0);
      return;
    }
    
    setSubmitting(true);
    try {
      const form = new FormData();
      
      const asset = {
        title: formData.title,
        description: formData.description || undefined,
        categoryId: formData.categoryId ?? undefined,
        capacity: Number(formData.capacity) || 0,
        rent: Number(formData.rent) || 0,
        tags: formData.tags.filter(t => t.trim() !== ""),
        addressDetails: {
          localAddress: formData.localAddress || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          country: formData.country || undefined,
        },
      };
      
      form.append(
        "asset",
        new Blob([JSON.stringify(asset)], { type: "application/json" })
      );
      images.forEach((file) => form.append("images", file));
      
      await createAsset(form);
      toast.success("Listing created successfully!");
      router.push("/dashboard/listings");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/10">
      <Navbar />

      <main className="flex-1 container py-12 max-w-4xl mx-auto px-4 md:px-8">
        <div className="mb-10 text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">List your asset</h1>
          <p className="text-muted-foreground text-lg">Start earning by renting out your unused high-quality items.</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 -z-10" />
          <div className="flex justify-between">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 bg-secondary/10 px-2 lg:px-4">
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-md",
                  currentStep >= idx
                    ? "bg-primary text-primary-foreground scale-110 shadow-primary/20"
                    : "bg-background text-muted-foreground border border-border"
                )}>
                  {currentStep > idx ? <Check className="h-5 w-5" /> : idx + 1}
                </div>
                <span className={cn(
                  "text-xs font-bold uppercase tracking-wider hidden sm:block",
                  currentStep >= idx ? "text-primary" : "text-muted-foreground"
                )}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-8">
          {/* Step 1: Basic Info */}
          {currentStep === 0 && (
            <Card className="shadow-lg border-none overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 rounded-2xl">
              <div className="h-2 bg-primary" />
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Basic Information</CardTitle>
                <CardDescription>Tell us the fundamental details about your item.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold text-foreground/80">Item Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    placeholder="e.g. Sony Alpha a7 IV Mirrorless Camera"
                    className="h-12 text-lg font-medium bg-muted/20 focus-visible:ring-primary/40 focus-visible:bg-background border-border/80"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                  <p className="text-[11px] text-muted-foreground px-1">Catchy titles help your listing stand out and are strictly required.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-foreground/80">Category</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar border border-border/40 p-2 rounded-lg bg-muted/10">
                      {categories.map((cat) => (
                        <Button
                          key={cat.id}
                          type="button"
                          variant={formData.categoryId === cat.id ? "default" : "outline"}
                          className="justify-start h-10 px-3 py-2 text-xs truncate"
                          onClick={() => setFormData({ ...formData, categoryId: cat.id })}
                        >
                          {cat.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="capacity" className="text-sm font-semibold text-foreground/80">Capacity</Label>
                      <Input
                        id="capacity"
                        type="number"
                        min="0"
                        placeholder="e.g. 1"
                        className="bg-muted/20 focus-visible:ring-primary/40 focus-visible:bg-background border-border/80 h-10"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      />
                      <p className="text-[11px] text-muted-foreground px-1">How many people/items it holds (0 or more)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Details */}
          {currentStep === 1 && (
            <Card className="shadow-lg border-none overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 rounded-2xl">
              <div className="h-2 bg-primary" />
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Item Specification</CardTitle>
                <CardDescription>Detailed descriptions attract serious renters.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="desc" className="text-sm font-semibold text-foreground/80">Description</Label>
                  <textarea
                    id="desc"
                    className="flex min-h-[150px] w-full rounded-md border border-border/80 bg-muted/20 px-4 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:bg-background resize-y"
                    placeholder="Describe your item, its features, and any specific rental terms..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                </div>
                
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-foreground/80">Tags / Features</Label>
                  <p className="text-[12px] text-muted-foreground pb-1">Add keywords or specific characteristics.</p>
                  {formData.tags.map((tag, idx) => (
                    <div key={idx} className="flex gap-3">
                      <Input
                        placeholder={`Tag or Feature ${idx + 1}`}
                        className="bg-muted/20 focus-visible:ring-primary/40 focus-visible:bg-background border-border/80 h-11"
                        value={tag}
                        onChange={(e) => {
                          const newTags = [...formData.tags];
                          newTags[idx] = e.target.value;
                          setFormData({ ...formData, tags: newTags });
                        }}
                      />
                      {idx === formData.tags.length - 1 ? (
                        <Button 
                          size="icon" 
                          variant="secondary" 
                          className="shrink-0 h-11 w-11 rounded-lg" 
                          onClick={() => setFormData({ ...formData, tags: [...formData.tags, ""] })}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="shrink-0 h-11 w-11 rounded-lg text-destructive hover:bg-destructive/10" 
                          onClick={() => {
                            const newTags = formData.tags.filter((_, i) => i !== idx);
                            setFormData({ ...formData, tags: newTags });
                          }}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Pricing & Location */}
          {currentStep === 2 && (
            <Card className="shadow-lg border-none overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 rounded-2xl">
              <div className="h-2 bg-primary" />
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Pricing & Location</CardTitle>
                <CardDescription>Set competitive rates and specify your exact address details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
                  {/* PRICING */}
                  <div className="space-y-6">
                    <div className="space-y-3 pt-2">
                       <Label className="text-sm font-bold tracking-wide uppercase text-foreground/60">Rental Pricing</Label>
                       <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-primary pointer-events-none" />
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="pl-12 h-16 text-3xl font-bold bg-muted/20 border-border/80 focus-visible:ring-primary/40 focus-visible:bg-background"
                          value={formData.rent}
                          onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-muted-foreground tracking-widest text-sm pointer-events-none">/ PERIOD</span>
                      </div>
                    </div>
                    
                    <div className="p-5 rounded-2xl bg-secondary/20 border border-secondary/40 space-y-3 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
                       <div className="flex justify-between text-sm items-center relative z-10">
                        <span className="text-muted-foreground font-medium">RMS Platform Fee (10%)</span>
                        <span className="font-semibold text-rose-500">-${(Number(formData.rent) * 0.1).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-3 border-t border-border/60 relative z-10">
                        <span>You will earn</span>
                        <span className="text-emerald-500">${(Number(formData.rent) * 0.9).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* ADDRESS DETAILS */}
                  <div className="space-y-5">
                    <Label className="text-sm font-bold tracking-wide uppercase text-foreground/60">Address Details</Label>
                    
                    <div className="space-y-3.5">
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Local Address (Street, Apt)"
                          className="pl-10 h-11 bg-muted/20 border-border/80 focus-visible:ring-primary/40 focus-visible:bg-background text-sm"
                          value={formData.localAddress}
                          onChange={(e) => setFormData({ ...formData, localAddress: e.target.value })}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="relative">
                          <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="City"
                            className="pl-10 h-11 bg-muted/20 border-border/80 focus-visible:ring-primary/40 focus-visible:bg-background text-sm"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          />
                        </div>
                        
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="State"
                            className="pl-10 h-11 bg-muted/20 border-border/80 focus-visible:ring-primary/40 focus-visible:bg-background text-sm"
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          />
                        </div>
                      </div>
                      
                      <div className="relative">
                        <Globe2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Country"
                          className="pl-10 h-11 bg-muted/20 border-border/80 focus-visible:ring-primary/40 focus-visible:bg-background text-sm"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Photos */}
          {currentStep === 3 && (
            <Card className="shadow-lg border-none overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 rounded-2xl">
              <div className="h-2 bg-primary" />
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Photos</CardTitle>
                <CardDescription>Upload high-quality images. Listings with 5+ photos rent 3x faster.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/10 transition-all group shadow-sm">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files) setImages((prev) => [...prev, ...Array.from(files)]);
                      }}
                    />
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Camera className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary text-center px-2">Add Photos</span>
                  </label>
                  {images.map((file, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl bg-muted/40 border border-border flex items-center justify-center text-xs text-muted-foreground overflow-hidden group shadow-sm">
                      <img 
                         src={URL.createObjectURL(file)} 
                         alt={file.name} 
                         className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity" 
                      />
                      <button 
                         type="button" 
                         className="absolute top-1.5 right-1.5 bg-background/80 hover:bg-destructive hover:text-destructive-foreground backdrop-blur-sm p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                         onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                      >
                         <Minus className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex gap-4">
                  <Info className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-orange-700/80 dark:text-orange-400 leading-relaxed font-medium">Please ensure you have the rights to use the photos you upload. Avoid using stock images from the manufacturer as they are less trusted by local renters.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6">
            <Button
              variant="outline"
              disabled={currentStep === 0}
              onClick={handleBack}
              className="gap-2 h-12 px-6 rounded-xl border-border/80"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              className="px-8 h-12 text-base font-bold rounded-xl shadow-lg hover:shadow-primary/30 transition-all gap-2"
              onClick={handleNext}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Publishing
                </>
              ) : currentStep === steps.length - 1 ? "Publish Listing" : "Continue"}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
