import { Link, Outlet } from "react-router";
import { useEffect } from "react";

import { CartNavButton } from "@/features/cart";
import { useCompanyPublic } from "@/features/company";
import { applyTenantTheme } from "@/features/settings";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

const navLinks: Array<{ to: string; label: string }> = [
  { to: "/", label: "Início" },
  { to: "/cardapio", label: "Cardápio" },
];

function StoreStatusBadge({ isOpen }: { isOpen: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5",
        isOpen
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700",
      )}
    >
      <span
        className={cn("h-2 w-2 rounded-full", isOpen ? "bg-emerald-500" : "bg-amber-500")}
        aria-hidden
      />
      {isOpen ? "Aberto" : "Fechado"}
    </Badge>
  );
}

export function StorefrontLayout() {
  const { data: company, isLoading: loadingCompany } = useCompanyPublic();

  useEffect(() => {
    applyTenantTheme(company?.theme);
  }, [company?.theme]);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <header className="sticky top-0 z-40 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            {company?.logo_url ? (
              <img src={company.logo_url} alt="" className="h-9 w-9 rounded-md object-cover" />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[hsl(var(--primary))] text-sm font-bold text-white">
                {company?.trade_name?.charAt(0) ?? "F"}
              </span>
            )}
            <div className="min-w-0">
              {loadingCompany ? (
                <Skeleton className="h-5 w-32" />
              ) : (
                <span className="block truncate text-lg font-semibold">
                  {company?.trade_name ?? "Food Service"}
                </span>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {!loadingCompany && company ? <StoreStatusBadge isOpen={company.is_open} /> : null}

            <nav className="hidden items-center gap-1 sm:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-md px-3 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <CartNavButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
