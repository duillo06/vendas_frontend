import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type UiHintTone = "neutral" | "success" | "warm" | "info";

type UiHintProps = {
  title?: string;
  children: ReactNode;
  icon?: LucideIcon;
  tone?: UiHintTone;
  className?: string;
};

const toneClasses: Record<UiHintTone, { box: string; icon: string }> = {
  neutral: {
    box: "border-slate-200 bg-slate-50/90",
    icon: "bg-slate-100 text-slate-600",
  },
  success: {
    box: "hint-brand",
    icon: "tile-brand",
  },
  warm: {
    box: "hint-accent",
    icon: "tile-chart-2",
  },
  info: {
    box: "border-[hsl(var(--chart-3)/0.22)] bg-[hsl(var(--chart-3)/0.08)]",
    icon: "tile-chart-3",
  },
};

export function UiHint({ title, children, icon: Icon, tone = "neutral", className }: UiHintProps) {
  const styles = toneClasses[tone];

  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border px-4 py-3 text-sm leading-relaxed shadow-sm",
        styles.box,
        className,
      )}
    >
      {Icon ? (
        <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", styles.icon)}>
          <Icon className="h-4 w-4" />
        </span>
      ) : null}
      <div className="space-y-0.5">
        {title ? <p className="font-medium">{title}</p> : null}
        <p className={title ? "text-[hsl(var(--muted-foreground))]" : undefined}>{children}</p>
      </div>
    </div>
  );
}
