import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ordersAdminApi } from "../api/ordersAdminApi";
import { orderAdminKeys } from "../constants/order-admin-keys";
import { adminCopy } from "@/shared/copy/admin";
import type { OrderAdminDetail } from "../types/order-admin.types";

export function useUpdateOrderStatus(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { status: string; notes?: string }) =>
      ordersAdminApi.updateStatus(orderId, data),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: orderAdminKeys.detail(orderId) });
      const previous = queryClient.getQueryData<OrderAdminDetail>(orderAdminKeys.detail(orderId));
      if (previous) {
        queryClient.setQueryData<OrderAdminDetail>(orderAdminKeys.detail(orderId), {
          ...previous,
          status: variables.status as OrderAdminDetail["status"],
        });
      }
      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(orderAdminKeys.detail(orderId), context.previous);
      }
      toast.error(error.message || "Não foi possível atualizar o status");
    },
    onSuccess: (_data, variables) => {
      toast.success(
        variables.status === "completed"
          ? adminCopy.orders.toasts.orderCompleted
          : adminCopy.orders.toasts.statusUpdated,
      );
      void queryClient.invalidateQueries({ queryKey: orderAdminKeys.all });
    },
  });
}
