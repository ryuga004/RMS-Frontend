import Link from "next/link";
import { Check, Home as HomeIcon, User, MessageSquare, TrendingUp, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navigation Bar — minimal */}
      <header className="border-b border-secondary bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-sm font-bold text-primary-foreground">
              A
            </div>
            AssertRent
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-primary hover:bg-primary/90">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/20 px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
                Smart Asset Renting,
                <span className="block text-primary">Made Simple</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-xl text-foreground/70">
                Connect landlords and renters. Manage assets effortlessly. Build trust through transparency.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
              <Link href="/register?role=landlord" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-base">
                  I'm a Landlord
                </Button>
              </Link>
              <Link href="/register?role=tenant" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/5 text-base">
                  I'm a Tenant
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Overview */}
        <section className="bg-background px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Why Choose AssertRent?</h2>
              <p className="mt-4 text-foreground/60">Everything you need for seamless rental management</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: Shield,
                  title: "Secure & Trusted",
                  description: "Industry-leading security with verified profiles and transparent history."
                },
                {
                  icon: TrendingUp,
                  title: "Maximize Returns",
                  description: "Smart pricing tools and analytics to help landlords optimize earnings."
                },
                {
                  icon: MessageSquare,
                  title: "Direct Communication",
                  description: "Built-in messaging for seamless landlord-tenant conversations."
                },
              ].map((feature) => (
                <div key={feature.title} className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-foreground/60">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Two Personas */}
        <section className="bg-secondary/30 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-16 text-center text-3xl font-bold text-foreground sm:text-4xl">Perfect For Everyone</h2>

            <div className="grid gap-12 lg:grid-cols-2">
              {/* Landlords */}
              <div className="rounded-lg border border-secondary bg-background p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <HomeIcon className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">For Landlords & Owners</h3>
                <p className="mt-3 text-foreground/70">Manage your rental portfolio with ease. List properties, track tenants, and optimize your earnings.</p>

                <ul className="mt-6 space-y-3">
                  {[
                    "Create and manage listings",
                    "Screen and verify tenants",
                    "Track payments & documents",
                    "View tenant history & ratings",
                    "Analytics & earnings reports"
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{item}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register?role=landlord" className="mt-8 block">
                  <Button size="lg" className="w-full bg-primary hover:bg-primary/90">
                    Start Listing
                  </Button>
                </Link>
              </div>

              {/* Tenants */}
              <div className="rounded-lg border border-secondary bg-background p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <User className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">For Tenants & Renters</h3>
                <p className="mt-3 text-foreground/70">Find your perfect rental. Browse curated listings, connect with landlords, and secure your rental.</p>

                <ul className="mt-6 space-y-3">
                  {[
                    "Browse verified listings",
                    "Filter by location & amenities",
                    "Message landlords directly",
                    "View complete rental terms",
                    "Secure booking & payments"
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{item}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register?role=tenant" className="mt-8 block">
                  <Button size="lg" className="w-full bg-primary hover:bg-primary/90">
                    Start Browsing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Get Started Section */}
        <section className="bg-gradient-to-b from-background to-secondary/20 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground sm:text-5xl">Get Started</h2>
              <p className="mt-4 text-lg text-foreground/60">
                Join as a landlord or tenant and start managing your rentals today
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Link href="/register?role=landlord">
                <div className="group cursor-pointer rounded-lg border border-secondary p-8 transition-all hover:border-primary/30 hover:shadow-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    📋
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">List Properties</h3>
                  <p className="text-foreground/60 mb-6">
                    Become a landlord and start earning by listing your properties on AssertRent
                  </p>
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Sign Up as Landlord
                  </Button>
                </div>
              </Link>

              <Link href="/register?role=tenant">
                <div className="group cursor-pointer rounded-lg border border-secondary p-8 transition-all hover:border-primary/30 hover:shadow-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    🔑
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Find Rentals</h3>
                  <p className="text-foreground/60 mb-6">
                    Browse verified listings and find your perfect rental property
                  </p>
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Sign Up as Tenant
                  </Button>
                </div>
              </Link>
            </div>

            <div className="mt-12 text-center">
              <p className="text-foreground/60">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* Explore Section */}
        <section className="bg-background px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground sm:text-5xl">Explore</h2>
              <p className="mt-4 text-lg text-foreground/60">
                Browse available properties and discover what's available
              </p>
            </div>

            <div className="text-center">
              <Link href="/browse">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-base px-8">
                  Browse All Properties
                </Button>
              </Link>
              <p className="mt-6 text-sm text-foreground/50">
                No account needed to browse. Create one when you find something you like.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-secondary bg-secondary/20 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-4 mb-8">
            <div>
              <div className="flex items-center gap-2 font-display font-bold text-foreground mb-4">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs text-primary-foreground">
                  A
                </div>
                AssertRent
              </div>
              <p className="text-sm text-foreground/60">Making rental management simple and secure.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">For Landlords</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><Link href="#" className="hover:text-primary">List Property</Link></li>
                <li><Link href="#" className="hover:text-primary">Pricing</Link></li>
                <li><Link href="#" className="hover:text-primary">Tools</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">For Tenants</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><Link href="#" className="hover:text-primary">Browse</Link></li>
                <li><Link href="#" className="hover:text-primary">How It Works</Link></li>
                <li><Link href="#" className="hover:text-primary">Safety</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><Link href="#" className="hover:text-primary">About</Link></li>
                <li><Link href="#" className="hover:text-primary">Privacy</Link></li>
                <li><Link href="#" className="hover:text-primary">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-secondary pt-8">
            <p className="text-center text-sm text-foreground/50">
              © 2024 AssertRent. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
