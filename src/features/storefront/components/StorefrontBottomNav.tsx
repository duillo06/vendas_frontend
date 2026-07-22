import { Home, Package, Search, User } from "lucide-react";
import { NavLink } from "react-router";

import { storefrontCopy } from "@/shared/copy/storefront";
import { cn } from "@/shared/lib/utils";

const items = [
  { to: "/", label: storefrontCopy.nav.home, icon: Home, end: true },
  { to: "/buscar", label: storefrontCopy.nav.search, icon: Search, end: false },
  { to: "/conta/pedidos", label: storefrontCopy.nav.orders, icon: Package, end: false },
  { to: "/conta", label: storefrontCopy.nav.account, icon: User, end: true },
] as const;

/** nav do polegar — 4 itens; favoritos ficam no header */
export function StorefrontBottomNav() {
  return (
    <nav
      aria-label="Navegação principal"
      className={cn(
        "storefront-bottom-nav fixed z-40 border border-[hsl(var(--border))] bg-[hsl(var(--card))]/95 backdrop-blur-md",
        // celular: colado na base
        "inset-x-0 bottom-0 border-x-0 border-b-0 border-t",
        // pc: flutuando com respiro
        "md:inset-x-4 md:bottom-4 md:mx-auto md:max-w-lg md:rounded-2xl md:border md:shadow-[var(--shadow-lg)]",
      )}
    >
      <ul className="mx-auto flex max-w-5xl items-stretch justify-around px-1 pt-1.5 pb-[calc(0.4rem+env(safe-area-inset-bottom,0px))] md:px-2 md:pt-2 md:pb-2">
        {items.map((item) => (
          <li key={item.to} className="min-w-0 flex-1">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[10px] font-medium transition-colors sm:text-[11px]",
                  isActive
                    ? "text-brand"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn("h-5 w-5", isActive && "stroke-[2.25]")}
                    aria-hidden
                  />
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** rotas onde a barra atrapalha CTA fixo (produto/carrinho/checkout) */
export function shouldShowBottomNav(pathname: string): boolean {
  if (pathname.startsWith("/produto/")) return false;
  if (pathname === "/carrinho" || pathname === "/checkout") return false;
  if (pathname.startsWith("/pedido/")) return false;
  return true;
}
