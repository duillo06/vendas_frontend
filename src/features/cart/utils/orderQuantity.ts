import { MAX_CART_QUANTITY } from "../types/cart.types";

export const DEFAULT_MAX_PER_ORDER = 10;

export function productOrderLimit(max?: number | null): number {
  if (max == null || max < 1) return DEFAULT_MAX_PER_ORDER;
  return Math.min(MAX_CART_QUANTITY, max);
}

export function quantityOfProduct(
  items: Array<{ id: string; productId: string; quantity: number }>,
  productId: string,
  exceptLineId?: string,
): number {
  return items.reduce((sum, item) => {
    if (item.productId !== productId) return sum;
    if (exceptLineId && item.id === exceptLineId) return sum;
    return sum + item.quantity;
  }, 0);
}

export function remainingForProduct(
  items: Array<{ id: string; productId: string; quantity: number }>,
  productId: string,
  maxPerOrder?: number | null,
  exceptLineId?: string,
): number {
  const max = productOrderLimit(maxPerOrder);
  return Math.max(0, max - quantityOfProduct(items, productId, exceptLineId));
}
