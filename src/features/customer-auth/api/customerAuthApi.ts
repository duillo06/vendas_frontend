import { apiClient } from "@/shared/lib/api-client";

import type {
  CustomerAddress,
  CustomerAddressPayload,
  CustomerAuthResponse,
  CustomerLoginPayload,
  CustomerMeResponse,
  CustomerRegisterPayload,
} from "../types/customer-auth.types";
import type { Order } from "@/features/checkout/types/checkout.types";
import type { PaginatedResponse } from "@/shared/types/api.types";

export const customerAuthApi = {
  register: (payload: CustomerRegisterPayload) =>
    apiClient.post<CustomerAuthResponse>("/auth/customer/register/", payload).then((r) => r.data),

  login: (payload: CustomerLoginPayload) =>
    apiClient.post<CustomerAuthResponse>("/auth/customer/login/", payload).then((r) => r.data),

  me: () => apiClient.get<CustomerMeResponse>("/public/account/me/").then((r) => r.data),

  logout: (refresh: string) => apiClient.post("/auth/customer/logout/", { refresh }),

  listOrders: (page = 1) =>
    apiClient
      .get<PaginatedResponse<Order>>("/public/account/orders/", { params: { page } })
      .then((r) => r.data),

  listAddresses: () =>
    apiClient.get<CustomerAddress[]>("/public/account/addresses/").then((r) => r.data),

  createAddress: (payload: CustomerAddressPayload) =>
    apiClient.post<CustomerAddress>("/public/account/addresses/", payload).then((r) => r.data),

  updateAddress: (id: string, payload: Partial<CustomerAddressPayload>) =>
    apiClient.patch<CustomerAddress>(`/public/account/addresses/${id}/`, payload).then((r) => r.data),

  deleteAddress: (id: string) => apiClient.delete(`/public/account/addresses/${id}/`),
};
