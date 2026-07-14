import { AlertTriangle, CheckCircle2, Info, Timer } from "lucide-react";

import { cn } from "@/shared/lib/utils";

import type { OrderAlert } from "./orderDetailHelpers";

const TONE_STYLES = {
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  danger: "border-orange-200 bg-orange-50 text-orange-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  info: "border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 text-[hsl(var(--foreground))]",
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
    <div className="space-y-2">
      {alerts.map((alert) => {
        const Icon = TONE_ICONS[alert.tone];
        return (
          <div
            key={alert.id}
            className={cn(
              "flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm animate-fade-up",
              TONE_STYLES[alert.tone],
            )}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="font-medium leading-snug">{alert.message}</p>
          </div>
        );
      })}
    </div>
  );
}
