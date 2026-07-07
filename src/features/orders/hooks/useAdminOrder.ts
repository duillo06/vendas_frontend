import { useQuery } from "@tanstack/react-query";

import { ordersAdminApi } from "../api/ordersAdminApi";
import { orderAdminKeys } from "../constants/order-admin-keys";

export function useAdminOrder(orderId: string | undefined, options?: { polling?: boolean }) {
  return useQuery({
    queryKey: orderAdminKeys.detail(orderId ?? ""),
    queryFn: () => ordersAdminApi.get(orderId!),
    enabled: Boolean(orderId),
    refetchInterval: options?.polling ? 10_000 : false,
  });
}
