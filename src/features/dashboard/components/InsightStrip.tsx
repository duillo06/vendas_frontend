import { Link } from "react-router";
import { Sparkles } from "lucide-react";

import { cn } from "@/shared/lib/utils";

type InsightStripProps = {
  lines: string[];
  pendingOrders: number;
  className?: string;
};

export function InsightStrip({ lines, pendingOrders, className }: InsightStripProps) {
  if (!lines.length) return null;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/25 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-3",
        pendingOrders > 0 && "border-[hsl(var(--accent)/0.35)] bg-[hsl(var(--accent)/0.06)]",
        className,
      )}
    >
      <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-brand">
        <Sparkles className="h-3.5 w-3.5" />
        Resumo
      </span>
      <p className="min-w-0 flex-1 text-xs leading-relaxed text-[hsl(var(--foreground))] sm:text-[13px]">
        {lines.join(" · ")}
      </p>
      {pendingOrders > 0 ? (
        <Link
          to="/pedidos?status=pending"
          className="shrink-0 text-xs font-semibold text-brand underline-offset-2 hover:underline"
        >
          Ver pendentes
        </Link>
      ) : null}
    </div>
  );
}
