"use client";

import Navbar from "@/components/Navbar";
import { RouteGuard } from "@/components/RouteGuard";
import { DashboardSidebar } from "@/components/dashboard/layout/DashboardSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar />
        <main className="flex-1 overflow-hidden flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 pb-12">
              <RouteGuard>{children}</RouteGuard>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
