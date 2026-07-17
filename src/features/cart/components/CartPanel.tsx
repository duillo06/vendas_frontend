import { Link } from "react-router";
import { Gift, ShoppingCart } from "lucide-react";

import { CartUpsell } from "./CartUpsell";
import { useCompanyPublic } from "@/features/company";
import { useProducts } from "@/features/catalog";
import { useCart } from "../hooks/useCart";
import { CartItemRow } from "./CartItemRow";

import { EmptyState } from "@/shared/components/EmptyState";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { UiHint } from "@/shared/components/UiHint";
import { Button } from "@/shared/components/ui/button";
import { getFreeDeliveryHint, storefrontCopy } from "@/shared/copy/storefront";

type CartPanelProps = {
  onClose?: () => void;
};

export function CartPanel({ onClose }: CartPanelProps) {
  const { items, subtotal, isEmpty, removeItem, updateQuantity } = useCart();
  const { data: company } = useCompanyPublic();
  const { data: catalogPage } = useProducts({ page_size: 48 });

  const deliveryHint = getFreeDeliveryHint(
    subtotal,
    company?.settings.free_delivery_above,
    company?.settings.delivery_fee ?? 0,
  );

  if (isEmpty) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title={`${storefrontCopy.cart.empty.emoji} ${storefrontCopy.cart.empty.title}`}
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
    <div className="flex flex-col gap-4">
      {deliveryHint ? (
        <UiHint icon={Gift} tone={deliveryHint.type === "unlocked" ? "success" : "warm"}>
          {deliveryHint.type === "unlocked" ? `🎁 ${deliveryHint.message}` : deliveryHint.message}
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

      {catalogPage?.results ? (
        <CartUpsell
          products={catalogPage.results}
          cartProductIds={items.map((item) => item.productId)}
        />
      ) : null}

      <div className="mt-2 space-y-3 border-t border-[hsl(var(--border))] pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[hsl(var(--muted-foreground))]">Subtotal (estimativa)</span>
          <PriceDisplay value={subtotal} className="text-lg font-bold text-brand" />
        </div>

        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          O valor final é confirmado no checkout. Taxas de entrega podem ser aplicadas.
        </p>

        <Link to="/checkout" onClick={onClose} className="block">
          <Button className="w-full gap-2" size="lg">
            Continuar para checkout
            <span aria-hidden>🚀</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
