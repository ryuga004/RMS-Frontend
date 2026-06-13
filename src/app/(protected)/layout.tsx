"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import type { RootState } from "@/lib/redux/store";
import { matchProtectedRoute } from "@/constants/protected-routes";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    const route = matchProtectedRoute(pathname);
    if (route && !route.requiredPrivileges.includes(user.roleId as any)) {
      router.replace(route.redirectTo ?? "/dashboard");
    }
  }, [mounted, isAuthenticated, user, pathname, router]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const route = matchProtectedRoute(pathname);
  if (route && !route.requiredPrivileges.includes(user.roleId as any)) return null;

  return <>{children}</>;
}
