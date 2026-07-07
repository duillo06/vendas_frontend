import { Link } from "react-router";
import { ShoppingCart } from "lucide-react";

import { useCart } from "../hooks/useCart";
import { CartItemRow } from "./CartItemRow";

import { EmptyState } from "@/shared/components/EmptyState";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { Button } from "@/shared/components/ui/button";

type CartPanelProps = {
  compact?: boolean;
  onClose?: () => void;
};

export function CartPanel({ compact = false, onClose }: CartPanelProps) {
  const { items, subtotal, isEmpty, removeItem, updateQuantity } = useCart();

  if (isEmpty) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Seu carrinho está vazio"
        description="Explore o cardápio e adicione seus favoritos."
        action={
          <Link to="/cardapio" onClick={onClose}>
            <Button variant="outline">Ver cardápio</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id}>
            <CartItemRow
              item={item}
              onQuantityChange={(quantity) => updateQuantity(item.id, quantity)}
              onRemove={() => removeItem(item.id)}
            />
          </li>
        ))}
      </ul>

      <div className="mt-auto space-y-3 border-t border-[hsl(var(--border))] pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[hsl(var(--muted-foreground))]">Subtotal (estimativa)</span>
          <PriceDisplay value={subtotal} className="text-lg font-bold" />
        </div>

        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Valor final confirmado no checkout. Taxas de entrega podem ser aplicadas.
        </p>

        <div className="flex flex-col gap-2">
          <Link to="/checkout" onClick={onClose}>
            <Button className="w-full" size="lg">
              Ir para checkout
            </Button>
          </Link>
          {compact ? (
            <Link to="/carrinho" onClick={onClose}>
              <Button variant="outline" className="w-full">
                Ver carrinho completo
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
