"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import {
  ArrowLeft,
  Shield,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  MapPin,
  Users,
  Calendar,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { getAssetById } from "@/lib/api/assets";
import { createTenancyRequest } from "@/lib/api/tenancy";
import { getApiErrorMessage } from "@/lib/api";
import type { AssetDetailResponse } from "@/types";
import { toast } from "sonner";

export default function ItemDetailPage() {
  const { id } = useParams();
  const { user } = useSelector((state: RootState) => state.auth);
  const [asset, setAsset] = useState<AssetDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const numId = id ? Number(id) : NaN;

  useEffect(() => {
    if (!id || Number.isNaN(numId)) {
      setLoading(false);
      return;
    }
    getAssetById(numId)
      .then(setAsset)
      .catch(() => setAsset(null))
      .finally(() => setLoading(false));
  }, [id, numId]);

  // Check if tenant
  const isTenant = user?.role === "TENANT" || user?.roleId === 4 || user?.roleId === 2; // Adjust if needed based on constant
  // We'll safely use role string for tenant
  const tenant = user ? user.role === "TENANT" : false;

  const handleRequestTenancy = async () => {
    if (Number.isNaN(numId)) return;
    setRequesting(true);
    try {
      await createTenancyRequest(numId);
      toast.success("Tenancy request sent successfully. The owner will review it.");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-secondary/10">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="font-medium animate-pulse">Loading asset details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex min-h-screen flex-col bg-secondary/10">
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-4">
          <div className="text-center bg-card p-10 md:p-14 rounded-3xl border border-border/50 shadow-xl max-w-md w-full">
            <h1 className="text-3xl font-extrabold text-foreground mb-2">Asset Not Found</h1>
            <p className="mt-2 text-muted-foreground/80 leading-relaxed mb-8">The listing you are looking for does not exist or has been removed by the owner.</p>
            <Button asChild className="w-full h-12 rounded-xl text-base font-semibold">
              <Link href="/browse">
                Back to Browse
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const images = asset.imageUrls?.length ? asset.imageUrls : ["/placeholder.svg"];
  // Safely get main image or placeholder
  const mainImage = images[selectedImage] || "/placeholder.svg";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-secondary/20 to-background pb-16">
        <div className="container py-8 md:py-12 max-w-6xl mx-auto px-4 sm:px-6">
          <Link
            href="/browse"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors bg-secondary/30 px-3 py-1.5 rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Browse
          </Link>

          <div className="grid gap-12 lg:grid-cols-12">
            
            {/* Left Column: Images */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }} 
               animate={{ opacity: 1, y: 0 }} 
               className="lg:col-span-7 flex flex-col gap-4"
            >
              <div className="relative overflow-hidden rounded-3xl bg-muted border border-border/30 shadow-lg group aspect-[4/3]">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    src={mainImage}
                    alt={asset.title}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="h-full w-full object-cover"
                  />
                </AnimatePresence>
                
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setSelectedImage((p) => (p - 1 + images.length) % images.length)
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 hover:bg-background text-foreground p-3 backdrop-blur-md shadow-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-110"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => setSelectedImage((p) => (p + 1) % images.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 hover:bg-background text-foreground p-3 backdrop-blur-md shadow-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-110"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                    
                    {/* Image indicator dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 bg-background/60 backdrop-blur-md px-3 py-2 rounded-full">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedImage(i)}
                          className={`h-2 rounded-full transition-all ${
                            selectedImage === i ? "w-6 bg-primary" : "w-2 bg-foreground/30 hover:bg-foreground/50"
                          }`}
                          aria-label={`Go to slide ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-muted transition-all opacity-90 hover:opacity-100 ${
                        selectedImage === i 
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background opacity-100 scale-[1.02]" 
                          : "border border-border/50 hover:border-border"
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Right Column: Asset Details */}
            <motion.div 
               initial={{ opacity: 0, x: 20 }} 
               animate={{ opacity: 1, x: 0 }} 
               transition={{ delay: 0.1 }}
               className="lg:col-span-5 flex flex-col"
            >
              {/* Meta information tags */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="secondary" className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary hover:bg-primary/20">
                  {asset.categoryName ?? "Categorized Asset"}
                </Badge>
              </div>

              {/* Title & Description */}
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl md:text-5xl leading-tight mb-4">
                 {asset.title}
              </h1>
              
              <div className="flex flex-col gap-3 py-4 border-y border-border/40 my-2">
                 {asset.addressDetails && (
                   <div className="flex items-start gap-3 text-muted-foreground">
                      <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="font-medium">
                        {[
                          asset.addressDetails.localAddress,
                          asset.addressDetails.city,
                          asset.addressDetails.state,
                          asset.addressDetails.country,
                        ].filter(Boolean).join(", ")}
                      </span>
                   </div>
                 )}
                 
                 <div className="flex items-center gap-3 text-muted-foreground">
                    <Users className="h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium">Capacity / Size: <span className="text-foreground">{asset.capacity} Unit(s)</span></span>
                 </div>
                 
                 <div className="flex items-center gap-3 text-muted-foreground">
                    <Calendar className="h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium">Listed on: <span className="text-foreground">{new Date(asset.createdAt).toLocaleDateString()}</span></span>
                 </div>
              </div>

              <div className="pt-2 pb-6">
                <h3 className="text-lg font-bold text-foreground mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed text-[15px]">
                  {asset.description || "No description provided for this asset."}
                </p>
              </div>

              {asset.tags && asset.tags.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                     <Tag className="h-4 w-4" /> Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {asset.tags.map((t) => (
                      <Badge key={t} variant="outline" className="px-3 py-1 bg-secondary/30">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing & Call to Action Box */}
              <div className="mt-auto rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                
                <div className="flex flex-col gap-1 mb-6 relative z-10">
                   <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Monthly Rent</p>
                   <div className="text-5xl font-extrabold text-foreground flex items-baseline gap-2">
                     ${Number(asset.rent).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                     <span className="text-base font-medium text-muted-foreground">/ month</span>
                   </div>
                </div>
                
                <div className="flex flex-col gap-3 relative z-10">
                  {tenant ? (
                    <Button
                      className="w-full h-14 rounded-xl text-lg font-bold shadow-lg hover:shadow-primary/25 transition-all gap-2"
                      onClick={handleRequestTenancy}
                      disabled={requesting}
                    >
                      <Send className="h-5 w-5" />
                      {requesting ? "Sending Request…" : "Request Tenancy"}
                    </Button>
                  ) : (
                    <div className="w-full h-14 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive font-semibold flex items-center justify-center">
                       Only tenants can request tenancy.
                    </div>
                  )}
                  
                  <Button variant="outline" className="w-full h-12 rounded-xl gap-2 font-semibold border-border/80 bg-background/50 hover:bg-secondary/50" asChild>
                    <Link href="/dashboard/messages">
                      <MessageCircle className="h-5 w-5 text-muted-foreground" />
                      Contact Owner
                    </Link>
                  </Button>
                </div>
                
                <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-500/10 py-2.5 rounded-lg border border-emerald-500/20">
                  <Shield className="h-4 w-4" />
                  Protected by standard RMS platform guarantee
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
