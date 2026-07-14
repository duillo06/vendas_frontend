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
};

export function OrderEventTimeline({ order }: OrderEventTimelineProps) {
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
    <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-[var(--shadow-sm)] md:p-5">
      <h2 className="text-base font-semibold">Histórico de eventos</h2>
      <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
        Cada mudança de status fica registrada aqui.
      </p>

      <ol className="mt-4 space-y-0">
        {events.map((event, index) => {
          const Icon = EVENT_ICONS[event.to_status] ?? Clock;
          const isLast = index === events.length - 1;

          return (
            <li key={`${event.to_status}-${event.created_at}-${index}`} className="relative flex gap-3 pb-5 last:pb-0">
              {!isLast ? (
                <span className="absolute top-8 left-[15px] h-[calc(100%-20px)] w-px bg-[hsl(var(--border))]" />
              ) : null}
              <span
                className={cn(
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                  isLast
                    ? "border-[hsl(var(--primary)/0.35)] bg-[hsl(var(--primary)/0.12)] text-brand"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 text-[hsl(var(--muted-foreground))]",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 pt-0.5">
                <div className="flex flex-wrap items-baseline gap-2">
                  <p className="text-sm font-medium">{eventLabel(event.to_status)}</p>
                  <time className="text-xs tabular-nums text-[hsl(var(--muted-foreground))]">
                    {formatClock(event.created_at)}
                  </time>
                </div>
                {event.changed_by ? (
                  <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                    por {event.changed_by}
                  </p>
                ) : null}
                {event.notes ? (
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{event.notes}</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
