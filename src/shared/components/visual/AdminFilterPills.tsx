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
};

export function AdminFilterPills({ options, value, onChange, className }: AdminFilterPillsProps) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-1", className)}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value || "all"}
            type="button"
            className={cn(
              "nav-pill shrink-0 gap-2",
              active && "nav-pill-active",
            )}
            onClick={() => onChange(option.value)}
          >
            {option.label}
            {option.count !== undefined && option.count > 0 ? (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold",
                  active ? "bg-[hsl(var(--primary)/0.15)] text-brand" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
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
