import { useQuery } from "@tanstack/react-query";

import { settingsApi } from "../api/settingsApi";
import { settingsKeys } from "../constants/query-keys";

export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.detail(),
    queryFn: () => settingsApi.get(),
    staleTime: 1000 * 60,
  });
}
