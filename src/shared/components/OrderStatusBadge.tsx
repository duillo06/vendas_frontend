import {
  CheckCircle,
  CircleCheck,
  Clock,
  Flame,
  PackageCheck,
  Truck,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/shared/lib/utils";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; icon: LucideIcon; textClass: string; bgClass: string }
> = {
  pending: {
    label: "Pendente",
    icon: Clock,
    textClass: "text-amber-700",
    bgClass: "bg-amber-50",
  },
  confirmed: {
    label: "Confirmado",
    icon: CheckCircle,
    textClass: "text-blue-700",
    bgClass: "bg-blue-50",
  },
  preparing: {
    label: "Preparando",
    icon: Flame,
    textClass: "text-orange-700",
    bgClass: "bg-orange-50",
  },
  ready: {
    label: "Pronto",
    icon: PackageCheck,
    textClass: "text-emerald-700",
    bgClass: "bg-emerald-50",
  },
  out_for_delivery: {
    label: "Saiu para entrega",
    icon: Truck,
    textClass: "text-blue-700",
    bgClass: "bg-blue-50",
  },
  completed: {
    label: "Concluído",
    icon: CircleCheck,
    textClass: "text-green-700",
    bgClass: "bg-green-50",
  },
  cancelled: {
    label: "Cancelado",
    icon: XCircle,
    textClass: "text-red-700",
    bgClass: "bg-red-50",
  },
};

type OrderStatusBadgeProps = {
  status: OrderStatus;
  className?: string;
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        config.textClass,
        config.bgClass,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {config.label}
    </span>
  );
}
