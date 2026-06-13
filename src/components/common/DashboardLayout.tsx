"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  sidebar?: boolean;
  sidebarClassName?: string;
  mainClassName?: string;
}

/**
 * Common dashboard layout component that wraps sidebar + main content.
 * Automatically filters sidebar routes based on user permissions.
 */
export function DashboardLayout({
  children,
  sidebar = true,
  sidebarClassName,
  mainClassName = "flex-1 p-6",
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen">
      {sidebar && <Sidebar className={sidebarClassName} />}
      <main className={mainClassName}>{children}</main>
    </div>
  );
}
