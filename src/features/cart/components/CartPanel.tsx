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
import { Button, buttonVariants } from "@/shared/components/ui/button";
import { getFreeDeliveryHint, storefrontCopy } from "@/shared/copy/storefront";
import { cn } from "@/shared/lib/utils";

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
    <div className="flex flex-col gap-4 pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))]">
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

      {/* barra fixa — CTA sempre à mão, sem caçar no fim da página */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 border-t border-[hsl(var(--border))] bg-white/95 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md",
          "pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] pt-3",
        )}
      >
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4">
          <div className="min-w-0 shrink-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              {storefrontCopy.cart.subtotalLabel}
            </p>
            <PriceDisplay value={subtotal} className="text-lg font-bold tabular-nums text-brand sm:text-xl" />
          </div>

          <Link
            to="/checkout"
            onClick={onClose}
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "h-12 min-w-0 flex-1 whitespace-nowrap text-sm font-semibold sm:text-base",
            )}
          >
            {storefrontCopy.cart.checkoutCta}
          </Link>
        </div>
        <p className="mx-auto mt-1.5 max-w-5xl px-4 text-[11px] text-[hsl(var(--muted-foreground))]">
          {storefrontCopy.cart.feesHint}
        </p>
      </div>
    </div>
  );
}
