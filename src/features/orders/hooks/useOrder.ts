import { useQuery } from "@tanstack/react-query";

import { ordersApi } from "@/features/checkout/api/ordersApi";

export const orderKeys = {
  detail: (id: string) => ["orders", id] as const,
};

export function useOrder(orderId: string | undefined, options?: { polling?: boolean }) {
  return useQuery({
    queryKey: orderKeys.detail(orderId ?? ""),
    queryFn: () => ordersApi.getOrder(orderId!),
    enabled: Boolean(orderId),
    refetchInterval: options?.polling ? 10_000 : false,
  });
}
