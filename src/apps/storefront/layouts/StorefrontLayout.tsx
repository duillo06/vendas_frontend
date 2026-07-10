import { Home, UtensilsCrossed, User } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router";

import { CartNavButton } from "@/features/cart";
import { useCompanyPublic } from "@/features/company";
import { useCustomerAuth } from "@/features/customer-auth";
import { useTenantTheme } from "@/features/settings";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

const navLinks = [
  { to: "/", label: "Início", icon: Home },
  { to: "/cardapio", label: "Cardápio", icon: UtensilsCrossed },
] as const;

function StoreStatusBadge({ isOpen }: { isOpen: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 shadow-sm",
        isOpen
          ? "border-brand bg-brand-soft text-brand"
          : "hint-accent text-brand-accent",
      )}
    >
      <span
        className={cn("h-2 w-2 rounded-full", isOpen ? "bg-brand animate-pulse" : "bg-[hsl(var(--accent))]")}
        aria-hidden
      />
      {isOpen ? "Aberto" : "Fechado"}
    </Badge>
  );
}

export function StorefrontLayout() {
  const { data: company, isLoading: loadingCompany } = useCompanyPublic();
  const { isAuthenticated, isLoading: loadingAuth } = useCustomerAuth();

  useTenantTheme(company?.theme);

  return (
    <div className="app-shell-storefront min-h-screen">
      <header className="sticky top-0 z-40 border-b border-brand-soft bg-white/85 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="group flex min-w-0 items-center gap-3">
            {company?.logo_url ? (
              <img
                src={company.logo_url}
                alt=""
                className="h-10 w-10 rounded-xl object-cover ring-2 ring-[hsl(var(--primary)/0.15)] transition group-hover:ring-[hsl(var(--primary)/0.35)]"
              />
            ) : (
              <span className="gradient-hero flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold shadow-md">
                {company?.trade_name?.charAt(0) ?? "F"}
              </span>
            )}
            <div className="min-w-0">
              {loadingCompany ? (
                <Skeleton className="h-5 w-32" />
              ) : (
                <span className="block truncate text-lg font-bold tracking-tight">{company?.trade_name ?? "Food Service"}</span>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {!loadingCompany && company ? <StoreStatusBadge isOpen={company.is_open} /> : null}

            <nav className="hidden items-center gap-1 sm:flex">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all",
                      isActive
                        ? "bg-brand shadow-md shadow-[hsl(var(--primary)/0.3)]"
                        : "text-[hsl(var(--muted-foreground))] hover:bg-brand-soft hover:text-brand",
                    )
                  }
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {!loadingAuth ? (
              <Link to={isAuthenticated ? "/conta" : "/entrar"}>
                <Button type="button" variant="outline" size="sm" className="gap-2 border-brand-soft bg-brand-soft/50 hover:bg-brand-soft">
                  <User className="h-4 w-4 text-brand" />
                  <span className="hidden sm:inline">{isAuthenticated ? "Minha conta" : "Entrar"}</span>
                </Button>
              </Link>
            ) : null}

            <CartNavButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-4 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
