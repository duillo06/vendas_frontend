import { Bell } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Sheet, SheetContent } from "@/shared/components/ui/sheet";
import { formatCurrency } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

import type { OrderAlertNotification } from "../hooks/useNewOrderAlerts";

type OrderNotificationsBellProps = {
  notifications: OrderAlertNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  className?: string;
};

function formatReceivedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function NotificationsList({
  notifications,
  onOpen,
}: {
  notifications: OrderAlertNotification[];
  onOpen: (item: OrderAlertNotification) => void;
}) {
  if (notifications.length === 0) {
    return (
      <div className="px-1 py-8 text-center">
        <p className="text-sm font-medium text-[hsl(var(--foreground))]">Nenhuma notificação</p>
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
          Quando chegar um pedido novo, ele aparece aqui.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-1">
      {notifications.map((item) => (
        <li key={`${item.id}-${item.receivedAt}`}>
          <button
            type="button"
            className={cn(
              "w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[hsl(var(--muted))]",
              !item.read && "bg-[hsl(var(--primary)/0.08)]",
            )}
            onClick={() => onOpen(item)}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                Novo pedido {item.orderNumber}
              </p>
              <span className="shrink-0 text-[11px] text-[hsl(var(--muted-foreground))]">
                {formatReceivedAt(item.receivedAt)}
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs text-[hsl(var(--muted-foreground))]">
              {item.customerName} · {formatCurrency(item.total)}
            </p>
            {!item.read ? (
              <span className="mt-1 inline-block text-[10px] font-semibold uppercase tracking-wide text-brand">
                Não lida
              </span>
            ) : null}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function OrderNotificationsBell({
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
  clearAll,
  className,
}: OrderNotificationsBellProps) {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [open, setOpen] = useState(false);

  function handleOpen(item: OrderAlertNotification) {
    markAsRead(item.id);
    setOpen(false);
    navigate(`/pedidos/${item.id}`);
  }

  const badge =
    unreadCount > 0 ? (
      <Badge className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px]">
        {unreadCount > 99 ? "99+" : unreadCount}
      </Badge>
    ) : null;

  const panelFooter =
    notifications.length > 0 ? (
      <div className="flex items-center justify-between gap-2 border-t border-[hsl(var(--border))] px-3 py-2">
        <Button type="button" variant="ghost" size="sm" onClick={markAllAsRead}>
          Marcar lidas
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
          Limpar
        </Button>
      </div>
    ) : null;

  const trigger = (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn("relative h-9 w-9", className)}
      aria-label={
        unreadCount > 0
          ? `Notificações, ${unreadCount} não lidas`
          : "Notificações"
      }
      aria-expanded={open}
      onClick={() => setOpen((value) => !value)}
    >
      <Bell className="h-4 w-4" />
      {badge}
    </Button>
  );

  if (isMobile) {
    return (
      <>
        {trigger}
        <Sheet open={open} onOpenChange={setOpen} side="bottom">
          <SheetContent title="Notificações" onClose={() => setOpen(false)}>
            <NotificationsList notifications={notifications} onOpen={handleOpen} />
            {panelFooter}
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <div className="relative">
      {trigger}
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Fechar notificações"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-full right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-xl">
            <div className="border-b border-[hsl(var(--border))] px-4 py-3">
              <p className="text-sm font-semibold">Notificações</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {unreadCount > 0
                  ? `${unreadCount} pedido${unreadCount > 1 ? "s" : ""} novo${unreadCount > 1 ? "s" : ""}`
                  : "Tudo em dia"}
              </p>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              <NotificationsList notifications={notifications} onOpen={handleOpen} />
            </div>
            {panelFooter}
          </div>
        </>
      ) : null}
    </div>
  );
}
