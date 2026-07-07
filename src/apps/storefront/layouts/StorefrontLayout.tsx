import { Link, NavLink, Outlet } from "react-router";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

const navLinks: Array<{ to: string; label: string; end?: boolean }> = [
  { to: "/", label: "Início", end: true },
  { to: "/cardapio", label: "Cardápio" },
  { to: "/carrinho", label: "Carrinho" },
];

export function StorefrontLayout() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <header className="sticky top-0 z-40 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="text-lg font-semibold text-[hsl(var(--primary))]">
            Food Service
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]"
                      : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <Link to="/carrinho">
            <Button variant="outline" size="sm" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Carrinho</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
