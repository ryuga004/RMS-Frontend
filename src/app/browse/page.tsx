"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, SlidersHorizontal, Grid3X3, List, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { getBrowseAssets } from "@/lib/api/assets";
import { getCategories } from "@/lib/api/categories";
import type { AssetListItem, Category } from "@/types";
import { toast } from "sonner";

type BrowseRow = {
  id: string;
  title: string;
  image: string;
  category: string;
  price: number;
  available: boolean;
  description?: string;
};

function toBrowseRow(a: AssetListItem): BrowseRow {
  return {
    id: String(a.id),
    title: a.title,
    image: a.imageUrl ?? "",
    category: a.categoryName ?? "",
    price: Number(a.rent),
    available: true,
  };
}

function BrowseContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const initialCat = searchParams.get("category") || "";

  const [query, setQuery] = useState(initialQ);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [sortBy, setSortBy] = useState("rating");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [apiItems, setApiItems] = useState<AssetListItem[]>([]);
  const [apiCategories, setApiCategories] = useState<Category[]>([]);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [catsLoaded, setCatsLoaded] = useState(false);

  useEffect(() => {
    getCategories()
      .then(setApiCategories)
      .catch(() => {})
      .finally(() => setCatsLoaded(true));
  }, []);

  useEffect(() => {
    setApiLoaded(false);
    const params: any = { 
        pageNumber: 0, 
        pageSize: 50, 
        searchText: query || undefined,
        categoryIds: selectedCategory ? [Number(selectedCategory)] : undefined
    };

    if (sortBy === "price") {
        params.sortBy = "rent";
        params.sortDirection = "asc";
    }

    getBrowseAssets(params)
      .then((res) => {
        setApiItems((res.result as AssetListItem[]) ?? []);
        setApiLoaded(true);
      })
      .catch(() => setApiLoaded(true));
  }, [query, selectedCategory, sortBy]);

  const categoriesToUse = apiCategories.map(c => ({
    id: String(c.id),
    name: c.name,
    icon: "📦",
    count: 0
  }));

  const filtered = useMemo((): BrowseRow[] => {
    return apiItems.map(toBrowseRow);
  }, [apiItems]);

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
                <div className="container py-8">
                    {/* Search bar */}
                    <div className="flex gap-3">
                        <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-card px-4 shadow-card">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                            />
                            {query && (
                                <button onClick={() => setQuery("")}>
                                    <X className="h-4 w-4 text-muted-foreground" />
                                </button>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="gap-2 md:hidden"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="mt-6 flex gap-8">
                        {/* Filters sidebar */}
                        <aside
                            className={`${showFilters ? "block" : "hidden"
                                } w-full shrink-0 md:block md:w-56`}
                        >
                            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                                <h3 className="mb-3 text-sm font-semibold text-foreground">Category</h3>
                                <div className="flex flex-col gap-1.5">
                                    <button
                                        onClick={() => setSelectedCategory("")}
                                        className={`rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${!selectedCategory ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-secondary"
                                            }`}
                                    >
                                        All Categories
                                    </button>
                                    {categoriesToUse.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id === selectedCategory ? "" : cat.id)}
                                            className={`rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${selectedCategory === cat.id
                                                    ? "bg-primary/10 font-medium text-primary"
                                                    : "text-muted-foreground hover:bg-secondary"
                                                }`}
                                        >
                                            {cat.icon} {cat.name}
                                        </button>
                                    ))}
                                </div>

                                <h3 className="mb-3 mt-6 text-sm font-semibold text-foreground">Sort By</h3>
                                <div className="flex flex-col gap-1.5">
                                    {[
                                        { value: "rating", label: "Highest Rated" },
                                        { value: "price", label: "Lowest Price" },
                                        { value: "newest", label: "Newest" },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setSortBy(opt.value)}
                                            className={`rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${sortBy === opt.value
                                                    ? "bg-primary/10 font-medium text-primary"
                                                    : "text-muted-foreground hover:bg-secondary"
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </aside>

                        {/* Results */}
                        <div className="flex-1">
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    {filtered.length} item{filtered.length !== 1 ? "s" : ""} found
                                </p>
                                <div className="hidden items-center gap-1 md:flex">
                                    <Button
                                        variant={viewMode === "grid" ? "secondary" : "ghost"}
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setViewMode("grid")}
                                    >
                                        <Grid3X3 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === "list" ? "secondary" : "ghost"}
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setViewMode("list")}
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {selectedCategory && (
                                <div className="mb-4">
                                    <Badge variant="secondary" className="gap-1 pr-1">
                                        {categoriesToUse.find((c) => c.id === selectedCategory)?.name}
                                        <button
                                            onClick={() => setSelectedCategory("")}
                                            className="ml-1 rounded-full p-0.5 hover:bg-muted"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                </div>
                            )}

                            {filtered.length === 0 ? (
                                <div className="py-20 text-center">
                                    <p className="text-lg font-medium text-foreground">No items found</p>
                                    <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search or filters</p>
                                </div>
                            ) : (
                                <div
                                    className={
                                        viewMode === "grid"
                                            ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                                            : "flex flex-col gap-4"
                                    }
                                >
                                    <AnimatePresence>
                                        {filtered.map((item, i) => (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ delay: i * 0.04 }}
                                            >
                                                <Link
                                                    href={`/item/${item.id}`}
                                                    className={`group block overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:shadow-card-hover ${viewMode === "list" ? "flex" : ""}`}
                                                >
                                                    <div className={`overflow-hidden ${viewMode === "list" ? "w-48 shrink-0" : "aspect-[4/3]"}`}>
                                                        <img
                                                            src={item.image || "/placeholder.svg"}
                                                            alt={item.title}
                                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                            loading="lazy"
                                                        />
                                                    </div>
                                                    <div className="flex flex-1 flex-col p-4">
                                                        <span className="text-xs text-muted-foreground">{item.category}</span>
                                                        <h3 className="mt-1 font-semibold text-foreground">{item.title}</h3>
                                                        {viewMode === "list" && item.description && (
                                                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                                {item.description}
                                                            </p>
                                                        )}
                                                        <div className="mt-auto flex items-center justify-between pt-3">
                                                            <div>
                                                                <span className="text-lg font-bold text-primary">${item.price}</span>
                                                                <span className="text-xs text-muted-foreground"> / mo</span>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <Badge variant={item.available ? "secondary" : "destructive"} className="text-xs">
                                                                {item.available ? "Available" : "Rented Out"}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default function Browse() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BrowseContent />
        </Suspense>
    );
}
