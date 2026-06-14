"use client";

import { useMemo, useEffect, ComponentType } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import { ROUTES } from "@/constants/routes";

function matchRoute(pathname: string) {
  return (
    ROUTES.find((r) => {
      const routeSegs = r.path.split("/");
      const pathSegs = pathname.split("/");
      return (
        routeSegs.length === pathSegs.length &&
        routeSegs.every((seg, i) => seg.startsWith("[") || seg === pathSegs[i])
      );
    }) ?? null
  );
}

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth ?? { user: null, isAuthenticated: false }
  );

  const route = useMemo(() => matchRoute(pathname), [pathname]);
  const isProtected = route !== null && route.privileges.length > 0;

  // Compute access synchronously so we never render protected content before redirect fires
  let accessGranted = !isProtected;
  if (isProtected) {
    if (isAuthenticated && user) {
      accessGranted =
        typeof user.roleId === "number" &&
        (route.privileges as readonly number[]).includes(user.roleId);
    }
  }

  useEffect(() => {
    if (!isProtected) return;
    if (!isAuthenticated || !user) {
      router.replace("/login");
    } else if (!accessGranted) {
      router.replace("/unauthorized");
    }
  }, [pathname, isAuthenticated, user?.roleId, router, isProtected, accessGranted]);

  if (!accessGranted) return null;
  return <>{children}</>;
}

export function withRouteGuard<P extends object>(Component: ComponentType<P>) {
  function GuardedComponent(props: P) {
    return (
      <RouteGuard>
        <Component {...props} />
      </RouteGuard>
    );
  }
  GuardedComponent.displayName = `withRouteGuard(${Component.displayName ?? Component.name})`;
  return GuardedComponent;
}
