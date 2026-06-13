"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import Link from "next/link";
import {
  FolderOpen,
  Users,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isAdmin } from "@/types";
import { getMyAssets, getMyRentals } from "@/lib/api/assets";
import { getTenants } from "@/lib/api/tenancy";

type DashboardStats = {
  listings: number | null;
  tenants: number | null;
  rentals: number | null;
};

const INITIAL_STATS: DashboardStats = {
  listings: null,
  tenants: null,
  rentals: null,
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(INITIAL_STATS);
  const { user } = useSelector((state: RootState) => state.auth);
  const admin = user ? isAdmin(user.roleId) : false;
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!user || fetchedRef.current) return;
    fetchedRef.current = true;

    if (admin) {
      Promise.allSettled([
        getMyAssets({ pageNumber: 0, pageSize: 1 }),
        getTenants({ page: 0, limit: 1 }),
      ]).then(([assetsRes, tenantsRes]) => {
        setStats((prev) => ({
          ...prev,
          listings: assetsRes.status === "fulfilled" ? assetsRes.value.totalCount : 0,
          tenants: tenantsRes.status === "fulfilled" ? tenantsRes.value.totalCount : 0,
        }));
      });
    } else {
      getMyRentals().then((rentals) => {
        setStats((prev) => ({
          ...prev,
          rentals: rentals.length,
        }));
      });
    }
  }, [user, admin]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.name || "User"}</h1>
        <p className="mt-2 text-foreground/60">
          {admin
            ? "Manage your properties and track transactions"
            : "View your active rentals and payment history"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {admin ? (
          <>
            <StatsCard
              title="Listings"
              value={stats.listings}
              icon={FolderOpen}
              href="/dashboard/assets"
              description="Active properties"
            />
            <StatsCard
              title="Tenants"
              value={stats.tenants}
              icon={Users}
              href="/dashboard/tenants"
              description="Current tenants"
            />
            <StatsCard
              title="Transactions"
              value={null}
              icon={CreditCard}
              href="/dashboard/transactions"
              description="View history"
            />
          </>
        ) : (
          <>
            <StatsCard
              title="Active Rentals"
              value={stats.rentals}
              icon={FolderOpen}
              href="/dashboard/rentals"
              description="Your rentals"
            />
            <StatsCard
              title="Payment History"
              value={null}
              icon={CreditCard}
              href="/dashboard/transactions"
              description="All transactions"
            />
            <StatsCard
              title="Payment Methods"
              value={null}
              icon={CreditCard}
              href="/dashboard/payment-plans"
              description="Manage payments"
            />
          </>
        )}
      </div>

      {/* Quick Navigation */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Navigate</CardTitle>
          <CardDescription>Quick access to main sections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {admin ? (
              <>
                <NavLink href="/dashboard/assets" label="View Listings" />
                <NavLink href="/dashboard/tenants" label="Manage Tenants" />
                <NavLink href="/dashboard/transactions" label="View Transactions" />
                <NavLink href="/dashboard/payment-plans" label="Payment Settings" />
              </>
            ) : (
              <>
                <NavLink href="/dashboard/rentals" label="My Rentals" />
                <NavLink href="/dashboard/transactions" label="Payment History" />
                <NavLink href="/dashboard/payment-plans" label="Payment Methods" />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon: Icon,
  href,
  description,
}: {
  title: string;
  value: number | null;
  icon: React.ElementType;
  href: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <Card className="cursor-pointer transition-all hover:shadow-card hover:border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium text-foreground/70">{title}</CardTitle>
            <Icon className="h-5 w-5 text-primary/60" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {value === null ? (
            <div className="h-8 w-20 animate-pulse rounded bg-secondary" />
          ) : (
            <div className="text-3xl font-bold text-foreground">{value}</div>
          )}
          <p className="text-xs text-foreground/50">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href}>
      <div className="group flex items-center justify-between rounded-lg border border-secondary p-3 transition-colors hover:bg-secondary/50 hover:border-primary/30">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <ArrowRight className="h-4 w-4 text-foreground/40 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
