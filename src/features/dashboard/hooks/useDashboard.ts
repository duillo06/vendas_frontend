import { useQuery } from "@tanstack/react-query";

import { dashboardApi } from "../api/dashboardApi";
import { dashboardKeys } from "../constants/query-keys";

export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: () => dashboardApi.get(),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
  });
}
