import { useCallback } from "react";
import { toast } from "sonner";

import { useCartStore } from "../store/cartStore";
import type { AddToCartPayload } from "../types/cart.types";

export function useAddToCart() {
  const addItem = useCartStore((state) => state.addItem);

  return useCallback(
    (payload: AddToCartPayload) => {
      addItem(payload);
      toast.success("Adicionado ao carrinho", {
        description: payload.productName,
      });
    },
    [addItem],
  );
}
