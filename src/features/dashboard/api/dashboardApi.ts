import { apiClient } from "@/shared/lib/api-client";

import type { DashboardData } from "../types/dashboard.types";

export const dashboardApi = {
  get: () => apiClient.get<DashboardData>("/admin/dashboard/").then((response) => response.data),
};
