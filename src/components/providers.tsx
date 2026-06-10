"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useState } from "react";
import { Provider } from "react-redux";
import { store } from "@/lib/redux/store";
import { NotificationProvider } from "@/lib/notifications/context";

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    <NotificationProvider>
                        {children}
                    </NotificationProvider>
                    <Toaster />
                    <Sonner />
                </TooltipProvider>
            </QueryClientProvider>
        </Provider>
    );
}
