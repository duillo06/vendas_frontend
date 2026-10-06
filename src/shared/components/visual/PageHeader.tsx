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
  // ícone na mesma linha do título (altura próxima do type-title)
  const iconBox = compact ? "h-8 w-8" : "h-9 w-9";
  const subtitlePad = Icon ? (compact ? "sm:pl-11" : "sm:pl-12") : undefined;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        mobileHidden && "hidden sm:flex",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          {Icon ? (
            <span
              className={cn(
                "flex shrink-0 items-center justify-center rounded-xl",
                iconBox,
                tileClass[accent],
              )}
            >
              <Icon className={cn(compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
            </span>
          ) : null}
          <h1
            className={cn(
              "min-w-0 truncate tracking-tight text-[hsl(var(--foreground))]",
              compact ? "type-subtitle" : "type-title",
            )}
          >
            {title}
          </h1>
        </div>
        {subtitle ? (
          <p className={cn("mt-1 max-w-2xl type-caption", !compact && "sm:text-sm", subtitlePad)}>
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 sm:pt-0.5">{action}</div> : null}
    </div>
  );
}
