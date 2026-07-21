import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ShoppingBag } from "lucide-react";

import { QuantitySelector } from "@/features/cart/components/QuantitySelector";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { Button } from "@/shared/components/ui/button";
import { storefrontCopy } from "@/shared/copy/storefront";
import { cn } from "@/shared/lib/utils";

type ProductPurchaseBarProps = {
  unitPrice: number;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAdd: () => void;
  onContinueShopping: () => void;
  disabled?: boolean;
  /** já entrou no carrinho — troca o CTA pra guiar o próximo passo */
  addedToCart?: boolean;
  priceBump?: boolean;
};

/** barra fixa — depois de adicionar, guia ir ao carrinho ou continuar */
export function ProductPurchaseBar({
  unitPrice,
  quantity,
  onQuantityChange,
  onAdd,
  onContinueShopping,
  disabled,
  addedToCart,
  priceBump,
}: ProductPurchaseBarProps) {
  const navigate = useNavigate();
  const lineTotal = Math.round(unitPrice * quantity * 100) / 100;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t border-[hsl(var(--border))] bg-white/95 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md",
        "pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] pt-3",
      )}
    >
      <div className="mx-auto max-w-5xl px-4">
        <AnimatePresence mode="wait" initial={false}>
          {addedToCart ? (
            <motion.div
              key="after-add"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col gap-3"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-[hsl(var(--primary-foreground))]">
                  <Check className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {storefrontCopy.product.addedToCartTitle}
                  </p>
                  <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">
                    {storefrontCopy.product.addedToCartHint}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  size="lg"
                  className="h-12 w-full gap-2 font-semibold sm:order-2 sm:flex-1"
                  onClick={() => navigate("/carrinho")}
                >
                  <ShoppingBag className="h-4 w-4 shrink-0" aria-hidden />
                  {storefrontCopy.product.goToCart}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-12 w-full sm:order-1 sm:flex-1"
                  onClick={onContinueShopping}
                >
                  {storefrontCopy.product.continueShopping}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="before-add"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              className="flex items-center gap-3"
            >
              <div className="min-w-0 shrink-0">
                <p className="text-[10px] font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                  Total
                </p>
                <PriceDisplay
                  value={lineTotal}
                  className={cn(
                    "text-lg font-bold tabular-nums text-brand sm:text-xl",
                    priceBump && "animate-price-pop",
                  )}
                />
              </div>

              <QuantitySelector
                value={quantity}
                onChange={onQuantityChange}
                className="h-11 shrink-0 rounded-xl border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40"
              />

              <Button
                type="button"
                size="lg"
                className="h-12 min-w-0 flex-1 gap-2 text-sm font-semibold sm:text-base"
                disabled={disabled}
                onClick={onAdd}
              >
                <span className="truncate">{storefrontCopy.product.addToCart}</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
