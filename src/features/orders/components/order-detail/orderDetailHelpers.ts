import type { OrderStatus } from "@/features/checkout/types/checkout.types";
import type { OrderAdminDetail } from "@/features/orders/types/order-admin.types";
import { ORDER_NEXT_STATUS } from "@/features/orders/types/order-admin.types";

export const PIPELINE_LABELS: Record<OrderStatus, string> = {
  pending: "Recebido",
  confirmed: "Confirmado",
  preparing: "Preparando",
  ready: "Pronto",
  out_for_delivery: "Entrega",
  completed: "Concluído",
  cancelled: "Cancelado",
};

/** próximo status “de frente” (ignora cancelar) */
export function getPrimaryNextStatus(order: OrderAdminDetail): OrderStatus | null {
  const next = (ORDER_NEXT_STATUS[order.status] ?? []).filter((s) => s !== "cancelled");
  if (!next.length) return null;

  if (order.status === "ready" && order.delivery_type === "delivery") {
    return next.includes("out_for_delivery") ? "out_for_delivery" : next[0];
  }
  if (order.status === "ready" && order.delivery_type !== "delivery") {
    return next.includes("completed") ? "completed" : next[0];
  }
  return next[0];
}

export function getSecondaryNextStatuses(order: OrderAdminDetail): OrderStatus[] {
  const primary = getPrimaryNextStatus(order);
  return (ORDER_NEXT_STATUS[order.status] ?? []).filter((s) => s !== primary);
}

export function getPipelineSteps(deliveryType: string): OrderStatus[] {
  if (deliveryType === "delivery") {
    return ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "completed"];
  }
  return ["pending", "confirmed", "preparing", "ready", "completed"];
}

export function getStatusEnteredAt(order: OrderAdminDetail, status = order.status): Date {
  const matches = order.status_history?.filter((row) => row.to_status === status) ?? [];
  const last = matches[matches.length - 1];
  if (last) return new Date(last.created_at);
  if (status === "pending") return new Date(order.created_at);
  return new Date(order.updated_at || order.created_at);
}

export function getHistoryTime(order: OrderAdminDetail, status: OrderStatus): string | null {
  const matches = order.status_history?.filter((row) => row.to_status === status) ?? [];
  const last = matches[matches.length - 1];
  if (!last) {
    if (status === "pending") return order.created_at;
    return null;
  }
  return last.created_at;
}

export function minutesBetween(from: Date, to: number): number {
  return Math.max(0, Math.floor((to - from.getTime()) / 60_000));
}

export function formatElapsed(minutes: number): string {
  if (minutes < 1) return "há instantes";
  if (minutes === 1) return "há 1 minuto";
  if (minutes < 60) return `há ${minutes} minutos`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest === 0) return hours === 1 ? "há 1 hora" : `há ${hours} horas`;
  return `há ${hours}h ${rest}min`;
}

export function formatClock(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDayTime(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const sameDay =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const time = formatClock(iso);
  if (sameDay) return `Hoje · ${time}`;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function whatsappUrl(phone: string): string {
  const digits = phoneDigits(phone);
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}`;
}

export type OrderAlertTone = "warning" | "danger" | "success" | "info";

export type OrderAlert = {
  id: string;
  tone: OrderAlertTone;
  message: string;
};

export function buildOrderAlerts(
  order: OrderAdminDetail,
  now: number,
  estimatedPrepMinutes = 30,
): OrderAlert[] {
  if (order.status === "cancelled" || order.status === "completed") return [];

  const entered = getStatusEnteredAt(order);
  const mins = minutesBetween(entered, now);
  const alerts: OrderAlert[] = [];

  if (order.status === "pending" && mins >= 3) {
    alerts.push({
      id: "pending-wait",
      tone: mins >= 8 ? "danger" : "warning",
      message:
        mins === 1
          ? "Pedido aguardando confirmação há 1 minuto."
          : `Pedido aguardando confirmação há ${mins} minutos.`,
    });
  }

  if (order.status === "preparing" && mins > estimatedPrepMinutes) {
    alerts.push({
      id: "prep-over",
      tone: "danger",
      message: `Tempo médio de preparo ultrapassado (${estimatedPrepMinutes} min). Já faz ${mins} minutos.`,
    });
  } else if (
    ["confirmed", "preparing", "ready", "out_for_delivery"].includes(order.status) &&
    mins <= estimatedPrepMinutes &&
    alerts.length === 0
  ) {
    alerts.push({
      id: "on-track",
      tone: "success",
      message: "Dentro do prazo — boa operação.",
    });
  }

  if (order.payment?.status === "pending") {
    alerts.push({
      id: "pay-pending",
      tone: "info",
      message: "Pagamento ainda pendente — registre quando receber.",
    });
  }

  return alerts;
}

export function pipelineStepState(
  step: OrderStatus,
  current: OrderStatus,
  steps: OrderStatus[],
): "done" | "current" | "upcoming" {
  if (current === "cancelled") {
    const idx = steps.indexOf(step);
    // cancela não está no pipeline — marca o que já passou via history no caller
    return idx === 0 ? "done" : "upcoming";
  }
  const stepIdx = steps.indexOf(step);
  const currentIdx = steps.indexOf(current);
  if (currentIdx < 0) return "upcoming";
  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "current";
  return "upcoming";
}

export function customerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
