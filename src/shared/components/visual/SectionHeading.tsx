import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { VisualAccent } from "./PageHeader";
import { cn } from "@/shared/lib/utils";

const tileClass: Record<VisualAccent, string> = {
  "chart-1": "tile-chart-1",
  "chart-2": "tile-chart-2",
  "chart-3": "tile-chart-3",
  "chart-4": "tile-chart-4",
};

type SectionHeadingProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  accent?: VisualAccent;
  action?: ReactNode;
  className?: string;
};

export function SectionHeading({
  title,
  description,
  icon: Icon,
  accent = "chart-1",
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", tileClass[accent])}>
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
