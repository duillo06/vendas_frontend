import { Link } from "react-router";
import { Gift, ShoppingCart, Sparkles } from "lucide-react";

import { useCompanyPublic } from "@/features/company";
import { useCart } from "../hooks/useCart";
import { CartItemRow } from "./CartItemRow";

import { EmptyState } from "@/shared/components/EmptyState";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { UiHint } from "@/shared/components/UiHint";
import { Button } from "@/shared/components/ui/button";
import { getFreeDeliveryHint, storefrontCopy } from "@/shared/copy/storefront";

type CartPanelProps = {
  compact?: boolean;
  onClose?: () => void;
};

export function CartPanel({ compact = false, onClose }: CartPanelProps) {
  const { items, subtotal, isEmpty, removeItem, updateQuantity } = useCart();
  const { data: company } = useCompanyPublic();

  const deliveryHint = getFreeDeliveryHint(
    subtotal,
    company?.settings.free_delivery_above,
    company?.settings.delivery_fee ?? 0,
  );

  if (isEmpty) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title={storefrontCopy.cart.empty.title}
        description={storefrontCopy.cart.empty.description}
        action={
          <Link to="/cardapio" onClick={onClose}>
            <Button>Explorar cardápio</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <UiHint icon={Sparkles} tone="warm">
        {storefrontCopy.cart.withItems(items.length)}
      </UiHint>

      {deliveryHint ? (
        <UiHint
          icon={Gift}
          tone={deliveryHint.type === "unlocked" ? "success" : "warm"}
        >
          {deliveryHint.message}
        </UiHint>
      ) : null}

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
          O valor final é confirmado no checkout. Taxas de entrega podem ser aplicadas.
        </p>

        <div className="flex flex-col gap-2">
          <Link to="/checkout" onClick={onClose}>
            <Button className="w-full" size="lg">
              Continuar para checkout
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
