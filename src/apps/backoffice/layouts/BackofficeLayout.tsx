import {
  LayoutDashboard,
  Layers,
  ListTree,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Sparkles,
  Users,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router";

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
import { Sheet } from "@/shared/components/ui/sheet";
import { resolveMediaUrl } from "@/shared/lib/media";
import { cn } from "@/shared/lib/utils";

const SIDEBAR_COLLAPSED_KEY = "bo_sidebar_collapsed";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard.view" },
  { to: "/pedidos", label: "Pedidos", icon: ShoppingBag, permission: "orders.view" },
  { to: "/clientes", label: "Clientes", icon: Users, permission: "customers.view" },
  { to: "/produtos", label: "Produtos", icon: Package, permission: "catalog.view" },
  { to: "/categorias", label: "Categorias", icon: Layers, permission: "catalog.view" },
  { to: "/opcoes", label: "Opções", icon: ListTree, permission: "catalog.view" },
  { to: "/configuracoes", label: "Configurações", icon: Settings, permission: "settings.manage" },
] as const;

type SidebarBodyProps = {
  collapsed: boolean;
  logoUrl?: string | null;
  tradeName?: string;
  pendingOrders: number;
  userName: string;
  userEmail: string;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  onLogout: () => void;
  onNavigate?: () => void;
};

function SidebarBody({
  collapsed,
  logoUrl,
  tradeName,
  pendingOrders,
  userName,
  userEmail,
  soundEnabled,
  onSoundToggle,
  onLogout,
  onNavigate,
}: SidebarBodyProps) {
  return (
    <>
      <div className={cn("border-b border-white/10", collapsed ? "p-3" : "p-5")}>
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          {logoUrl ? (
            <img
              src={resolveMediaUrl(logoUrl)}
              alt=""
              className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-white/20"
            />
          ) : (
            <span className="sidebar-nav-icon flex h-10 w-10 items-center justify-center rounded-xl">
              <Sparkles className="h-5 w-5" />
            </span>
          )}
          {!collapsed ? (
            <div className="min-w-0">
              <p className="font-semibold tracking-tight">Food Service</p>
              <p className="truncate text-xs text-white/65">{tradeName ?? "Backoffice"}</p>
            </div>
          ) : null}
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {navItems.map((item) => (
          <Can key={item.to} permission={item.permission}>
            <NavLink
              to={item.to}
              end={item.to === "/"}
              title={item.label}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-[background-color,color,box-shadow] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "sidebar-nav-link-active"
                    : "text-white/70 hover:bg-white/[0.06] hover:text-white",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-[background-color,box-shadow] duration-200",
                      isActive ? "sidebar-nav-icon-active" : "sidebar-nav-icon",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {collapsed && item.to === "/pedidos" && pendingOrders > 0 ? (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[hsl(var(--primary))] px-0.5 text-[10px] font-bold text-white">
                        {pendingOrders > 9 ? "9+" : pendingOrders}
                      </span>
                    ) : null}
                  </span>
                  {!collapsed ? (
                    <span className="flex flex-1 items-center justify-between gap-2">
                      {item.label}
                      {item.to === "/pedidos" && pendingOrders > 0 ? (
                        <span className="sidebar-nav-badge animate-pulse rounded-full px-2 py-0.5 text-xs font-bold tabular-nums">
                          {pendingOrders > 99 ? "99+" : pendingOrders}
                        </span>
                      ) : null}
                    </span>
                  ) : null}
                </>
              )}
            </NavLink>
          </Can>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        {!collapsed ? (
          <div className="rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
            <p className="truncate text-sm font-medium">{userName}</p>
            <p className="truncate text-xs text-white/70">{userEmail}</p>
          </div>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "mt-2 gap-2 text-white/80 hover:bg-white/5 hover:text-white",
            collapsed ? "w-full justify-center px-0" : "w-full justify-start",
          )}
          onClick={onSoundToggle}
          aria-pressed={soundEnabled}
          title={soundEnabled ? "Desligar som de novos pedidos" : "Ligar som de novos pedidos"}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          {!collapsed ? (soundEnabled ? "Som de pedidos" : "Som mutado") : null}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "mt-1 gap-2 text-white/80 hover:bg-white/5 hover:text-white",
            collapsed ? "w-full justify-center px-0" : "w-full justify-start",
          )}
          onClick={onLogout}
          title="Sair"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed ? "Sair" : null}
        </Button>
      </div>
    </>
  );
}

function readCollapsedPreference(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function BackofficeLayout() {
  const { user, tenant, logout } = useAuth();
  const { data: settings } = useSettings();
  const { data: dashboard } = useDashboard();
  const { enabled: soundEnabled, setSoundEnabled } = useOrderAlertSoundPreference();
  const orderAlerts = useNewOrderAlerts(dashboard?.recent_orders, { soundEnabled });
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(readCollapsedPreference);

  useTenantTheme(settings?.settings.theme);

  // fecha o drawer ao navegar (mobile)
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

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
  const userName = user ? `${user.first_name} ${user.last_name}` : "";
  const userEmail = user?.email ?? "";

  async function handleSoundToggle() {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      await unlockOrderAlertAudio();
      playOrderAlertSound(); // testa + libera autoplay do browser
    }
  }

  function toggleDesktopSidebar() {
    setDesktopCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const sidebarProps: Omit<SidebarBodyProps, "collapsed" | "onNavigate"> = {
    logoUrl,
    tradeName: tenant?.trade_name,
    pendingOrders,
    userName,
    userEmail,
    soundEnabled,
    onSoundToggle: () => void handleSoundToggle(),
    onLogout: () => void logout(),
  };

  return (
    <div className="flex min-h-screen">
      {/* desktop: colapsa pra só ícones */}
      <aside
        className={cn(
          "gradient-sidebar sticky top-0 hidden h-screen shrink-0 flex-col text-white shadow-[var(--shadow-lg)] transition-[width] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] md:flex",
          desktopCollapsed ? "w-16" : "w-60",
        )}
      >
        <SidebarBody collapsed={desktopCollapsed} {...sidebarProps} />
      </aside>

      {/* mobile: drawer pelo hambúrguer */}
      <Sheet
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        side="left"
        className="gradient-sidebar max-w-[15rem] border-0 text-white shadow-[var(--shadow-lg)]"
      >
        <div className="relative flex h-full flex-col">
          <button
            type="button"
            className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
          <SidebarBody collapsed={false} onNavigate={() => setMobileOpen(false)} {...sidebarProps} />
        </div>
      </Sheet>

      <div className="app-shell-backoffice flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-[hsl(var(--border))] bg-white/70 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 w-10 shrink-0 p-0"
              aria-label={mobileOpen || !desktopCollapsed ? "Fechar menu" : "Abrir menu"}
              aria-expanded={mobileOpen || !desktopCollapsed}
              onClick={() => {
                // mobile abre drawer; desktop cola/expande
                if (window.matchMedia("(min-width: 768px)").matches) {
                  toggleDesktopSidebar();
                } else {
                  setMobileOpen((open) => !open);
                }
              }}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex min-w-0 items-center gap-2 md:hidden">
              {logoUrl ? (
                <img
                  src={resolveMediaUrl(logoUrl)}
                  alt=""
                  className="h-8 w-8 shrink-0 rounded-lg object-cover"
                />
              ) : null}
              <span className="truncate font-bold text-brand">
                {tenant?.trade_name ?? "Food Service"}
              </span>
            </div>
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
              size="sm"
              className="h-9 w-9 p-0"
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
