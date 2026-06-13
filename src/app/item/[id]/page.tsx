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
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
  const isTenant = user?.role === "TENANT";

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

  const handleRequestTenancy = async () => {
    if (Number.isNaN(numId)) return;
    setRequesting(true);
    try {
      await createTenancyRequest(numId);
      toast.success("Tenancy request sent. The owner will review it.");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-medium">Loading asset details…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-4">
          <div className="w-full max-w-md rounded border border-border bg-card p-10 text-center shadow-elevated">
            <h1 className="text-2xl font-bold text-foreground">Asset Not Found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This listing does not exist or has been removed.
            </p>
            <Button asChild className="mt-6 w-full">
              <Link href="/browse">Back to Browse</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const images = asset.imageUrls?.length ? asset.imageUrls : ["/placeholder.svg"];
  const mainImage = images[selectedImage] ?? "/placeholder.svg";
  const address = asset.addressDetails
    ? [
        asset.addressDetails.localAddress,
        asset.addressDetails.city,
        asset.addressDetails.state,
        asset.addressDetails.country,
      ]
        .filter(Boolean)
        .join(", ")
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 pb-16">
        <div className="container max-w-6xl px-4 py-8 sm:px-6 md:py-12">
          <Link
            href="/browse"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Browse
          </Link>

          <div className="grid gap-10 lg:grid-cols-12">
            {/* Images column */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded border border-border bg-muted shadow-card group">
                <img
                  src={mainImage}
                  alt={asset.title}
                  className="h-full w-full object-cover transition-opacity duration-150"
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage((p) => (p - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded bg-background/80 p-2 text-foreground opacity-0 shadow transition-opacity hover:bg-background group-hover:opacity-100 focus:opacity-100"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImage((p) => (p + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-background/80 p-2 text-foreground opacity-0 shadow transition-opacity hover:bg-background group-hover:opacity-100 focus:opacity-100"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded bg-background/60 px-3 py-1.5 backdrop-blur-sm">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedImage(i)}
                          aria-label={`Image ${i + 1}`}
                          className={`h-1.5 rounded-full transition-all ${
                            selectedImage === i ? "w-5 bg-primary" : "w-1.5 bg-foreground/30 hover:bg-foreground/50"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative h-16 w-20 shrink-0 overflow-hidden rounded border transition-all ${
                        selectedImage === i
                          ? "border-primary ring-1 ring-primary"
                          : "border-border opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details column */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                  {asset.categoryName ?? "Asset"}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {asset.title}
              </h1>

              <div className="my-4 flex flex-col gap-2.5 border-y border-border py-4">
                {address && (
                  <div className="flex items-start gap-3 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{address}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 shrink-0 text-primary" />
                  <span>Capacity: <span className="font-medium text-foreground">{asset.capacity} unit(s)</span></span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0 text-primary" />
                  <span>Listed: <span className="font-medium text-foreground">{new Date(asset.createdAt).toLocaleDateString()}</span></span>
                </div>
              </div>

              <div className="pb-5">
                <h3 className="mb-1.5 text-sm font-semibold text-foreground">Description</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {asset.description || "No description provided."}
                </p>
              </div>

              {asset.tags && asset.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Tag className="h-3 w-3" /> Tags
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {asset.tags.map((t) => (
                      <Badge key={t} variant="outline" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing CTA */}
              <div className="mt-auto rounded border border-border bg-card p-6 shadow-card">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Monthly Rent</p>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-4xl font-bold text-foreground">
                    ${Number(asset.rent).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-sm text-muted-foreground">/ month</span>
                </div>

                <div className="mt-5 flex flex-col gap-2.5">
                  {isTenant ? (
                    <Button
                      className="w-full gap-2"
                      onClick={handleRequestTenancy}
                      disabled={requesting}
                    >
                      <Send className="h-4 w-4" />
                      {requesting ? "Sending Request…" : "Request Tenancy"}
                    </Button>
                  ) : (
                    <div className="flex w-full items-center justify-center rounded border border-destructive/20 bg-destructive/5 py-2.5 text-sm font-medium text-destructive">
                      Only tenants can request tenancy.
                    </div>
                  )}
                  <Button variant="outline" className="w-full gap-2" asChild>
                    <Link href="/dashboard/messages">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      Contact Owner
                    </Link>
                  </Button>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 rounded border border-emerald-200 bg-emerald-50 py-2 text-xs font-medium text-emerald-700">
                  <Shield className="h-3.5 w-3.5" />
                  Protected by RMS platform guarantee
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
