import { useQuery } from "@tanstack/react-query";

import { locationsApi } from "@/shared/lib/locations-api";

export function useBrazilianStates() {
  return useQuery({
    queryKey: ["locations", "states"],
    queryFn: locationsApi.listStates,
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useBrazilianCities(stateId?: number | null) {
  return useQuery({
    queryKey: ["locations", "cities", stateId],
    queryFn: () => locationsApi.listCities(stateId as number),
    enabled: Boolean(stateId),
    staleTime: 24 * 60 * 60 * 1000,
  });
}
