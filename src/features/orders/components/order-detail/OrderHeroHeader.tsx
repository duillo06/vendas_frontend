import {
  Check,
  ChevronLeft,
  Clock,
  Flame,
  PackageCheck,
  ShoppingBag,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router";

import type { OrderStatus } from "@/features/checkout/types/checkout.types";
import type { OrderAdminDetail } from "@/features/orders/types/order-admin.types";
import { OrderStatusBadge } from "@/shared/components/OrderStatusBadge";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { Button } from "@/shared/components/ui/button";

import {
  PRIMARY_ACTION_LABELS,
  SECONDARY_ACTION_LABELS,
} from "./orderDetailCopy";
import {
  formatDayTime,
  formatElapsed,
  getPrimaryNextStatus,
  getSecondaryNextStatuses,
  minutesBetween,
} from "./orderDetailHelpers";

const STATUS_ICONS: Record<OrderStatus, LucideIcon> = {
  pending: ShoppingBag,
  confirmed: Check,
  preparing: Flame,
  ready: PackageCheck,
  out_for_delivery: Truck,
  completed: Check,
  cancelled: Clock,
};

type OrderHeroHeaderProps = {
  order: OrderAdminDetail;
  now: number;
  isPending: boolean;
  onAdvance: (status: OrderStatus) => void;
};

export function OrderHeroHeader({ order, now, isPending, onAdvance }: OrderHeroHeaderProps) {
  const primary = getPrimaryNextStatus(order);
  const secondary = getSecondaryNextStatuses(order).filter((s) => s !== "cancelled");
  const ageMins = minutesBetween(new Date(order.created_at), now);
  const PrimaryIcon = primary ? STATUS_ICONS[primary] : Check;

  return (
    <header className="relative overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[var(--shadow-sm)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--primary)/0.55)] to-transparent" />

      <div className="flex flex-col gap-5 p-5 md:flex-row md:items-start md:justify-between md:p-6">
        <div className="min-w-0 space-y-3">
          <Link
            to="/pedidos"
            className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors duration-200 hover:text-brand"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Link>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="type-title text-[hsl(var(--foreground))]">{order.order_number}</h1>
            <OrderStatusBadge status={order.status} className="text-xs" />
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[hsl(var(--muted-foreground))]">
            <span className="font-semibold text-[hsl(var(--foreground))]">{order.customer.name}</span>
            <span className="text-[hsl(var(--border))]">·</span>
            <span>{order.delivery_type === "delivery" ? "Entrega" : "Retirada"}</span>
            <span className="text-[hsl(var(--border))]">·</span>
            <span>{formatDayTime(order.created_at)}</span>
            <span className="inline-flex items-center gap-1 text-xs">
              <Clock className="h-3.5 w-3.5" />
              {formatElapsed(ageMins)}
            </span>
          </div>

          <p className="type-value text-brand">
            <PriceDisplay value={order.total} />
          </p>
        </div>

        {primary ? (
          <div className="flex w-full flex-col gap-2 md:w-auto md:min-w-[220px] md:items-end">
            <Button
              type="button"
              size="lg"
              disabled={isPending}
              className="h-12 w-full gap-2 text-base shadow-[var(--shadow-md)] md:w-auto md:min-w-[220px]"
              onClick={() => onAdvance(primary)}
            >
              <PrimaryIcon className="h-5 w-5" />
              {PRIMARY_ACTION_LABELS[primary] ?? primary}
            </Button>
            {secondary.length ? (
              <div className="flex w-full flex-wrap gap-2 md:justify-end">
                {secondary.map((status) => (
                  <Button
                    key={status}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    className="flex-1 md:flex-none"
                    onClick={() => onAdvance(status)}
                  >
                    {SECONDARY_ACTION_LABELS[status] ?? PRIMARY_ACTION_LABELS[status] ?? status}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
