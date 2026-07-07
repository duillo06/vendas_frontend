import type { PaginatedResponse } from "@/shared/types/api.types";
import { apiClient } from "@/shared/lib/api-client";

import type { OrderAdminDetail, OrderFilters, OrderListItem } from "../types/order-admin.types";

export const ordersAdminApi = {
  list: (filters?: OrderFilters) =>
    apiClient
      .get<PaginatedResponse<OrderListItem>>("/admin/orders/", {
        params: {
          ...filters,
          active: filters?.active ? "true" : undefined,
        },
      })
      .then((response) => response.data),

  get: (id: string) =>
    apiClient.get<OrderAdminDetail>(`/admin/orders/${id}/`).then((response) => response.data),

  updateStatus: (id: string, data: { status: string; notes?: string }) =>
    apiClient
      .patch<OrderAdminDetail>(`/admin/orders/${id}/status/`, data)
      .then((response) => response.data),

  updatePayment: (id: string, data: { status: "paid" }) =>
    apiClient
      .patch<OrderAdminDetail>(`/admin/orders/${id}/payment/`, data)
      .then((response) => response.data),
};
