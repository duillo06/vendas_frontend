import { apiClient } from "@/shared/lib/api-client";

import type { CustomerAdminDetail, CustomerAdminListItem } from "@/features/customer-auth";
import type { PaginatedResponse } from "@/shared/types/api.types";

export const customersAdminApi = {
  list: (params?: { search?: string; page?: number }) =>
    apiClient
      .get<PaginatedResponse<CustomerAdminListItem>>("/admin/customers/", { params })
      .then((r) => r.data),

  get: (id: string) =>
    apiClient.get<CustomerAdminDetail>(`/admin/customers/${id}/`).then((r) => r.data),
};
