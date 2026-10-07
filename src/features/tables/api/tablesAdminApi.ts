import { apiClient } from "@/shared/lib/api-client";

import type { DiningTable, DiningTableWrite } from "../types/table.types";

export const tablesAdminApi = {
  list: () => apiClient.get<DiningTable[]>("/admin/tables/").then((r) => r.data),

  create: (payload: DiningTableWrite) =>
    apiClient.post<DiningTable>("/admin/tables/", payload).then((r) => r.data),

  update: (id: string, payload: Partial<DiningTableWrite>) =>
    apiClient.patch<DiningTable>(`/admin/tables/${id}/`, payload).then((r) => r.data),

  remove: (id: string) => apiClient.delete(`/admin/tables/${id}/`),

  bulk: (count: number, start = 1) =>
    apiClient
      .post<DiningTable[]>("/admin/tables/bulk/", { count, start })
      .then((r) => r.data),

  regenerateQr: (id: string) =>
    apiClient.post<DiningTable>(`/admin/tables/${id}/regenerate-qr/`).then((r) => r.data),
};
