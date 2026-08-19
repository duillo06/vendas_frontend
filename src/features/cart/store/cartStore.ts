import { create } from "zustand";
import { persist } from "zustand/middleware";

import { buildCartItemId } from "../utils/cartItemId";
import { productOrderLimit, remainingForProduct } from "../utils/orderQuantity";
import type { AddToCartPayload, CartItem } from "../types/cart.types";

import { getTenantSubdomain } from "@/shared/lib/tenant-api";

interface CartState {
  items: CartItem[];
  addItem: (payload: AddToCartPayload) => { added: number; limited: boolean; max: number };
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export type AddToCartResult = { added: number; limited: boolean; max: number };

function clamp(quantity: number, max: number): number {
  return Math.min(max, Math.max(1, quantity));
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (payload) => {
        const id = buildCartItemId(payload.productId, payload.selectedOptions, payload.components);
        const max = productOrderLimit(payload.maxQuantityPerOrder);
        const want = Math.max(1, payload.quantity ?? 1);
        const existing = get().items.find((item) => item.id === id);
        const remaining = remainingForProduct(
          get().items,
          payload.productId,
          max,
          existing?.id,
        );

        if (remaining <= 0) {
          return { added: 0, limited: true, max };
        }

        const nextQty = existing
          ? clamp(existing.quantity + want, existing.quantity + remaining)
          : clamp(want, remaining);
        const limited = nextQty < (existing ? existing.quantity + want : want);

        set((state) => {
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === id
                  ? { ...item, quantity: nextQty, maxQuantityPerOrder: max }
                  : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              { ...payload, id, quantity: nextQty, maxQuantityPerOrder: max },
            ],
          };
        });

        return { added: nextQty - (existing?.quantity ?? 0), limited, max };
      },

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((item) => item.id !== id) };
          }

          const current = state.items.find((item) => item.id === id);
          if (!current) return state;

          const max = productOrderLimit(current.maxQuantityPerOrder);
          const remaining = remainingForProduct(
            state.items,
            current.productId,
            max,
            current.id,
          );
          const nextQty = clamp(quantity, remaining + current.quantity);

          return {
            items: state.items.map((item) =>
              item.id === id ? { ...item, quantity: nextQty } : item,
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
