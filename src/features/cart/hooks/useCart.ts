import { useMemo } from "react";

import { useCartStore } from "../store/cartStore";

export function useCart() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items],
  );

  return {
    items,
    totalItems,
    subtotal,
    isEmpty: items.length === 0,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
