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
  "chart-1": "tile-chart-1",
  "chart-2": "tile-chart-2",
  "chart-3": "tile-chart-3",
  "chart-4": "tile-chart-4",
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
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-12 text-center shadow-[var(--shadow-xs)] sm:py-14",
        className,
      )}
    >
      {Icon ? (
        <span className={cn("mb-4 flex h-12 w-12 items-center justify-center rounded-xl sm:h-14 sm:w-14 sm:rounded-2xl", accentTile[accent])}>
          <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
        </span>
      ) : null}
      <h3 className="type-subtitle">{title}</h3>
      {description ? <p className="mt-2 max-w-sm type-caption">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
