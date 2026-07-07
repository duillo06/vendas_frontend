import { Minus, Plus } from "lucide-react";

import { MAX_CART_QUANTITY } from "../types/cart.types";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

type QuantitySelectorProps = {
  value: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
  className?: string;
};

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = MAX_CART_QUANTITY,
  className,
}: QuantitySelectorProps) {
  return (
    <div className={cn("inline-flex items-center rounded-md border border-[hsl(var(--border))]", className)}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-10 w-10 shrink-0 rounded-none p-0"
        aria-label="Diminuir quantidade"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="min-w-[2.5rem] text-center text-sm font-medium tabular-nums" aria-live="polite">
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-10 w-10 shrink-0 rounded-none p-0"
        aria-label="Aumentar quantidade"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
