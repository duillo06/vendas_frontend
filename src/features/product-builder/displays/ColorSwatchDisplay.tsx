import type { DisplayProps } from "../types";
import { usePickHandlers } from "./usePickHandlers";

function getOptionColor(option: DisplayProps["group"]["options"][number]): string | null {
  const color = option.metadata?.color;
  return typeof color === "string" && color.trim() ? color.trim() : null;
}

export function ColorSwatchDisplay({ group, items, onChange, disabled }: DisplayProps) {
  const { toggleSingle, toggleMultiple, isSelected, atMax } = usePickHandlers(group, items, onChange);

  return (
    <div className="flex flex-wrap gap-3">
      {group.options.map((option) => {
        const selected = isSelected(option.id);
        const color = getOptionColor(option) ?? "#94a3b8";
        const unavailable = !option.is_available;

        return (
          <button
            key={option.id}
            type="button"
            title={option.name}
            disabled={disabled || unavailable || (atMax && !selected)}
            onClick={() =>
              group.selection_type === "single" ? toggleSingle(option.id) : toggleMultiple(option.id)
            }
            className={`group/swatch flex flex-col items-center gap-2 rounded-xl p-2 transition ${
              selected ? "bg-[hsl(var(--primary-soft))] ring-2 ring-[hsl(var(--primary)/0.35)]" : "hover:bg-[hsl(var(--muted))]/40"
            }`}
          >
            <span
              className="h-11 w-11 rounded-full border-2 border-white shadow-sm ring-1 ring-[hsl(var(--border))]"
              style={{ backgroundColor: color }}
            />
            <span className="max-w-[4.5rem] truncate text-xs font-medium">{option.name}</span>
            {option.stock_quantity != null && option.stock_quantity <= 3 ? (
              <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                Restam {option.stock_quantity}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
