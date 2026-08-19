import { useCallback } from "react";
import { toast } from "sonner";

import { useCartStore } from "../store/cartStore";
import type { AddToCartPayload } from "../types/cart.types";
import { storefrontCopy } from "@/shared/copy/storefront";

export function useAddToCart() {
  const addItem = useCartStore((state) => state.addItem);

  return useCallback(
    (payload: AddToCartPayload) => {
      const wasEmpty = useCartStore.getState().items.length === 0;
      const result = addItem(payload);

      if (result.added <= 0) {
        toast.error(storefrontCopy.product.maxPerOrder(result.max, payload.productName));
        return result;
      }

      if (result.limited) {
        toast.success(storefrontCopy.product.maxPerOrder(result.max, payload.productName));
        return result;
      }

      toast.success("Adicionado ao carrinho", {
        description: wasEmpty
          ? storefrontCopy.addToCart.default(payload.productName)
          : storefrontCopy.addToCart.returning,
      });
      return result;
    },
    [addItem],
  );
}
