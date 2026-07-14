import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { VisualAccent } from "./PageHeader";
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

const tileClass: Record<VisualAccent, string> = {
  "chart-1": "tile-chart-1",
  "chart-2": "tile-chart-2",
  "chart-3": "tile-chart-3",
  "chart-4": "tile-chart-4",
};

type StatCardProps = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: LucideIcon;
  accent?: VisualAccent;
  highlight?: boolean;
  className?: string;
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "chart-1",
  highlight = false,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "interactive-card overflow-hidden",
        highlight && "border-[hsl(var(--primary)/0.25)] shadow-[var(--shadow-md)]",
        className,
      )}
    >
      {highlight ? (
        <div className="identity-accent-bar rounded-none" />
      ) : null}
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{label}</p>
            <div className="text-3xl font-bold tracking-tight">{value}</div>
          </div>
          <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", tileClass[accent])}>
            <Icon className="h-5 w-5" />
          </span>
        </div>
        {hint ? <div className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">{hint}</div> : null}
      </CardContent>
    </Card>
  );
}
