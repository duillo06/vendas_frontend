import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { VisualAccent } from "@/shared/components/visual/PageHeader";
import { cn } from "@/shared/lib/utils";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  accent?: VisualAccent;
};

const accentTile: Record<VisualAccent, string> = {
  "chart-1": "tile-chart-1 ring-4 ring-[hsl(var(--chart-1)/0.12)]",
  "chart-2": "tile-chart-2 ring-4 ring-[hsl(var(--chart-2)/0.12)]",
  "chart-3": "tile-chart-3 ring-4 ring-[hsl(var(--chart-3)/0.12)]",
  "chart-4": "tile-chart-4 ring-4 ring-[hsl(var(--chart-4)/0.12)]",
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  accent = "chart-1",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-soft bg-gradient-to-b from-[hsl(var(--primary-soft))] to-white px-6 py-14 text-center",
        className,
      )}
    >
      {Icon ? (
        <span className={cn("mb-4 flex h-14 w-14 items-center justify-center rounded-2xl", accentTile[accent])}>
          <Icon className="h-7 w-7" />
        </span>
      ) : null}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
