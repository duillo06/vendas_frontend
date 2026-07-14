import {
  Check,
  Clock,
  Flame,
  PackageCheck,
  ShoppingBag,
  Truck,
  type LucideIcon,
} from "lucide-react";

import type { OrderStatus } from "@/features/checkout/types/checkout.types";
import type { OrderAdminDetail } from "@/features/orders/types/order-admin.types";
import { cn } from "@/shared/lib/utils";

import {
  PIPELINE_LABELS,
  formatClock,
  getHistoryTime,
  getPipelineSteps,
  pipelineStepState,
} from "./orderDetailHelpers";

const ICONS: Record<OrderStatus, LucideIcon> = {
  pending: ShoppingBag,
  confirmed: Check,
  preparing: Flame,
  ready: PackageCheck,
  out_for_delivery: Truck,
  completed: Check,
  cancelled: Clock,
};

type OrderProgressRailProps = {
  order: OrderAdminDetail;
};

export function OrderProgressRail({ order }: OrderProgressRailProps) {
  if (order.status === "cancelled") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700">
        Pedido cancelado — o fluxo de produção foi interrompido.
      </div>
    );
  }

  const steps = getPipelineSteps(order.delivery_type);

  return (
    <section
      aria-label="Progresso do pedido"
      className="overflow-x-auto rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-[var(--shadow-xs)] md:p-5"
    >
      <ol className="flex min-w-[520px] items-start justify-between gap-1 md:min-w-0">
        {steps.map((step, index) => {
          const state = pipelineStepState(step, order.status, steps);
          const Icon = ICONS[step];
          const at = getHistoryTime(order, step);
          const isLast = index === steps.length - 1;

          return (
            <li key={step} className="relative flex flex-1 flex-col items-center text-center">
              {!isLast ? (
                <span
                  className={cn(
                    "absolute top-4 left-[calc(50%+18px)] h-0.5 w-[calc(100%-36px)] rounded-full transition-colors duration-200",
                    state === "done" ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--border))]",
                  )}
                  aria-hidden
                />
              ) : null}

              <span
                className={cn(
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200",
                  state === "done" &&
                    "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]",
                  state === "current" &&
                    "order-step-pulse border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.12)] text-brand shadow-[0_0_0_4px_hsl(var(--primary)/0.15)] animate-pulse",
                  state === "upcoming" &&
                    "border-[hsl(var(--border))] bg-white text-[hsl(var(--muted-foreground))]",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>

              <p
                className={cn(
                  "mt-2 text-[11px] font-semibold tracking-tight md:text-xs",
                  state === "current" && "text-brand",
                  state === "upcoming" && "text-[hsl(var(--muted-foreground))]",
                )}
              >
                {PIPELINE_LABELS[step]}
              </p>
              <p className="mt-0.5 text-[10px] tabular-nums text-[hsl(var(--muted-foreground))]">
                {at && (state === "done" || state === "current") ? formatClock(at) : "—"}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
