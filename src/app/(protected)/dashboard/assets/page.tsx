"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreHorizontal,
  Plus,
  Eye,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  ImageIcon
} from "lucide-react";
import { getMyAssets, deleteAsset } from "@/lib/api/assets";
import { getApiErrorMessage } from "@/lib/api";
import type { AssetListItem } from "@/types";
import { toast } from "sonner";

export default function ListingsPage() {
  const [listings, setListings] = useState<AssetListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyAssets({
        pageNumber: page,
        pageSize: pageSize,
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

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await deleteAsset(id);
      toast.success("Listing deleted.");
      if (listings.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        fetchListings();
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Listings</h1>
          <p className="text-muted-foreground">
            Manage your assets, edit details, or remove listings easily from the table below.
          </p>
        </div>
        <Button className="gap-2" asChild>
          <Link href="/dashboard/assets/new">
            <Plus className="h-4 w-4" /> List New Item
          </Link>
        </Button>
      </div>

      {loading && listings.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-center text-muted-foreground shadow-sm">
           <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
           <p className="font-medium">Loading your listings...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[80px] text-center">Thumbnail</TableHead>
                  <TableHead className="min-w-[200px]">Item Details</TableHead>
                  <TableHead>Rent</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
                        <p>No listings found.</p>
                        <Link href="/dashboard/assets/new" className="text-primary font-medium hover:underline mt-1 hover:text-primary/90">
                          Create your first listing
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  listings.map((listing) => (
                    <TableRow key={listing.id} className="group transition-colors hover:bg-secondary/10">
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          {listing.imageUrl ? (
                            <img
                              src={listing.imageUrl}
                              alt={listing.title}
                              className="h-12 w-16 rounded-md object-cover border border-border/50 shadow-sm transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-12 w-16 rounded-md bg-secondary/60 border border-border/50 flex items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="line-clamp-1 font-semibold text-foreground">{listing.title}</span>
                          <span className="text-xs text-muted-foreground font-mono mt-0.5">ID: #{listing.id}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-[15px]">${Number(listing.rent)}/mo</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{listing.capacity}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary/30">
                          {listing.categoryName ?? "Uncategorized"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="gap-2.5 cursor-pointer font-medium" asChild>
                              <Link href={`/dashboard/assets/${listing.id}`}>
                                <Edit className="h-4 w-4 text-blue-500" /> Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2.5 cursor-pointer font-medium" asChild>
                              <Link href={`/browse/${listing.id}`}>
                                <Eye className="h-4 w-4 text-green-500" /> View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="gap-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer font-medium"
                              onClick={() => handleDelete(listing.id, listing.title)}
                            >
                              <Trash2 className="h-4 w-4" /> Delete
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

          {totalCount > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-2 pt-2 gap-4">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{page * pageSize + 1}</span> to{" "}
                <span className="font-medium text-foreground">{Math.min((page + 1) * pageSize, totalCount)}</span> of{" "}
                <span className="font-medium text-foreground">{totalCount}</span> entries
              </div>
              <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-muted-foreground">Rows per page</p>
                  <Select
                    value={`${pageSize}`}
                    onValueChange={(value) => {
                      setPageSize(Number(value));
                      setPage(0);
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px] bg-card text-xs font-medium focus:ring-1 focus:ring-primary/40">
                      <SelectValue placeholder={pageSize} />
                    </SelectTrigger>
                    <SelectContent side="top" className="min-w-[70px]">
                      {[10, 25, 50].map((size) => (
                        <SelectItem key={size} value={`${size}`} className="text-xs">
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex w-[80px] items-center justify-center text-sm font-medium text-muted-foreground">
                  Page {page + 1} of {Math.max(1, Math.ceil(totalCount / pageSize))}
                </div>
                <div className="flex items-center space-x-1.5">
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0 border-border/60 hover:bg-secondary/60 hover:text-foreground transition-colors"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 0}
                  >
                    <span className="sr-only">Previous page</span>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0 border-border/60 hover:bg-secondary/60 hover:text-foreground transition-colors"
                    onClick={() => setPage(page + 1)}
                    disabled={(page + 1) * pageSize >= totalCount}
                  >
                    <span className="sr-only">Next page</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
