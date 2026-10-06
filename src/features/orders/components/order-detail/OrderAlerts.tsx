import { AlertTriangle, CheckCircle2, Info, Timer } from "lucide-react";

import { cn } from "@/shared/lib/utils";

import type { OrderAlert } from "./orderDetailHelpers";

const TONE_STYLES = {
  warning: "bg-amber-50 text-amber-900 ring-amber-200/80",
  danger: "bg-orange-50 text-orange-900 ring-orange-200/80",
  success: "bg-emerald-50 text-emerald-900 ring-emerald-200/80",
  info: "bg-[hsl(var(--muted))]/60 text-[hsl(var(--foreground))] ring-[hsl(var(--border))]",
} as const;

const TONE_ICONS = {
  warning: AlertTriangle,
  danger: Timer,
  success: CheckCircle2,
  info: Info,
} as const;

type OrderAlertsProps = {
  alerts: OrderAlert[];
};

export function OrderAlerts({ alerts }: OrderAlertsProps) {
  if (!alerts.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5" role="status">
      {alerts.map((alert) => {
        const Icon = TONE_ICONS[alert.tone];
        return (
          <span
            key={alert.id}
            className={cn(
              "inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
              TONE_STYLES[alert.tone],
            )}
          >
            <Icon className="h-3 w-3 shrink-0" />
            <span className="truncate">{alert.message}</span>
          </span>
        );
      })}
    </div>
  );
}
