import { useQuery } from "@tanstack/react-query";

import { dashboardApi } from "../api/dashboardApi";
import { dashboardKeys } from "../constants/query-keys";
import type { DashboardQuery } from "../types/dashboard.types";

export function useDashboard(query: DashboardQuery = { period: "today" }) {
  const enabled = query.period !== "custom" || Boolean(query.from && query.to);

  return useQuery({
    queryKey: dashboardKeys.summary(query),
    queryFn: () => dashboardApi.get(query),
    enabled,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
  });
}
