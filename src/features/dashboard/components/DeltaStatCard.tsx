import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { VisualAccent } from "@/shared/components/visual/PageHeader";
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

const tileClass: Record<VisualAccent, string> = {
  "chart-1": "tile-chart-1",
  "chart-2": "tile-chart-2",
  "chart-3": "tile-chart-3",
  "chart-4": "tile-chart-4",
};

type DeltaStatCardProps = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: LucideIcon;
  accent?: VisualAccent;
  highlight?: boolean;
  deltaPct: number | null;
  neutralDelta?: boolean;
  className?: string;
};

function DeltaBadge({ deltaPct, neutral }: { deltaPct: number | null; neutral?: boolean }) {
  if (deltaPct === null || Math.abs(deltaPct) < 0.05) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-[hsl(var(--muted))] px-1.5 py-0.5 text-[10px] font-medium text-[hsl(var(--muted-foreground))]">
        <Minus className="h-2.5 w-2.5" />
        {deltaPct === null ? "—" : "0%"}
      </span>
    );
  }
  const up = deltaPct > 0;
  const tone = neutral
    ? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
    : up
      ? "bg-emerald-500/12 text-emerald-700"
      : "bg-red-500/12 text-red-700";
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cn("inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold", tone)}>
      <Icon className="h-2.5 w-2.5" />
      {Math.abs(deltaPct).toFixed(0)}%
    </span>
  );
}

export function DeltaStatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "chart-1",
  highlight = false,
  deltaPct,
  neutralDelta = false,
  className,
}: DeltaStatCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden transition-colors hover:border-[hsl(var(--primary)/0.28)]",
        highlight && "border-[hsl(var(--primary)/0.3)]",
        className,
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">{label}</p>
              <DeltaBadge deltaPct={deltaPct} neutral={neutralDelta} />
            </div>
            <div className="text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">{value}</div>
            {hint ? <div className="text-[11px] leading-snug text-[hsl(var(--muted-foreground))]">{hint}</div> : null}
          </div>
          <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", tileClass[accent])}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
