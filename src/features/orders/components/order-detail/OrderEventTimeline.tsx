import { CheckCircle2, Clock, Flame, PackageCheck, ShoppingBag, Truck, XCircle } from "lucide-react";

import type { OrderAdminDetail } from "@/features/orders/types/order-admin.types";
import { cn } from "@/shared/lib/utils";

import { eventLabel } from "./orderDetailCopy";
import { formatClock } from "./orderDetailHelpers";

const EVENT_ICONS: Record<string, typeof Clock> = {
  pending: ShoppingBag,
  confirmed: CheckCircle2,
  preparing: Flame,
  ready: PackageCheck,
  out_for_delivery: Truck,
  completed: CheckCircle2,
  cancelled: XCircle,
};

type OrderEventTimelineProps = {
  order: OrderAdminDetail;
  /** dentro do accordion da comanda */
  embedded?: boolean;
};

export function OrderEventTimeline({ order, embedded = false }: OrderEventTimelineProps) {
  const events =
    order.status_history?.length > 0
      ? order.status_history
      : [
          {
            from_status: null,
            to_status: order.status,
            changed_by: null,
            notes: null,
            created_at: order.created_at,
          },
        ];

  return (
    <section className={cn(!embedded && "space-y-2.5")}>
      {!embedded ? <h2 className="text-sm font-semibold tracking-tight">Histórico</h2> : null}

      <ol className="space-y-0">
        {events.map((event, index) => {
          const Icon = EVENT_ICONS[event.to_status] ?? Clock;
          const isLast = index === events.length - 1;

          return (
            <li
              key={`${event.to_status}-${event.created_at}-${index}`}
              className="relative flex gap-2.5 pb-3 last:pb-0"
            >
              {!isLast ? (
                <span className="absolute top-6 left-[11px] h-[calc(100%-14px)] w-px bg-[hsl(var(--border))]" />
              ) : null}
              <span
                className={cn(
                  "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                  isLast
                    ? "bg-brand/12 text-brand"
                    : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
                )}
              >
                <Icon className="h-3 w-3" />
              </span>
              <div className="min-w-0 pt-0.5">
                <div className="flex flex-wrap items-baseline gap-2">
                  <p className="text-sm font-medium">{eventLabel(event.to_status)}</p>
                  <time className="text-[11px] tabular-nums text-[hsl(var(--muted-foreground))]">
                    {formatClock(event.created_at)}
                  </time>
                </div>
                {event.changed_by ? (
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                    por {event.changed_by}
                  </p>
                ) : null}
                {event.notes ? (
                  <p className="mt-0.5 text-[11px] text-[hsl(var(--muted-foreground))]">{event.notes}</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
