import { Check } from "lucide-react";

import { formatOptionPriceModifier } from "@/features/product-builder/pricingEngine";
import { cn } from "@/shared/lib/utils";

import type { DisplayProps } from "../types";
import { usePickHandlers } from "./usePickHandlers";

function splitSizeLabel(name: string): { title: string; detail: string | null } {
  const match = name.match(/^(.*?)\s*\((.+)\)\s*$/);
  if (!match) return { title: name, detail: null };
  return { title: match[1]?.trim() || name, detail: match[2]?.trim() || null };
}

/** tamanho em faixa compacta — nome, fatias e preço sem cards altos */
export function SizeSegmentDisplay({ group, items, basePrice, onChange, disabled }: DisplayProps) {
  const { toggleSingle, isSelected } = usePickHandlers(group, items, onChange);
  const count = group.options.length;

  return (
    <div
      role="radiogroup"
      aria-label={group.name}
      className={cn(
        "grid gap-2",
        count <= 2 && "grid-cols-2",
        count === 3 && "grid-cols-3",
        count >= 4 && "grid-cols-2 sm:grid-cols-4",
      )}
    >
      {group.options.map((option) => {
        const selected = isSelected(option.id);
        const unavailable = !option.is_available;
        const { title, detail } = splitSizeLabel(option.name);
        const priceLabel = formatOptionPriceModifier(option, basePrice, 1, { absolute: true });

        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled || unavailable}
            onClick={() => toggleSingle(option.id)}
            className={cn(
              "relative flex min-h-[4.75rem] flex-col items-center justify-center gap-0.5 rounded-2xl border px-2 py-2.5 text-center transition duration-150",
              selected
                ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary-soft))] shadow-[var(--shadow-xs)] ring-1 ring-[hsl(var(--primary)/0.2)]"
                : "border-[hsl(var(--border))] bg-white hover:border-[hsl(var(--primary)/0.35)] hover:bg-[hsl(var(--muted))]/40",
              (disabled || unavailable) && "cursor-not-allowed opacity-45",
            )}
          >
            {selected ? (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-white">
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
              </span>
            ) : null}
            <span
              className={cn(
                "text-sm font-semibold leading-tight tracking-tight",
                selected ? "text-brand" : "text-[hsl(var(--foreground))]",
              )}
            >
              {title}
            </span>
            {detail ? (
              <span className="text-[11px] leading-tight text-[hsl(var(--muted-foreground))]">
                {detail}
              </span>
            ) : null}
            {priceLabel ? (
              <span
                className={cn(
                  "mt-0.5 text-xs font-semibold tabular-nums",
                  selected ? "text-brand" : "text-[hsl(var(--foreground))]/75",
                )}
              >
                {priceLabel}
              </span>
            ) : null}
            {unavailable ? (
              <span className="text-[10px] font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                Indisponível
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
