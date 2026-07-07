import { LayoutDashboard, LogOut, Package, Settings, ShoppingBag } from "lucide-react";
import { NavLink, Outlet } from "react-router";

import { Can, useAuth } from "@/features/auth";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard.view" },
  { to: "/pedidos", label: "Pedidos", icon: ShoppingBag, permission: "orders.view" },
  { to: "/produtos", label: "Produtos", icon: Package, permission: "catalog.view" },
  { to: "/configuracoes", label: "Configurações", icon: Settings, permission: "settings.manage" },
] as const;

export function BackofficeLayout() {
  const { user, tenant, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--muted))] md:flex">
        <div className="border-b border-[hsl(var(--border))] p-4">
          <p className="font-semibold text-[hsl(var(--primary))]">Food Service</p>
          <p className="mt-1 truncate text-xs text-[hsl(var(--muted-foreground))]">
            {tenant?.trade_name ?? "Backoffice"}
          </p>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <Can key={item.to} permission={item.permission}>
              <NavLink
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[hsl(var(--background))] text-[hsl(var(--primary))] shadow-sm"
                      : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--background))]/60 hover:text-[hsl(var(--foreground))]",
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            </Can>
          ))}
        </nav>

        <div className="border-t border-[hsl(var(--border))] p-3">
          <p className="truncate px-3 text-xs text-[hsl(var(--muted-foreground))]">
            {user ? `${user.first_name} ${user.last_name}` : ""}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-1 w-full justify-start gap-2"
            onClick={() => void logout()}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-3 md:hidden">
          <span className="font-semibold text-[hsl(var(--primary))]">Food Service</span>
          <Button type="button" variant="outline" size="sm" onClick={() => void logout()}>
            Sair
          </Button>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
