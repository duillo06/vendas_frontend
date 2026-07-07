import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-[hsl(var(--border))] px-6 py-12 text-center",
        className,
      )}
    >
      {Icon ? <Icon className="mb-4 h-10 w-10 text-[hsl(var(--muted-foreground))]" /> : null}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
