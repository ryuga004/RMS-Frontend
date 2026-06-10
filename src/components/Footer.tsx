import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs text-primary-foreground">
                R
              </span>
              Rentify
            </Link>
            <p className="text-xs text-muted-foreground opacity-80">
              Professional asset renting management system.
            </p>
          </div>
          <div className="flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="/browse" className="hover:text-foreground transition-colors">Browse</Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-4 text-center text-[10px] uppercase tracking-widest text-muted-foreground/60">
          © {new Date().getFullYear()} Rentify Enterprise. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
