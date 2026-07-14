import { Clock, MapPin, Package, Store } from "lucide-react";
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
  deliveryType?: "delivery" | "pickup";
  compact?: boolean;
  className?: string;
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
  compact = false,
  className,
}: AdminOrderCardProps) {
  const isPending = status === "pending";

  return (
    <Link to={`/pedidos/${id}`} className={cn("block", className)}>
      <article
        className={cn(
          "interactive-card group overflow-hidden rounded-2xl border bg-white transition-all",
          isPending
            ? "border-[hsl(var(--accent)/0.45)] shadow-[0_0_0_1px_hsl(var(--accent)/0.2)] ring-2 ring-[hsl(var(--accent)/0.12)]"
            : "border-[hsl(var(--border))]",
        )}
      >
        {isPending ? <div className="h-1 w-full bg-[hsl(var(--accent))]" /> : null}

        <div className={cn("flex flex-col gap-3 p-4", compact ? "sm:flex-row sm:items-center sm:justify-between" : "")}>
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold tracking-tight group-hover:text-brand">{orderNumber}</p>
              <OrderStatusBadge status={status} />
            </div>
            <p className="truncate font-medium">{customerName}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {createdAt}
              </span>
              {itemsCount !== undefined ? (
                <span className="inline-flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" />
                  {itemsCount} {itemsCount === 1 ? "item" : "itens"}
                </span>
              ) : null}
              {deliveryType ? (
                <span className="inline-flex items-center gap-1">
                  {deliveryType === "delivery" ? (
                    <MapPin className="h-3.5 w-3.5" />
                  ) : (
                    <Store className="h-3.5 w-3.5" />
                  )}
                  {deliveryType === "delivery" ? "Entrega" : "Retirada"}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
            <PriceDisplay value={total} className="text-lg font-bold text-brand" />
            <span className="text-xs font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100">
              Abrir pedido →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
