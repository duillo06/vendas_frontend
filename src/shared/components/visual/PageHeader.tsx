import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

/** paleta derivada do tema — chart-1..4 vêm das vars CSS da loja */
export type VisualAccent = "chart-1" | "chart-2" | "chart-3" | "chart-4";

const tileClass: Record<VisualAccent, string> = {
  "chart-1": "tile-chart-1",
  "chart-2": "tile-chart-2",
  "chart-3": "tile-chart-3",
  "chart-4": "tile-chart-4",
};

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  accent?: VisualAccent;
  action?: ReactNode;
  /**
   * @deprecated hero colorido saiu — use default (tipográfico leve)
   * mantido só pra não quebrar imports; renderiza igual ao default
   */
  variant?: "default" | "hero";
  /** compact = storefront; comfortable = backoffice */
  density?: "compact" | "comfortable";
  /** esconde no mobile */
  mobileHidden?: boolean;
  className?: string;
};

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  accent = "chart-1",
  action,
  density = "comfortable",
  mobileHidden = false,
  className,
}: PageHeaderProps) {
  const compact = density === "compact";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        mobileHidden && "hidden sm:flex",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {Icon ? (
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-xl",
              compact ? "h-9 w-9" : "h-11 w-11",
              tileClass[accent],
            )}
          >
            <Icon className={cn(compact ? "h-4 w-4" : "h-5 w-5")} />
          </span>
        ) : null}
        <div className="min-w-0 space-y-0.5">
          <h1
            className={cn(
              "truncate font-semibold tracking-tight text-[hsl(var(--foreground))]",
              compact ? "text-lg" : "text-xl sm:text-2xl",
            )}
          >
            {title}
          </h1>
          {subtitle ? (
            <p
              className={cn(
                "max-w-2xl text-[hsl(var(--muted-foreground))]",
                compact ? "text-xs sm:text-sm" : "text-sm",
              )}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0 sm:pt-0.5">{action}</div> : null}
    </div>
  );
}
