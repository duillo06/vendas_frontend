import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import type { DashboardRecentOrder } from "@/features/dashboard/types/dashboard.types";
import { formatCurrency } from "@/shared/lib/format";

import { playOrderAlertSound } from "../lib/playOrderAlertSound";

export type OrderAlertNotification = {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  receivedAt: string;
  read: boolean;
};

export function useNewOrderAlerts(
  recentOrders: DashboardRecentOrder[] | undefined,
  options: { soundEnabled: boolean },
) {
  const navigate = useNavigate();
  const seenIdsRef = useRef<Set<string> | null>(null);
  const soundEnabledRef = useRef(options.soundEnabled);
  soundEnabledRef.current = options.soundEnabled;

  const [notifications, setNotifications] = useState<OrderAlertNotification[]>([]);

  useEffect(() => {
    if (!recentOrders) return;

    // primeira carga: só marca o que já existe, sem alertar
    if (seenIdsRef.current === null) {
      seenIdsRef.current = new Set(recentOrders.map((order) => order.id));
      return;
    }

    const seen = seenIdsRef.current;
    const newcomers = recentOrders.filter(
      (order) => !seen.has(order.id) && order.status === "pending",
    );

    for (const order of recentOrders) {
      seen.add(order.id);
    }

    if (newcomers.length === 0) return;

    const receivedAt = new Date().toISOString();
    setNotifications((prev) => {
      const incoming = newcomers.map((order) => ({
        id: order.id,
        orderNumber: order.order_number,
        customerName: order.customer_name,
        total: order.total,
        receivedAt,
        read: false,
      }));
      return [...incoming, ...prev].slice(0, 30); // mantém as 30 mais recentes
    });

    for (const order of newcomers) {
      toast.message(`Novo pedido ${order.order_number}`, {
        description: `${order.customer_name} · ${formatCurrency(order.total)}`,
        duration: 12_000,
        action: {
          label: "Abrir",
          onClick: () => navigate(`/pedidos/${order.id}`),
        },
      });
    }

    if (soundEnabledRef.current) {
      playOrderAlertSound();
    }
  }, [recentOrders, navigate]);

  const unreadCount = notifications.reduce((count, item) => count + (item.read ? 0 : 1), 0);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
}
