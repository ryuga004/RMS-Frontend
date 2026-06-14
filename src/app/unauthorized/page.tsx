import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <ShieldX className="h-16 w-16 text-destructive" />
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Access Denied</h1>
        <p className="text-muted-foreground max-w-sm">
          You don&apos;t have permission to view this page.
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/browse"
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-secondary/50 transition-colors"
        >
          Browse
        </Link>
      </div>
    </div>
  );
}
