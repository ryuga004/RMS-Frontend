"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getTenants, removeTenant } from "@/lib/api/tenancy";
import { getMyAssets } from "@/lib/api/assets";
import { getApiErrorMessage } from "@/lib/api";
import type { TenantListItemResponse, AssetListItem } from "@/types";
import { toast } from "sonner";
import { 
  MoreHorizontal, 
  Search, 
  UserPlus, 
  UserMinus, 
  Eye, 
  Building2, 
  Users, 
  Filter, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  User as UserIcon
} from "lucide-react";
import Link from "next/link";

export default function TenantsPage() {
  const [tenants, setTenants] = useState<TenantListItemResponse[]>([]);
  const [assets, setAssets] = useState<AssetListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [page, setPage] = useState(0);
  const [limit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [selectedAssetId, setSelectedAssetId] = useState<string>("all");

  const fetchAssets = useCallback(async () => {
    try {
      const data = await getMyAssets({ pageSize: 100 });
      setAssets(data.result);
    } catch (err) {
      console.error("Failed to fetch assets for filter", err);
    }
  }, []);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      const assetIds = selectedAssetId !== "all" ? [Number(selectedAssetId)] : undefined;
      const data = await getTenants({
        page,
        limit,
        searchText,
        assetIds
      });
      setTenants(data.result);
      setTotalCount(data.totalCount);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchText, selectedAssetId]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTenants();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchTenants]);

  const handleRemoveTenant = async (assetId: number, userId: number) => {
    if (!confirm("Are you sure you want to remove this tenant? This action cannot be undone.")) return;
    
    try {
      await removeTenant(assetId, userId);
      toast.success("Tenant removed successfully.");
      fetchTenants();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Tenants</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all active tenants across your assets.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="gap-2">
                <Link href="/dashboard/requests">
                    <UserPlus className="w-4 h-4" />
                    Review Requests
                </Link>
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-1 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    Total Tenants
                </CardTitle>
                <div className="text-2xl font-bold">{totalCount}</div>
            </CardHeader>
        </Card>
        
        <div className="md:col-span-3 flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1 w-full relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search by tenant name or asset title..." 
                    className="pl-9 bg-background/50 border-border/50"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>
            
            <div className="w-full md:w-64">
                <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                    <SelectTrigger className="bg-background/50 border-border/50 text-muted-foreground">
                        <div className="flex items-center gap-2 truncate">
                            <Building2 className="w-4 h-4" />
                            <SelectValue placeholder="All Assets" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Assets</SelectItem>
                        {assets.map((asset) => (
                            <SelectItem key={asset.id} value={asset.id.toString()}>
                                {asset.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 text-muted-foreground"
                onClick={() => {
                    setSearchText("");
                    setSelectedAssetId("all");
                    setPage(0);
                }}
            >
                <Filter className="w-4 h-4" />
            </Button>
        </div>
      </div>

      <Card className="border-border/50 overflow-hidden bg-card/30 backdrop-blur-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="w-[300px]">Tenant</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell colSpan={4} className="h-16 bg-muted/20" />
                  </TableRow>
                ))
              ) : tenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    No tenants found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                tenants.map((tenant) => (
                  <TableRow key={`${tenant.assetId}-${tenant.tenantUserId}`} className="group hover:bg-muted/30 border-border/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border/50">
                          <AvatarImage src={`https://avatar.vercel.sh/${tenant.tenantEmail}`} />
                          <AvatarFallback>
                            <UserIcon className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
                            {tenant.tenantName}
                          </span>
                          <span className="text-xs text-muted-foreground leading-tight mt-0.5">
                            ID: {tenant.tenantUserId}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-muted-foreground">
                      {tenant.tenantEmail}
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col">
                            <Badge variant="outline" className="w-fit border-border/50 bg-background/50 font-medium">
                                <Building2 className="w-3 h-3 mr-1" />
                                {tenant.assetTitle}
                            </Badge>
                        </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-xl border-border/50 p-1">
                          <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground/70 px-2 py-1.5 tracking-wider">
                            Actions
                          </DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/profile/${tenant.tenantUserId}`} className="flex items-center gap-2 cursor-pointer">
                              <Eye className="h-4 w-4 text-blue-500" />
                              <span>View Profile</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border/50 mx-1" />
                          <DropdownMenuItem 
                            className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                            onClick={() => handleRemoveTenant(tenant.assetId, tenant.tenantUserId)}
                          >
                            <UserMinus className="h-4 w-4" />
                            <span>Remove Tenant</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{tenants.length}</span> of <span className="font-medium">{totalCount}</span> tenants
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center justify-center text-sm font-medium">
              Page {page + 1} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
