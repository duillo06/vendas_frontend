import type { HTMLAttributes, ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

/** casca 3D dos gráficos — sombra em camadas + leve lift no hover */
export const dashboardPanelShellClass = cn(
  "overflow-hidden border-transparent bg-[hsl(var(--card))]",
  "shadow-[0_1px_2px_rgb(0_0_0/0.04),0_10px_28px_-10px_rgb(0_0_0/0.14),0_4px_10px_-4px_rgb(0_0_0/0.05)]",
  "ring-1 ring-black/[0.04]",
  "transition-[box-shadow,transform] duration-200 ease-out",
  "hover:-translate-y-0.5",
  "hover:shadow-[0_2px_4px_rgb(0_0_0/0.04),0_18px_40px_-14px_rgb(0_0_0/0.18),0_6px_14px_-6px_rgb(0_0_0/0.06)]",
);

type DashboardPanelProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "title" | "children">;

export function DashboardPanel({
  title,
  action,
  children,
  className,
  contentClassName,
  ...props
}: DashboardPanelProps) {
  return (
    <Card className={cn(dashboardPanelShellClass, className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 px-4 pb-0 pt-3.5">
        <div className="min-w-0 space-y-1.5">
          <CardTitle className="truncate text-sm font-semibold tracking-tight">{title}</CardTitle>
          {/* traço curto da marca no lugar da linha full-width */}
          <div className="h-0.5 w-7 rounded-full bg-brand/75" aria-hidden />
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </CardHeader>
      <CardContent className={cn("px-4 pb-4 pt-3", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
