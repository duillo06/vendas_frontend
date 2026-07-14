import { Check, Minus, Plus } from "lucide-react";

import type { Option } from "@/features/catalog/types/catalog.types";
import { formatOptionPriceModifier } from "@/features/product-builder/pricingEngine";
import { cn } from "@/shared/lib/utils";

type OptionCardProps = {
  option: Option;
  basePrice: number;
  selected: boolean;
  quantity?: number;
  disabled?: boolean;
  inputType?: "radio" | "checkbox" | "none";
  name?: string;
  onToggle?: () => void;
  layout?: "row" | "card" | "image";
  showStepper?: boolean;
  onIncrement?: () => void;
  onDecrement?: () => void;
};

export function OptionCard({
  option,
  basePrice,
  selected,
  quantity = 0,
  disabled,
  inputType = "radio",
  name,
  onToggle,
  layout = "card",
  showStepper,
  onIncrement,
  onDecrement,
}: OptionCardProps) {
  const priceLabel = formatOptionPriceModifier(option, basePrice, showStepper ? quantity || 1 : 1);
  const unavailable = !option.is_available;

  return (
    <div
      className={cn(
        "group relative flex transition-all duration-150",
        layout === "image" ? "flex-col overflow-hidden rounded-xl border" : "",
        layout !== "image" && "cursor-pointer",
        layout === "card"
          ? "min-h-11 flex-col justify-between rounded-xl border p-3 sm:p-4"
          : layout === "row"
            ? "min-h-11 items-center justify-between rounded-lg border px-4 py-3"
            : "",
        layout !== "image" &&
          (selected
            ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 shadow-sm ring-1 ring-[hsl(var(--primary)/0.2)]"
            : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.35)] hover:bg-[hsl(var(--muted))]/40"),
        (disabled || unavailable) && layout !== "image" && "cursor-not-allowed opacity-50",
      )}
    >
      {layout === "image" && option.image_url ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[hsl(var(--muted))]">
          <img src={option.image_url} alt={option.name} className="h-full w-full object-cover" />
          {selected ? (
            <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white">
              <Check className="h-3.5 w-3.5" />
            </span>
          ) : null}
        </div>
      ) : null}

      <label
        className={cn(
          "flex w-full gap-3",
          layout === "image" ? "cursor-pointer flex-col p-3" : "items-center",
          layout === "card" ? "flex-col sm:flex-row sm:items-center" : "",
          showStepper ? "justify-between" : "",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {inputType !== "none" ? (
            <input
              type={inputType}
              name={name}
              checked={selected}
              disabled={disabled || unavailable}
              onChange={onToggle}
              className="h-4 w-4 shrink-0 accent-[hsl(var(--primary))]"
            />
          ) : null}
          {option.icon ? <span className="text-lg">{option.icon}</span> : null}
          <div className="min-w-0">
            <span className="text-sm font-medium leading-snug">{option.name}</span>
            {option.description ? (
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{option.description}</p>
            ) : null}
          </div>
        </div>

        {showStepper ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-white transition hover:bg-[hsl(var(--muted))]"
              disabled={disabled || unavailable || quantity <= 0}
              onClick={onDecrement}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-[1.5rem] text-center text-sm font-semibold tabular-nums">{quantity}</span>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-white transition hover:bg-[hsl(var(--muted))]"
              disabled={disabled || unavailable}
              onClick={onIncrement}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {priceLabel && !showStepper ? (
          <span className="text-sm text-[hsl(var(--muted-foreground))] sm:ml-auto">{priceLabel}</span>
        ) : null}
      </label>

      {selected && layout !== "image" && !showStepper ? (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white">
          <Check className="h-3 w-3" />
        </span>
      ) : null}

      {unavailable ? (
        <span className="px-3 pb-2 text-[10px] font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
          Indisponível
        </span>
      ) : null}
    </div>
  );
}
