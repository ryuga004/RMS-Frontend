"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, User, Menu, X, Bell, LogOut, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/redux/store";
import { logoutAction } from "@/lib/redux/slices/authSlice";
import { useNotificationsContext } from "@/lib/notifications/context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/browse", label: "Browse" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { unreadCount } = useNotificationsContext();

  useEffect(() => { setMounted(true); }, []);

  const handleLogout = () => {
    dispatch(logoutAction());
    router.push("/");
  };

  const navLinkClass = (to: string) =>
    cn(
      "rounded px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary",
      pathname === to ? "bg-secondary text-foreground" : "text-muted-foreground"
    );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-primary text-sm text-primary-foreground">
            R
          </span>
          Rentify
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.to} href={link.to} className={navLinkClass(link.to)}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/browse">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Search className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard/messages">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard/notifications">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
              <Bell className="h-4 w-4" />
              {mounted && isAuthenticated && unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold leading-none text-primary-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </Link>

          {mounted && isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative ml-2 h-8 w-8 rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="mt-1 text-xs leading-none text-muted-foreground">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="default" size="sm" className="ml-2">Sign In</Button>
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu — CSS-driven expand */}
      <div
        className="overflow-hidden border-t border-border bg-card transition-all duration-200 ease-in-out md:hidden"
        style={{ maxHeight: mobileOpen ? "400px" : "0", opacity: mobileOpen ? 1 : 0 }}
      >
        <div className="container flex flex-col gap-2 py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              href={link.to}
              onClick={() => setMobileOpen(false)}
              className={navLinkClass(link.to)}
            >
              {link.label}
            </Link>
          ))}
          {mounted && isAuthenticated ? (
            <>
              <div className="my-1 border-t border-border" />
              <div className="px-3 py-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Button variant="ghost" className="justify-start px-3" asChild>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              </Button>
              <Button variant="ghost" className="justify-start px-3" asChild>
                <Link href="/dashboard/messages" onClick={() => setMobileOpen(false)}>Messages</Link>
              </Button>
              <Button
                variant="ghost"
                className="justify-start px-3 text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="default" size="sm" className="mt-2 w-full">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
