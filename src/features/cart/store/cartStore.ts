import { create } from "zustand";
import { persist } from "zustand/middleware";

import { buildCartItemId } from "../utils/cartItemId";
import type { AddToCartPayload, CartItem } from "../types/cart.types";
import { MAX_CART_QUANTITY } from "../types/cart.types";

import { getTenantSubdomain } from "@/shared/lib/tenant-api";

interface CartState {
  items: CartItem[];
  addItem: (payload: AddToCartPayload) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

function clampQuantity(quantity: number): number {
  return Math.min(MAX_CART_QUANTITY, Math.max(1, quantity));
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (payload) =>
        set((state) => {
          const optionIds = payload.selectedOptions.map((o) => o.optionId);
          const id = buildCartItemId(payload.productId, optionIds);
          const quantity = clampQuantity(payload.quantity ?? 1);
          const existing = state.items.find((item) => item.id === id);

          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === id
                  ? { ...item, quantity: clampQuantity(item.quantity + quantity) }
                  : item,
              ),
            };
          }

          return {
            items: [...state.items, { ...payload, id, quantity }],
          };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((item) => item.id !== id) };
          }

          return {
            items: state.items.map((item) =>
              item.id === id ? { ...item, quantity: clampQuantity(quantity) } : item,
            ),
          };
        }),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: `foodservice-cart-${getTenantSubdomain()}`,
    },
  ),
);
