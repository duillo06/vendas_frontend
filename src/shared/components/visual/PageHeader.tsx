import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

/** paleta derivada do tema — chart-1..4 vêm das vars CSS da loja */
export type VisualAccent = "chart-1" | "chart-2" | "chart-3" | "chart-4";

const tileClass: Record<VisualAccent, string> = {
  "chart-1": "tile-chart-1 ring-4 ring-[hsl(var(--chart-1)/0.15)]",
  "chart-2": "tile-chart-2 ring-4 ring-[hsl(var(--chart-2)/0.15)]",
  "chart-3": "tile-chart-3 ring-4 ring-[hsl(var(--chart-3)/0.15)]",
  "chart-4": "tile-chart-4 ring-4 ring-[hsl(var(--chart-4)/0.15)]",
};

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  accent?: VisualAccent;
  action?: ReactNode;
  variant?: "default" | "hero";
  /** compact = faixa fina (storefront); comfortable = bloco maior (backoffice) */
  density?: "compact" | "comfortable";
  /** esconde o hero no mobile — útil no storefront onde o header já identifica a loja */
  mobileHidden?: boolean;
  className?: string;
};

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  accent = "chart-1",
  action,
  variant = "default",
  density = "compact",
  mobileHidden = false,
  className,
}: PageHeaderProps) {
  if (variant === "hero") {
    if (density === "compact") {
      return (
        <section
          className={cn(
            "gradient-hero relative overflow-hidden rounded-xl px-4 py-3 text-[hsl(var(--primary-foreground))] shadow-md sm:rounded-2xl sm:px-5 sm:py-3.5",
            mobileHidden && "hidden sm:block",
            className,
          )}
        >
          <div className="relative flex items-center gap-3">
            {Icon ? (
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20 ring-1 ring-white/25 sm:h-10 sm:w-10 sm:rounded-xl">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
            ) : null}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-bold tracking-tight sm:text-lg">{title}</h1>
              {subtitle ? (
                <p className="truncate text-xs text-white/85 sm:text-sm">{subtitle}</p>
              ) : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
          </div>
        </section>
      );
    }

    return (
      <section
        className={cn(
          "gradient-hero relative overflow-hidden rounded-2xl p-6 text-[hsl(var(--primary-foreground))] shadow-lg sm:p-8",
          mobileHidden && "hidden sm:block",
          className,
        )}
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 left-1/3 h-32 w-32 rounded-full bg-black/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            {Icon ? (
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30 backdrop-blur">
                <Icon className="h-6 w-6" />
              </span>
            ) : null}
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
              {subtitle ? <p className="mt-2 max-w-xl text-sm text-white/90 sm:text-base">{subtitle}</p> : null}
            </div>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </section>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="flex gap-4">
        {Icon ? (
          <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", tileClass[accent])}>
            <Icon className="h-6 w-6" />
          </span>
        ) : null}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="max-w-2xl text-[hsl(var(--muted-foreground))]">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
