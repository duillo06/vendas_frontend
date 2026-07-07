import { useQuery } from "@tanstack/react-query";

import { ordersAdminApi } from "../api/ordersAdminApi";
import { orderAdminKeys } from "../constants/order-admin-keys";
import type { OrderFilters } from "../types/order-admin.types";

export function useOrders(filters?: OrderFilters, options?: { polling?: boolean }) {
  return useQuery({
    queryKey: orderAdminKeys.list(filters),
    queryFn: () => ordersAdminApi.list(filters),
    staleTime: 1000 * 30,
    refetchInterval: options?.polling ? 1000 * 30 : false,
  });
}
