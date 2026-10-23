import { apiClient } from "@/shared/lib/api-client";

import type { PublicTableContext } from "../types/table.types";

export type PublicTableContextFull = PublicTableContext & { qr_token?: string };

export const tablesPublicApi = {
  getByToken: (qrToken: string) =>
    apiClient.get<PublicTableContextFull>(`/public/tables/${qrToken}/`).then((r) => r.data),

  getByNumber: (number: string) =>
    apiClient
      .get<PublicTableContextFull>(`/public/tables/by-number/${encodeURIComponent(number)}/`)
      .then((r) => r.data),
};
