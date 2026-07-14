import { cn } from "@/shared/lib/utils";

import type { BuilderProgress } from "./types";

type ProductBuilderProgressProps = {
  progress: BuilderProgress;
};

export function ProductBuilderProgress({ progress }: ProductBuilderProgressProps) {
  if (!progress.show) return null;

  const ratio = progress.total > 0 ? progress.completed / progress.total : 0;
  const percent = Math.round(ratio * 100);

  return (
    <div className="space-y-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-[hsl(var(--foreground))]">Monte seu pedido</span>
        <span className="text-[hsl(var(--muted-foreground))]">
          {progress.completed} de {progress.total} etapas
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/80">
        <div
          className={cn(
            "h-full rounded-full bg-brand transition-all duration-500 ease-out",
            ratio >= 1 && "bg-brand-accent",
          )}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={progress.completed}
          aria-valuemin={0}
          aria-valuemax={progress.total}
        />
      </div>
    </div>
  );
}
