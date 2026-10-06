import { apiClient } from "@/shared/lib/api-client";

import type { DashboardData, DashboardQuery } from "../types/dashboard.types";

export const dashboardApi = {
  get: (query: DashboardQuery = { period: "today" }) =>
    apiClient
      .get<DashboardData>("/admin/dashboard/", {
        params: {
          period: query.period,
          ...(query.period === "custom" && query.from && query.to
            ? { from: query.from, to: query.to }
            : {}),
        },
      })
      .then((response) => response.data),
};
