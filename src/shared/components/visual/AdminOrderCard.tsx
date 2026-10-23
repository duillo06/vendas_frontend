import { Armchair, ChevronRight, MapPin, Store } from "lucide-react";
import { Link } from "react-router";

import type { OrderStatus } from "@/features/checkout/types/checkout.types";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { OrderStatusBadge } from "@/shared/components/OrderStatusBadge";
import { cn } from "@/shared/lib/utils";

type AdminOrderCardProps = {
  id: string;
  orderNumber: string;
  customerName: string;
  createdAt: string;
  status: OrderStatus;
  total: number;
  itemsCount?: number;
  deliveryType?: "delivery" | "pickup" | "dine_in";
  tableNumber?: string | null;
  compact?: boolean;
  className?: string;
};

const statusRail: Partial<Record<OrderStatus, string>> = {
  pending: "bg-amber-500",
  confirmed: "bg-blue-500",
  preparing: "bg-orange-500",
  ready: "bg-emerald-500",
  out_for_delivery: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-red-400",
};

export function AdminOrderCard({
  id,
  orderNumber,
  customerName,
  createdAt,
  status,
  total,
  itemsCount,
  deliveryType,
  tableNumber,
  className,
}: AdminOrderCardProps) {
  const isPending = status === "pending";
  const rail = statusRail[status];
  const deliveryLabel =
    deliveryType === "delivery"
      ? "Entrega"
      : deliveryType === "pickup"
        ? "Retirada"
        : deliveryType === "dine_in"
          ? tableNumber
            ? `Mesa ${tableNumber}`
            : "Mesa"
          : null;
  const titleLabel =
    deliveryType === "dine_in" && tableNumber ? `Mesa ${tableNumber}` : customerName;
  const itemsLabel =
    itemsCount !== undefined ? `${itemsCount} ${itemsCount === 1 ? "item" : "itens"}` : null;

  return (
    <Link
      to={`/pedidos/${id}`}
      className={cn(
        "group relative flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-[hsl(var(--muted))]/55",
        isPending && "bg-[hsl(var(--accent)/0.05)]",
        className,
      )}
    >
      {rail ? (
        <span
          className={cn("absolute inset-y-1.5 left-0 w-0.5 rounded-full", rail, isPending && "w-1")}
          aria-hidden
        />
      ) : null}

      <span className="w-14 shrink-0 pl-1.5 text-sm font-semibold tabular-nums tracking-tight text-brand sm:w-16 sm:pl-2">
        {orderNumber}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[hsl(var(--foreground))] group-hover:text-brand">
          {titleLabel}
        </p>
        <p className="truncate text-[11px] text-[hsl(var(--muted-foreground))] sm:hidden">
          {[
            deliveryType === "dine_in" ? customerName : null,
            createdAt,
            deliveryType === "dine_in" ? null : deliveryLabel,
            itemsLabel,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      <div className="hidden items-center gap-3 sm:flex">
        <OrderStatusBadge status={status} className="gap-1 px-1.5 py-0.5 text-[10px] shadow-none" />

        {deliveryLabel ? (
          <span className="inline-flex w-24 items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
            {deliveryType === "delivery" ? (
              <MapPin className="h-3 w-3 shrink-0" />
            ) : deliveryType === "dine_in" ? (
              <Armchair className="h-3 w-3 shrink-0" />
            ) : (
              <Store className="h-3 w-3 shrink-0" />
            )}
            {deliveryLabel}
          </span>
        ) : null}

        <span className="w-14 text-xs tabular-nums text-[hsl(var(--muted-foreground))]">
          {itemsLabel ?? "—"}
        </span>

        <span className="w-[4.5rem] text-xs tabular-nums text-[hsl(var(--muted-foreground))]">
          {createdAt}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <span className="sm:hidden">
          <OrderStatusBadge status={status} className="gap-1 px-1.5 py-0.5 text-[10px] shadow-none" />
        </span>
        <PriceDisplay value={total} className="text-sm font-semibold tabular-nums text-brand" />
        <ChevronRight className="hidden h-3.5 w-3.5 text-[hsl(var(--muted-foreground))] opacity-0 transition-opacity group-hover:opacity-100 sm:block" />
      </div>
    </Link>
  );
}
