import { cn } from "@/shared/lib/utils";

type FilterOption = {
  value: string;
  label: string;
  count?: number;
};

type AdminFilterPillsProps = {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  /** sm = chips baixos pra toolbar de listagem */
  size?: "md" | "sm";
};

export function AdminFilterPills({
  options,
  value,
  onChange,
  className,
  size = "md",
}: AdminFilterPillsProps) {
  const compact = size === "sm";

  return (
    <div className={cn("flex gap-1.5 overflow-x-auto pb-0.5", className)}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value || "all"}
            type="button"
            className={cn(
              "shrink-0 gap-1.5 transition",
              compact
                ? cn(
                    "inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium",
                    active
                      ? "border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary-soft))] text-brand"
                      : "border-[hsl(var(--border))] bg-white text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/0.3)] hover:text-[hsl(var(--foreground))]",
                  )
                : cn("nav-pill", active && "nav-pill-active"),
            )}
            onClick={() => onChange(option.value)}
          >
            {option.label}
            {option.count !== undefined && option.count > 0 ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  active
                    ? "bg-[hsl(var(--primary)/0.15)] text-brand"
                    : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
                )}
              >
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
