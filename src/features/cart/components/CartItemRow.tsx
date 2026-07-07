import { Link } from "react-router";
import { Trash2 } from "lucide-react";

import type { CartItem } from "../types/cart.types";
import { QuantitySelector } from "./QuantitySelector";

import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { Button } from "@/shared/components/ui/button";

type CartItemRowProps = {
  item: CartItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

export function CartItemRow({ item, onQuantityChange, onRemove }: CartItemRowProps) {
  const lineTotal = item.unitPrice * item.quantity;

  return (
    <article className="flex gap-3 rounded-lg border border-[hsl(var(--border))] p-3">
      <Link to={`/produto/${item.productSlug}`} className="shrink-0">
        <div className="h-16 w-16 overflow-hidden rounded-md bg-[hsl(var(--muted))]">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] text-[hsl(var(--muted-foreground))]">
              Sem foto
            </div>
          )}
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to={`/produto/${item.productSlug}`} className="font-medium hover:underline">
              {item.productName}
            </Link>
            {item.selectedOptions.length > 0 ? (
              <ul className="mt-1 space-y-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                {item.selectedOptions.map((option) => (
                  <li key={option.optionId}>
                    {option.optionGroupName}: {option.name}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 shrink-0 p-0 text-[hsl(var(--muted-foreground))] hover:text-red-600"
            aria-label={`Remover ${item.productName}`}
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <QuantitySelector value={item.quantity} onChange={onQuantityChange} />
          <PriceDisplay value={lineTotal} className="font-semibold text-[hsl(var(--primary))]" />
        </div>
      </div>
    </article>
  );
}
