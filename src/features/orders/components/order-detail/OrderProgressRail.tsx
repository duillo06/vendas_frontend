import { motion } from "framer-motion";
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
  /** compact = dentro do painel de ação */
  variant?: "default" | "compact";
};

export function OrderProgressRail({ order, variant = "default" }: OrderProgressRailProps) {
  const compact = variant === "compact";

  if (order.status === "cancelled") {
    return (
      <p className={cn("font-medium text-red-700", compact ? "text-xs" : "text-sm")}>
        Pedido cancelado — fluxo interrompido.
      </p>
    );
  }

  const steps = getPipelineSteps(order.delivery_type);
  const states = steps.map((step) => pipelineStepState(step, order.status, steps));
  const currentIndex = states.findIndex((s) => s === "current");
  const allDone = states.every((s) => s === "done");
  const fillRatio =
    allDone
      ? 1
      : currentIndex >= 0 && steps.length > 1
        ? currentIndex / (steps.length - 1)
        : 0;

  return (
    <section
      aria-label="Progresso do pedido"
      className={cn(
        compact &&
          "rounded-xl bg-gradient-to-b from-[hsl(var(--muted))]/55 to-transparent px-2.5 pb-2.5 pt-3",
        !compact && "overflow-x-auto pt-1",
      )}
    >
      {compact ? (
        <p className="mb-3 px-1 text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
          Etapas
        </p>
      ) : null}

      <ol
        className={cn(
          "relative flex items-start justify-between gap-0",
          compact ? "min-w-0" : "min-w-[480px] md:min-w-0",
        )}
      >
        {/* trilha de fundo */}
        <span
          className={cn(
            "pointer-events-none absolute left-[8%] right-[8%] rounded-full bg-[hsl(var(--border))]",
            compact ? "top-[15px] h-1.5" : "top-3.5 h-1",
          )}
          aria-hidden
        />
        {/* trilha preenchida até o passo atual */}
        {(fillRatio > 0 || allDone) && (
          <motion.span
            className={cn(
              "pointer-events-none absolute left-[8%] origin-left rounded-full bg-brand",
              compact ? "top-[15px] h-1.5" : "top-3.5 h-1",
            )}
            initial={false}
            animate={{ width: `${fillRatio * 84}%` }}
            transition={{ type: "spring", stiffness: 140, damping: 22 }}
            aria-hidden
          />
        )}

        {steps.map((step, index) => {
          const state = states[index];
          const Icon = ICONS[step];
          const at = getHistoryTime(order, step);

          return (
            <li
              key={step}
              className="group/step relative z-10 flex flex-1 flex-col items-center text-center"
            >
              <motion.span
                layout
                className={cn(
                  "relative flex items-center justify-center rounded-full transition-shadow duration-200",
                  compact ? "h-8 w-8" : "h-9 w-9",
                  state === "done" &&
                    "bg-brand text-[hsl(var(--primary-foreground))] shadow-sm shadow-brand/30",
                  state === "current" &&
                    "bg-white text-brand ring-[3px] ring-brand/30 shadow-md shadow-brand/20",
                  state === "upcoming" &&
                    "bg-white text-[hsl(var(--muted-foreground))] ring-1 ring-[hsl(var(--border))] group-hover/step:ring-brand/20 group-hover/step:text-brand/70",
                )}
                initial={{ opacity: 0, y: 6 }}
                animate={
                  state === "current"
                    ? { opacity: 1, y: 0, scale: [1, 1.08, 1] }
                    : { opacity: 1, y: 0, scale: 1 }
                }
                transition={
                  state === "current"
                    ? {
                        opacity: { duration: 0.25, delay: index * 0.04 },
                        y: { duration: 0.25, delay: index * 0.04 },
                        scale: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
                      }
                    : { duration: 0.25, delay: index * 0.04 }
                }
              >
                {/* halo suave no passo atual */}
                {state === "current" ? (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-brand/20"
                    animate={{ scale: [1, 1.45, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    aria-hidden
                  />
                ) : null}
                {state === "done" ? (
                  <Check className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={2.5} />
                ) : (
                  <Icon className={cn("relative", compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
                )}
              </motion.span>

              <p
                className={cn(
                  "mt-2 font-semibold tracking-tight transition-colors",
                  compact ? "text-[10px] leading-tight" : "text-[11px]",
                  state === "current" && "text-brand",
                  state === "done" && "text-[hsl(var(--foreground))]",
                  state === "upcoming" && "text-[hsl(var(--muted-foreground))]",
                )}
              >
                {PIPELINE_LABELS[step]}
              </p>
              <p
                className={cn(
                  "tabular-nums text-[hsl(var(--muted-foreground))]",
                  compact ? "text-[9px]" : "text-[10px]",
                  state === "upcoming" && "opacity-40",
                  state === "current" && "font-medium text-brand/80",
                )}
              >
                {at && (state === "done" || state === "current") ? formatClock(at) : "—"}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
