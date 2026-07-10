import type { OrderStatus } from "@/features/checkout/types/checkout.types";
import { cn } from "@/shared/lib/utils";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Recebido",
  confirmed: "Confirmado",
  preparing: "Preparando",
  ready: "Pronto",
  out_for_delivery: "Em entrega",
  completed: "Concluído",
  cancelled: "Cancelado",
};

type OrderStatusTimelineProps = {
  currentStatus: OrderStatus;
  history?: Array<{ status: OrderStatus; created_at: string }>;
};

export function OrderStatusTimeline({ currentStatus, history = [] }: OrderStatusTimelineProps) {
  const steps = history.length
    ? history
    : [{ status: currentStatus, created_at: new Date().toISOString() }];

  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isCurrent = step.status === currentStatus && isLast;

        return (
          <li key={`${step.status}-${step.created_at}`} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast ? (
              <span className="absolute left-[11px] top-6 h-[calc(100%-12px)] w-0.5 bg-[hsl(var(--border))]" />
            ) : null}
            <span
              className={cn(
                "relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold",
                isCurrent
                  ? "border-brand bg-brand text-[hsl(var(--primary-foreground))]"
                  : "border-[hsl(var(--border))] bg-white text-[hsl(var(--muted-foreground))]",
              )}
            >
              {index + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className={cn("text-sm font-medium", isCurrent && "text-brand")}>
                {STATUS_LABELS[step.status] ?? step.status}
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {new Intl.DateTimeFormat("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(step.created_at))}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
