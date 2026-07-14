import { Home, UtensilsCrossed, User } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router";

import { CartNavButton } from "@/features/cart";
import { useCompanyPublic } from "@/features/company";
import { useCustomerAuth } from "@/features/customer-auth";
import { useTenantTheme } from "@/features/settings";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { resolveMediaUrl } from "@/shared/lib/media";
import { cn } from "@/shared/lib/utils";

const navLinks = [
  { to: "/", label: "Início", icon: Home },
  { to: "/cardapio", label: "Cardápio", icon: UtensilsCrossed },
] as const;

export function StorefrontLayout() {
  const { data: company, isLoading: loadingCompany } = useCompanyPublic();
  const { isAuthenticated, isLoading: loadingAuth } = useCustomerAuth();

  useTenantTheme(company?.theme);

  return (
    <div className="app-shell-storefront min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]/92 shadow-[var(--shadow-xs)] backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2.5">
          <Link to="/" className="group flex min-w-0 items-center gap-2.5">
            {company?.logo_url ? (
              <div className="logo-frame h-9 w-9">
                <img
                  src={resolveMediaUrl(company.logo_url)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="logo-frame h-9 w-9 text-sm font-bold text-brand">
                {company?.trade_name?.charAt(0) ?? "F"}
              </div>
            )}
            <div className="min-w-0">
              {loadingCompany ? (
                <Skeleton className="h-5 w-32" />
              ) : (
                <span className="block truncate text-base font-semibold tracking-tight">
                  {company?.trade_name ?? "Food Service"}
                </span>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <nav className="hidden items-center gap-1 sm:flex">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[hsl(var(--primary-soft))] text-brand"
                        : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]",
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 border-[hsl(var(--border))] bg-white hover:bg-[hsl(var(--muted))]"
                >
                  <User className="h-4 w-4 text-brand" />
                  <span className="hidden sm:inline">{isAuthenticated ? "Minha conta" : "Entrar"}</span>
                </Button>
              </Link>
            ) : null}

            <CartNavButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-4 sm:py-6">
        <Outlet />
      </main>
    </div>
  );
}
