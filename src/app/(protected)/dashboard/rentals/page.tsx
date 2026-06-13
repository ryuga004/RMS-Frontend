"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { MoreHorizontal, ExternalLink, Building2, User, Wallet } from "lucide-react";
import { getMyRentals } from "@/lib/api/assets";
import { getApiErrorMessage } from "@/lib/api";
import type { AssetListItem } from "@/types";
import { toast } from "sonner";

export default function RentalsPage() {
    const [rentals, setRentals] = useState<AssetListItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRentals = async () => {
        setLoading(true);
        try {
            const data = await getMyRentals();
            setRentals(data);
        } catch (err) {
            toast.error(getApiErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRentals();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">My Rentals</h1>
                    <p className="text-muted-foreground mt-1">Manage and track your currently active rentals.</p>
                </div>
                <Button asChild className="w-fit">
                    <Link href="/browse">Browse More Items</Link>
                </Button>
            </div>

            <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 border-border/50">
                            <TableHead className="w-[350px]">Asset</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Monthly Rent</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i} className="animate-pulse border-border/50">
                                    <TableCell colSpan={5} className="h-20 bg-muted/20" />
                                </TableRow>
                            ))
                        ) : rentals.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-3 py-12">
                                        <Building2 className="h-12 w-12 text-muted-foreground opacity-20" />
                                        <p className="text-muted-foreground font-medium text-lg">No active rentals found.</p>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href="/browse">Start Browsing</Link>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : rentals.map((rental) => (
                            <TableRow key={rental.id} className="group transition-colors hover:bg-muted/30 border-border/50">
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-border shadow-sm">
                                            {rental.imageUrl ? (
                                                <img
                                                    src={rental.imageUrl}
                                                    alt={rental.title}
                                                    className="object-cover w-full h-full"
                                                />
                                            ) : (
                                                <div className="bg-muted flex items-center justify-center w-full h-full text-muted-foreground">
                                                    <Building2 className="h-6 w-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">{rental.title}</span>
                                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Asset ID: {rental.id}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="bg-background/50 border-border/50 font-medium">
                                        {rental.categoryName || "Uncategorized"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                                        <Wallet className="h-3.5 w-3.5 text-green-500" />
                                        ${rental.rent?.toFixed(2)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 shadow-none border-green-500/20 px-3 py-0.5">
                                        Active
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted active:scale-95 transition-all">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-xl border-border/50 p-1">
                                            <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                                                <Link href={`/browse/${rental.id}`}>
                                                    <ExternalLink className="h-4 w-4 text-blue-500" /> 
                                                    <span>View Details</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="gap-2 cursor-pointer font-medium text-primary">
                                                <User className="h-4 w-4" />
                                                Contact Owner
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
