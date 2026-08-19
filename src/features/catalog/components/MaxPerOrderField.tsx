import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { DEFAULT_MAX_PER_ORDER } from "@/features/cart/utils/orderQuantity";
import { MAX_CART_QUANTITY } from "@/features/cart/types/cart.types";

type MaxPerOrderFieldProps = {
  value: number;
  onChange: (value: number) => void;
  id?: string;
};

export function MaxPerOrderField({
  value,
  onChange,
  id = "max-per-order",
}: MaxPerOrderFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>No mesmo pedido, o cliente pode levar no máximo quantas unidades?</Label>
      <Input
        id={id}
        type="number"
        min={1}
        max={MAX_CART_QUANTITY}
        inputMode="numeric"
        className="h-11 max-w-[8rem] text-base"
        value={value}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isNaN(next)) {
            onChange(DEFAULT_MAX_PER_ORDER);
            return;
          }
          onChange(Math.min(MAX_CART_QUANTITY, Math.max(1, Math.trunc(next))));
        }}
      />
      <p className="text-xs text-[hsl(var(--muted-foreground))]">
        Ex.: suco 10, lanche 5. Assim ninguém pede 80 de uma vez — dá pra mudar depois.
      </p>
    </div>
  );
}
