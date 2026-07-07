import { apiClient } from "@/shared/lib/api-client";

import type { CheckoutPayload, Order } from "../types/checkout.types";

export const ordersApi = {
  checkout: (payload: CheckoutPayload) =>
    apiClient.post<Order>("/public/orders/checkout/", payload).then((r) => r.data),

  getOrder: (id: string) =>
    apiClient.get<Order>(`/public/orders/${id}/`).then((r) => r.data),
};
