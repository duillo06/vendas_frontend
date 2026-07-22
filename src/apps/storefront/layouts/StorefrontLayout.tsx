import { Heart, Home, Share2, User } from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { toast } from "sonner";

import { CartNavButton } from "@/features/cart";
import { useCompanyPublic } from "@/features/company";
import { useCustomerAuth } from "@/features/customer-auth";
import { useFavorites } from "@/features/favorites";
import { useTenantTheme } from "@/features/settings";
import {
  shouldShowBottomNav,
  StorefrontBottomNav,
} from "@/features/storefront/components/StorefrontBottomNav";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { storefrontCopy } from "@/shared/copy/storefront";
import { resolveMediaUrl } from "@/shared/lib/media";
import { cn } from "@/shared/lib/utils";

function HeaderIconButton({
  label,
  to,
  onClick,
  children,
  badge,
}: {
  label: string;
  to?: string;
  onClick?: () => void;
  children: React.ReactNode;
  badge?: number;
}) {
  const className =
    "relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-white text-[hsl(var(--foreground))] shadow-[var(--shadow-xs)] transition active:scale-95 hover:bg-[hsl(var(--muted))]";

  const inner = (
    <>
      {children}
      {badge && badge > 0 ? (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-[hsl(var(--primary-foreground))]">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </>
  );

  if (to) {
    return (
      <Link to={to} aria-label={label} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" aria-label={label} className={className} onClick={onClick}>
      {inner}
    </button>
  );
}

export function StorefrontLayout() {
  const { data: company, isLoading: loadingCompany } = useCompanyPublic();
  const { isAuthenticated, isLoading: loadingAuth } = useCustomerAuth();
  const { favorites } = useFavorites();
  const location = useLocation();
  const showBottomNav = shouldShowBottomNav(location.pathname);

  useTenantTheme(company?.theme);

  async function handleShare() {
    const url = window.location.origin + "/";
    const title = company?.trade_name ?? "Cardápio";
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success(storefrontCopy.nav.linkCopied);
    } catch {
      /* cancelou share */
    }
  }

  return (
    <div className="app-shell-storefront min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]/92 shadow-[var(--shadow-xs)] backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5">
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
            <nav className="hidden items-center gap-1 md:flex">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  cn(
                    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[hsl(var(--primary-soft))] text-brand"
                      : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]",
                  )
                }
              >
                <Home className="h-4 w-4" />
                Início
              </NavLink>
              <NavLink
                to="/buscar"
                className={({ isActive }) =>
                  cn(
                    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[hsl(var(--primary-soft))] text-brand"
                      : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]",
                  )
                }
              >
                Buscar
              </NavLink>
            </nav>

            <HeaderIconButton
              label={storefrontCopy.nav.favorites}
              to="/favoritos"
              badge={favorites.length}
            >
              <Heart className={cn("h-4 w-4", favorites.length > 0 && "fill-brand text-brand")} />
            </HeaderIconButton>

            <HeaderIconButton label={storefrontCopy.nav.share} onClick={() => void handleShare()}>
              <Share2 className="h-4 w-4" />
            </HeaderIconButton>

            {!loadingAuth ? (
              <Link to={isAuthenticated ? "/conta" : "/entrar"} className="hidden sm:block">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 border-[hsl(var(--border))] bg-white hover:bg-[hsl(var(--muted))]"
                >
                  <User className="h-4 w-4 text-brand" />
                  <span>{isAuthenticated ? "Minha conta" : "Entrar"}</span>
                </Button>
              </Link>
            ) : null}

            <CartNavButton />
          </div>
        </div>
      </header>

      <main
        className={cn(
          "mx-auto max-w-5xl px-4 py-4 sm:py-6",
          showBottomNav && "pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))]",
        )}
      >
        <Outlet />
      </main>

      {showBottomNav ? <StorefrontBottomNav /> : null}
    </div>
  );
}
