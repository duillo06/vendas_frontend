import { ShoppingBag } from "lucide-react";

import type { CartItem } from "@/features/cart";
import { MessageTicker } from "@/shared/components/MessageTicker";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { getFreeDeliveryHint, storefrontCopy } from "@/shared/copy/storefront";
import { cn } from "@/shared/lib/utils";

type CheckoutOrderSummaryProps = {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  deliveryType: "delivery" | "pickup";
  freeDeliveryAbove?: number | null;
  baseDeliveryFee?: number;
  compact?: boolean;
  className?: string;
};

export function CheckoutOrderSummary({
  items,
  subtotal,
  deliveryFee,
  deliveryType,
  freeDeliveryAbove,
  baseDeliveryFee = 0,
  compact = false,
  className,
}: CheckoutOrderSummaryProps) {
  const total = subtotal + deliveryFee;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryHint = getFreeDeliveryHint(subtotal, freeDeliveryAbove, baseDeliveryFee);

  return (
    <Card className={cn("border-[hsl(var(--border))] shadow-sm", className)}>
      <CardHeader className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShoppingBag className="h-4 w-4 text-brand" />
          {storefrontCopy.checkout.summaryTitle}
        </CardTitle>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          {storefrontCopy.checkout.itemCount(itemCount)}
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {!compact ? (
          <ul className="max-h-48 space-y-2 overflow-y-auto text-sm">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-2">
                <span className="min-w-0 truncate">
                  {item.quantity}x {item.productName}
                </span>
                <PriceDisplay value={item.unitPrice * item.quantity} className="shrink-0" />
              </li>
            ))}
          </ul>
        ) : null}

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-foreground))]">Subtotal</span>
            <PriceDisplay value={subtotal} />
          </div>
          {deliveryType === "delivery" ? (
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Entrega</span>
              {deliveryFee > 0 ? (
                <PriceDisplay value={deliveryFee} />
              ) : (
                <span className="font-medium text-brand">Grátis</span>
              )}
            </div>
          ) : null}
          <div className="flex justify-between border-t border-[hsl(var(--border))] pt-2 text-base font-bold">
            <span>Total estimado</span>
            <PriceDisplay value={total} className="text-brand" />
          </div>
        </div>

        {deliveryHint ? (
          <MessageTicker
            messages={[
              deliveryHint.type === "unlocked"
                ? `🎁 ${deliveryHint.message}`
                : `🚚 ${deliveryHint.message}`,
            ]}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
