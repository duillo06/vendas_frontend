import {
  LayoutDashboard,
  Layers,
  ListTree,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Sparkles,
  Users,
} from "lucide-react";
import { NavLink, Outlet } from "react-router";

import { Can, useAuth } from "@/features/auth";
import { useSettings, useTenantTheme } from "@/features/settings";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard.view", tile: "tile-chart-1" },
  { to: "/pedidos", label: "Pedidos", icon: ShoppingBag, permission: "orders.view", tile: "tile-chart-3" },
  { to: "/clientes", label: "Clientes", icon: Users, permission: "customers.view", tile: "tile-chart-4" },
  { to: "/produtos", label: "Produtos", icon: Package, permission: "catalog.view", tile: "tile-chart-2" },
  { to: "/categorias", label: "Categorias", icon: Layers, permission: "catalog.view", tile: "tile-chart-4" },
  { to: "/opcoes", label: "Opções", icon: ListTree, permission: "catalog.view", tile: "tile-chart-3" },
  { to: "/configuracoes", label: "Configurações", icon: Settings, permission: "settings.manage", tile: "tile-chart-2" },
] as const;

export function BackofficeLayout() {
  const { user, tenant, logout } = useAuth();
  const { data: settings } = useSettings();

  useTenantTheme(settings?.settings.theme);

  return (
    <div className="flex min-h-screen">
      <aside className="gradient-sidebar hidden w-60 flex-col text-white shadow-xl md:flex">
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-bold tracking-tight">Food Service</p>
              <p className="truncate text-xs text-white/75">{tenant?.trade_name ?? "Backoffice"}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <Can key={item.to} permission={item.permission}>
              <NavLink
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-white/15 text-white shadow-lg ring-1 ring-white/20"
                      : "text-white/75 hover:bg-white/10 hover:text-white",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                        isActive ? "bg-white/20" : item.tile,
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                    </span>
                    {item.label}
                  </>
                )}
              </NavLink>
            </Can>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="rounded-xl bg-white/10 px-3 py-2">
            <p className="truncate text-sm font-medium">{user ? `${user.first_name} ${user.last_name}` : ""}</p>
            <p className="truncate text-xs text-white/70">{user?.email}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start gap-2 text-white/80 hover:bg-white/10 hover:text-white"
            onClick={() => void logout()}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      <div className="app-shell-backoffice flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[hsl(var(--border))] bg-white/70 px-4 py-3 backdrop-blur md:hidden">
          <span className="font-bold text-brand">Food Service</span>
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
