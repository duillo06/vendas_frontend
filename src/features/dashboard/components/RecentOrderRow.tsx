import { Link } from "react-router";

import { OrderStatusBadge } from "@/shared/components/OrderStatusBadge";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import type { OrderStatus } from "@/shared/components/OrderStatusBadge";
import { cn } from "@/shared/lib/utils";

type RecentOrderRowProps = {
  id: string;
  orderNumber: string;
  customerName: string;
  createdAt: string;
  status: OrderStatus;
  total: number;
};

export function RecentOrderRow({
  id,
  orderNumber,
  customerName,
  createdAt,
  status,
  total,
}: RecentOrderRowProps) {
  const pending = status === "pending";

  return (
    <Link
      to={`/pedidos/${id}`}
      className={cn(
        "grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-0.5 border-b border-[hsl(var(--border))] px-2 py-2 transition-colors last:border-b-0 hover:bg-[hsl(var(--muted))]/40 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto_auto_auto]",
        pending && "bg-[hsl(var(--accent)/0.05)]",
      )}
    >
      <span className="text-xs font-semibold tabular-nums text-brand">{orderNumber}</span>
      <span className="truncate text-xs text-[hsl(var(--foreground))]">{customerName}</span>
      <span className="hidden text-[11px] text-[hsl(var(--muted-foreground))] sm:inline">{createdAt}</span>
      <span className="justify-self-end sm:justify-self-auto">
        <OrderStatusBadge status={status} className="gap-1 px-1.5 py-0.5 text-[10px] shadow-none" />
      </span>
      <PriceDisplay value={total} className="justify-self-end text-xs font-semibold tabular-nums" />
    </Link>
  );
}
