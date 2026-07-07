import { useQuery } from "@tanstack/react-query";

import { catalogApi } from "../api/catalogApi";
import { catalogKeys } from "../constants/query-keys";
import type { ProductFilters } from "../types/catalog.types";

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: catalogKeys.products(filters),
    queryFn: () => catalogApi.getProducts(filters),
    staleTime: 1000 * 60 * 2,
  });
}
