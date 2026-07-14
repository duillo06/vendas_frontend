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
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect } from "react";
import { NavLink, Outlet } from "react-router";

import { Can, useAuth } from "@/features/auth";
import { useSettings, useTenantTheme } from "@/features/settings";
import { useDashboard } from "@/features/dashboard";
import {
  OrderNotificationsBell,
  playOrderAlertSound,
  unlockOrderAlertAudio,
  useNewOrderAlerts,
  useOrderAlertSoundPreference,
} from "@/features/orders";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard.view" },
  { to: "/pedidos", label: "Pedidos", icon: ShoppingBag, permission: "orders.view" },
  { to: "/clientes", label: "Clientes", icon: Users, permission: "customers.view" },
  { to: "/produtos", label: "Produtos", icon: Package, permission: "catalog.view" },
  { to: "/categorias", label: "Categorias", icon: Layers, permission: "catalog.view" },
  { to: "/opcoes", label: "Opções", icon: ListTree, permission: "catalog.view" },
  { to: "/configuracoes", label: "Configurações", icon: Settings, permission: "settings.manage" },
] as const;

export function BackofficeLayout() {
  const { user, tenant, logout } = useAuth();
  const { data: settings } = useSettings();
  const { data: dashboard } = useDashboard();
  const { enabled: soundEnabled, setSoundEnabled } = useOrderAlertSoundPreference();
  const orderAlerts = useNewOrderAlerts(dashboard?.recent_orders, { soundEnabled });

  useTenantTheme(settings?.settings.theme);

  // browser só libera áudio depois de gesto — destrava no primeiro toque
  useEffect(() => {
    if (!soundEnabled) return;
    const unlock = () => {
      void unlockOrderAlertAudio();
      window.removeEventListener("pointerdown", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, [soundEnabled]);

  const logoUrl = settings?.company.logo_url;
  const pendingOrders = dashboard?.today.pending_orders ?? 0;

  async function handleSoundToggle() {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      await unlockOrderAlertAudio();
      playOrderAlertSound(); // testa + libera autoplay do browser
    }
  }

  return (
    <div className="flex min-h-screen">
      <aside className="gradient-sidebar hidden w-60 flex-col text-white shadow-xl md:flex">
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt=""
                className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-white/20"
              />
            ) : (
              <span className="sidebar-nav-icon flex h-10 w-10 items-center justify-center rounded-xl">
                <Sparkles className="h-5 w-5" />
              </span>
            )}
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
                      ? "sidebar-nav-link-active"
                      : "text-white/70 hover:bg-white/5 hover:text-white",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                        isActive ? "sidebar-nav-icon-active" : "sidebar-nav-icon",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                    </span>
                    <span className="flex flex-1 items-center justify-between gap-2">
                      {item.label}
                      {item.to === "/pedidos" && pendingOrders > 0 ? (
                        <span className="sidebar-nav-badge rounded-full px-2 py-0.5 text-xs font-bold tabular-nums">
                          {pendingOrders > 99 ? "99+" : pendingOrders}
                        </span>
                      ) : null}
                    </span>
                  </>
                )}
              </NavLink>
            </Can>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
            <p className="truncate text-sm font-medium">{user ? `${user.first_name} ${user.last_name}` : ""}</p>
            <p className="truncate text-xs text-white/70">{user?.email}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start gap-2 text-white/80 hover:bg-white/5 hover:text-white"
            onClick={() => void handleSoundToggle()}
            aria-pressed={soundEnabled}
            title={soundEnabled ? "Desligar som de novos pedidos" : "Ligar som de novos pedidos"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {soundEnabled ? "Som de pedidos" : "Som mutado"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-1 w-full justify-start gap-2 text-white/80 hover:bg-white/5 hover:text-white"
            onClick={() => void logout()}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      <div className="app-shell-backoffice flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-[hsl(var(--border))] bg-white/70 px-4 py-3 backdrop-blur md:justify-end md:px-6">
          <div className="flex min-w-0 items-center gap-2 md:hidden">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" />
            ) : null}
            <span className="truncate font-bold text-brand">{tenant?.trade_name ?? "Food Service"}</span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <OrderNotificationsBell
              notifications={orderAlerts.notifications}
              unreadCount={orderAlerts.unreadCount}
              markAsRead={orderAlerts.markAsRead}
              markAllAsRead={orderAlerts.markAllAsRead}
              clearAll={orderAlerts.clearAll}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => void handleSoundToggle()}
              aria-pressed={soundEnabled}
              aria-label={soundEnabled ? "Desligar som de novos pedidos" : "Ligar som de novos pedidos"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="md:hidden"
              onClick={() => void logout()}
            >
              Sair
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
