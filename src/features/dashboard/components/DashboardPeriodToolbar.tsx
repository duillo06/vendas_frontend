import { CalendarRange, ShoppingBag } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import type { DashboardPeriod } from "../types/dashboard.types";

const PRESETS: { value: Exclude<DashboardPeriod, "custom">; label: string }[] = [
  { value: "today", label: "Hoje" },
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
];

type DashboardPeriodToolbarProps = {
  period: DashboardPeriod;
  from: string;
  to: string;
  onPreset: (period: Exclude<DashboardPeriod, "custom">) => void;
  onCustomChange: (from: string, to: string) => void;
  className?: string;
};

export function DashboardPeriodToolbar({
  period,
  from,
  to,
  onPreset,
  onCustomChange,
  className,
}: DashboardPeriodToolbarProps) {
  const customActive = period === "custom";

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 sm:flex-row sm:items-center sm:gap-0 sm:divide-x sm:divide-[hsl(var(--border))]",
        className,
      )}
    >
      {/* presets — grupo segmentado */}
      <div
        className="flex gap-0.5 overflow-x-auto p-0.5 sm:pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Período rápido"
      >
        {PRESETS.map((opt) => {
          const active = !customActive && opt.value === period;
          return (
            <button
              key={opt.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onPreset(opt.value)}
              className={cn(
                "h-8 shrink-0 rounded-lg px-3 text-xs font-medium transition-colors",
                active
                  ? "bg-brand text-brand-foreground"
                  : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* intervalo — um bloco só */}
      <div
        className={cn(
          "flex min-w-0 flex-1 items-center gap-1.5 rounded-lg px-2 py-1 sm:px-3",
          customActive && "bg-[hsl(var(--primary)/0.06)]",
        )}
      >
        <CalendarRange
          className={cn(
            "hidden h-3.5 w-3.5 shrink-0 sm:block",
            customActive ? "text-brand" : "text-[hsl(var(--muted-foreground))]",
          )}
          aria-hidden
        />
        <label className="flex min-w-0 items-center gap-1.5 text-[11px] text-[hsl(var(--muted-foreground))]">
          <span className="shrink-0">De</span>
          <Input
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => onCustomChange(e.target.value, to || e.target.value)}
            className={cn(
              "h-8 w-[8.75rem] border-0 bg-transparent px-1 shadow-none focus-visible:ring-1 sm:w-[9.25rem]",
              customActive && "text-[hsl(var(--foreground))]",
            )}
          />
        </label>
        <span className="shrink-0 text-[hsl(var(--muted-foreground))]" aria-hidden>
          →
        </span>
        <label className="flex min-w-0 items-center gap-1.5 text-[11px] text-[hsl(var(--muted-foreground))]">
          <span className="shrink-0">Até</span>
          <Input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => onCustomChange(from || e.target.value, e.target.value)}
            className={cn(
              "h-8 w-[8.75rem] border-0 bg-transparent px-1 shadow-none focus-visible:ring-1 sm:w-[9.25rem]",
              customActive && "text-[hsl(var(--foreground))]",
            )}
          />
        </label>
        {customActive ? (
          <span className="ml-auto hidden rounded-md bg-brand/15 px-1.5 py-0.5 text-[10px] font-semibold text-brand sm:inline">
            Personalizado
          </span>
        ) : null}
      </div>

      {/* CTA */}
      <div className="sm:pl-2">
        <Link to="/pedidos" className="block">
          <Button type="button" size="sm" className="h-8 w-full gap-1.5 px-3 text-xs sm:w-auto">
            <ShoppingBag className="h-3.5 w-3.5" />
            Ver pedidos
          </Button>
        </Link>
      </div>
    </div>
  );
}
