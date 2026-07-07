import { useQuery } from "@tanstack/react-query";

import { catalogApi } from "../api/catalogApi";
import { catalogKeys } from "../constants/query-keys";

export function useCategories() {
  return useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: () => catalogApi.getCategories(),
    staleTime: 1000 * 60 * 5,
  });
}
