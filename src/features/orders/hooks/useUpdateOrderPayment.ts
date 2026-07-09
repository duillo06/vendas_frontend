import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ordersAdminApi } from "../api/ordersAdminApi";
import { orderAdminKeys } from "../constants/order-admin-keys";
import { adminCopy } from "@/shared/copy/admin";

export function useUpdateOrderPayment(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ordersAdminApi.updatePayment(orderId, { status: "paid" }),
    onSuccess: () => {
      toast.success(adminCopy.orders.toasts.paymentRegistered);
      void queryClient.invalidateQueries({ queryKey: orderAdminKeys.all });
    },
    onError: () => {
      toast.error("Não foi possível registrar o pagamento");
    },
  });
}
