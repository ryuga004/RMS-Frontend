import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-24">
                <div className="max-w-5xl w-full space-y-12 text-center">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-foreground">
                            Professional Asset <span className="text-primary tracking-tighter">Renting Management</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            The enterprise-grade solution for managing rentals, assets, and tenant relations.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mt-12 text-left">
                        {/* Admin Portal Card */}
                        <div className="group relative rounded-3xl border border-border bg-card p-8 shadow-card transition-all hover:shadow-card-hover hover:border-primary/20">
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                <LayoutDashboard className="h-7 w-7" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">Admin Dashboard</h2>
                            <p className="mt-4 text-muted-foreground leading-relaxed">
                                Complete control over your assets. Manage listings, monitor earnings, and track audit logs in one powerful interface.
                            </p>
                            <Link href="/dashboard" className="mt-8 flex items-center text-primary font-semibold group-hover:translate-x-1 transition-transform">
                                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </div>

                        {/* Tenant Portal Card */}
                        <div className="group relative rounded-3xl border border-border bg-card p-8 shadow-card transition-all hover:shadow-card-hover hover:border-accent/10 hover:border-primary/20">
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-foreground transition-colors group-hover:bg-secondary/80">
                                <ShoppingBag className="h-7 w-7" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">Tenant Portal</h2>
                            <p className="mt-4 text-muted-foreground leading-relaxed">
                                Access your rentals, browse new items, and manage your profile. Simple, fast, and secure renting experience.
                            </p>
                            <Link href="/browse" className="mt-8 flex items-center text-primary font-semibold group-hover:translate-x-1 transition-transform">
                                Browse Items <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
