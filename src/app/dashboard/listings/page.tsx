"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { ListingFormDrawer } from "@/components/dashboard/listings/ListingFormDrawer";
import { Plus, Eye, Edit, Trash2, ImageIcon, Bed, Bath, Search } from "lucide-react";
import { getMyAssets, deleteAsset } from "@/lib/api/assets";
import { getApiErrorMessage } from "@/lib/api";
import type { AssetListItem, AssetStatus } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<AssetStatus, string> = {
  AVAILABLE: "text-violet-600 bg-violet-50 border-violet-200",
  OCCUPIED:  "text-green-600  bg-green-50  border-green-200",
  REPAIRING: "text-orange-600 bg-orange-50 border-orange-200",
  INACTIVE:  "text-gray-500   bg-gray-50   border-gray-200",
};

const STATUS_LABELS: Record<AssetStatus, string> = {
  AVAILABLE: "Available",
  OCCUPIED:  "Occupied",
  REPAIRING: "Repairing",
  INACTIVE:  "Inactive",
};

function StatusBadge({ status }: { status: AssetStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        STATUS_STYLES[status]
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </span>
  );
}

// ── Column factory ────────────────────────────────────────────────────────────

function buildColumns(
  onDelete: (id: number, title: string) => void
): ColumnDef<AssetListItem>[] {
  return [
    {
      id: "thumbnail",
      header: "Thumbnail",
      headerClassName: "w-[100px] text-center",
      className: "text-center",
      cell: (row) =>
        row.imageUrl ? (
          <img
            src={row.imageUrl}
            alt={row.title}
            className="h-12 w-16 rounded-lg object-cover border border-border/50 shadow-sm mx-auto transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="h-12 w-16 rounded-lg bg-secondary/60 border border-border/50 flex items-center justify-center mx-auto">
            <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
          </div>
        ),
    },
    {
      id: "details",
      header: "Item Details",
      cell: (row) => (
        <div className="flex flex-col min-w-[160px]">
          <span className="font-semibold text-foreground line-clamp-1">{row.title}</span>
          {row.address && (
            <span className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{row.address}</span>
          )}
        </div>
      ),
    },
    {
      id: "rent",
      header: "Rent",
      cell: (row) => (
        <span className="font-bold text-primary text-[15px]">
          ${Number(row.rent).toLocaleString()}/mo
        </span>
      ),
    },
    {
      id: "capacity",
      header: "Capacity",
      cell: (row) => (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {row.bedrooms != null ? (
            <>
              <span className="flex items-center gap-1">
                <Bed className="h-3.5 w-3.5" /> {row.bedrooms}
              </span>
              {row.bathrooms != null && (
                <span className="flex items-center gap-1">
                  <Bath className="h-3.5 w-3.5" /> {row.bathrooms}
                </span>
              )}
            </>
          ) : (
            <span className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" /> {row.capacity}
            </span>
          )}
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      cell: (row) => (
        <Badge variant="secondary" className="font-medium">
          {row.categoryName ?? "Uncategorized"}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) =>
        row.status ? <StatusBadge status={row.status} /> : <span className="text-muted-foreground/40">—</span>,
    },
    {
      id: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
            asChild
          >
            <Link href={`/item/${row.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
            asChild
          >
            <Link href={`/edit-item/${row.id}`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            onClick={() => onDelete(row.id, row.title)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ListingsPage() {
  const [listings, setListings] = useState<AssetListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyAssets({
        pageNumber: page,
        pageSize,
        searchText: search || undefined,
      });
      setListings(res.result as AssetListItem[]);
      setTotalCount(res.totalCount);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleDelete = useCallback(async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await deleteAsset(id);
      toast.success("Listing deleted.");
      if (listings.length === 1 && page > 0) setPage((p) => p - 1);
      else fetchListings();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }, [listings.length, page, fetchListings]);

  const columns = useMemo(() => buildColumns(handleDelete), [handleDelete]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Listings</h1>
          <p className="text-muted-foreground mt-1">
            View, edit, or remove your property listings.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setDrawerOpen(true)}>
          <Plus className="h-4 w-4" /> List New Item
        </Button>
      </div>

      {/* Search toolbar */}
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or address…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline">Search</Button>
        {search && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => { setSearch(""); setSearchInput(""); setPage(0); }}
          >
            Clear
          </Button>
        )}
      </form>

      <ListingFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSuccess={fetchListings}
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={listings}
        rowKey={(row) => row.id}
        loading={loading}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(0); }}
        entityLabel="properties"
        emptyState={
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageIcon className="h-10 w-10 opacity-30" />
            <p className="font-medium">No listings found</p>
            <Link href="/list-item" className="text-primary text-sm font-medium hover:underline">
              Create your first listing
            </Link>
          </div>
        }
      />
    </div>
  );
}
