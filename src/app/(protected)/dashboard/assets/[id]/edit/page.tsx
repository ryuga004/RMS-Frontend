"use client";

import { useState, useEffect } from "react";
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
  Globe2,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { getCategories } from "@/lib/api/categories";
import { getAssetById, updateAsset } from "@/lib/api/assets";
import { getApiErrorMessage } from "@/lib/api";
import type { Category, AssetDetailResponse } from "@/types";

const steps = ["Basic Info", "Details", "Pricing & App", "Photos"];

export default function EditItemPage() {
  const params = useParams();
  const id = Number(params.id);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
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
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initPage = async () => {
      try {
        const [cats, asset] = await Promise.all([
          getCategories(),
          getAssetById(id)
        ]);
        
        setCategories(cats);
        
        setFormData({
          title: asset.title,
          categoryId: cats.find(c => c.name === asset.categoryName)?.id || null,
          capacity: String(asset.capacity),
          description: asset.description || "",
          rent: String(asset.rent),
          localAddress: asset.addressDetails?.localAddress || "",
          city: asset.addressDetails?.city || "",
          state: asset.addressDetails?.state || "",
          country: asset.addressDetails?.country || "",
          tags: asset.tags && asset.tags.length > 0 ? asset.tags : [""],
        });
        
        if (asset.imageUrls) {
          setExistingImageUrls(asset.imageUrls);
        }
        
      } catch (err) {
        toast.error("Failed to load data");
        router.push("/dashboard/assets");
      } finally {
        setLoading(false);
      }
    };

    if (id) initPage();
  }, [id, router]);

  const handleNext = () => {
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
      
      const assetUpdate = {
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
        new Blob([JSON.stringify(assetUpdate)], { type: "application/json" })
      );
      
      if (images.length > 0) {
        images.forEach((file) => form.append("images", file));
      }
      
      await updateAsset(id, form);
      toast.success("Listing updated successfully!");
      router.push("/dashboard/assets");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-secondary/10">
      

      <main className="flex-1 container py-12 max-w-4xl mx-auto px-4 md:px-8">
        <div className="mb-10 text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Edit your listing</h1>
          <p className="text-muted-foreground text-lg">Update details or add new photos to your asset.</p>
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
                        className="bg-muted/20 focus-visible:ring-primary/40 focus-visible:bg-background border-border/80 h-10"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      />
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
                    placeholder="Describe your item..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                </div>
                
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-foreground/80">Tags / Features</Label>
                  {formData.tags.map((tag, idx) => (
                    <div key={idx} className="flex gap-3">
                      <Input
                        placeholder={`Tag ${idx + 1}`}
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
                <CardDescription>Set competitive rates and specify location.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
                  <div className="space-y-6">
                    <div className="space-y-3 pt-2">
                       <Label className="text-sm font-bold tracking-wide uppercase text-foreground/60">Rental Pricing</Label>
                       <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-primary pointer-events-none" />
                        <Input
                          type="number"
                          step="0.01"
                          className="pl-12 h-16 text-3xl font-bold bg-muted/20 border-border/80 focus-visible:ring-primary/40 focus-visible:bg-background"
                          value={formData.rent}
                          onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                    <Label className="text-sm font-bold tracking-wide uppercase text-foreground/60">Address Details</Label>
                    <div className="space-y-3.5">
                      <Input
                        placeholder="Local Address"
                        className="h-11 bg-muted/20 border-border/80 focus-visible:ring-primary/40 focus-visible:bg-background"
                        value={formData.localAddress}
                        onChange={(e) => setFormData({ ...formData, localAddress: e.target.value })}
                      />
                      <div className="grid grid-cols-2 gap-3.5">
                        <Input
                          placeholder="City"
                          className="h-11 bg-muted/20 border-border/80 focus-visible:ring-primary/40 focus-visible:bg-background"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        />
                        <Input
                          placeholder="State"
                          className="h-11 bg-muted/20 border-border/80 focus-visible:ring-primary/40 focus-visible:bg-background"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        />
                      </div>
                      <Input
                        placeholder="Country"
                        className="h-11 bg-muted/20 border-border/80 focus-visible:ring-primary/40 focus-visible:bg-background"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      />
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
                <CardDescription>Manage existing photos or add new ones.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {/* Upload new */}
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
                    <Camera className="h-5 w-5 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Add More</span>
                  </label>
                  
                  {/* Existing photos (read-only in this simple version) */}
                  {existingImageUrls.map((url, i) => (
                    <div key={`existing-${i}`} className="relative aspect-square rounded-2xl bg-muted/40 border border-border overflow-hidden">
                      <img 
                         src={url} 
                         alt={`Existing ${i}`} 
                         className="object-cover w-full h-full opacity-90" 
                      />
                      <div className="absolute top-1.5 left-1.5 bg-primary/80 text-[8px] text-white px-2 py-0.5 rounded-full uppercase font-bold">Existing</div>
                    </div>
                  ))}

                  {/* New photos */}
                  {images.map((file, i) => (
                    <div key={`new-${i}`} className="relative aspect-square rounded-2xl bg-muted/40 border border-border flex items-center justify-center overflow-hidden group">
                      <img 
                         src={URL.createObjectURL(file)} 
                         alt={file.name} 
                         className="object-cover w-full h-full" 
                      />
                      <button 
                         type="button" 
                         className="absolute top-1.5 right-1.5 bg-background/80 hover:bg-destructive hover:text-destructive-foreground p-1.5 rounded-full transition-colors"
                         onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                      >
                         <Minus className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
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
              className="gap-2 h-12 px-6 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              className="px-8 h-12 text-base font-bold rounded-xl shadow-lg border-none"
              onClick={handleNext}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving Changes
                </>
              ) : currentStep === steps.length - 1 ? "Save Changes" : "Continue"}
              {!submitting && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </div>
      </main>

      
    </div>
  );
}
