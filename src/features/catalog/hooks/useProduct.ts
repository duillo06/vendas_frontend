import { useQuery } from "@tanstack/react-query";

import { catalogApi } from "../api/catalogApi";
import { catalogKeys } from "../constants/query-keys";

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: catalogKeys.product(slug ?? ""),
    queryFn: () => catalogApi.getProduct(slug!),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 2,
  });
}
