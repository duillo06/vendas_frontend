import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { adminCopy } from "@/shared/copy/admin";

import { ordersAdminApi } from "../api/ordersAdminApi";

export function useResetOrderNumbering() {
  return useMutation({
    mutationFn: () => ordersAdminApi.resetNumbering(),
    onSuccess: (data) => {
      toast.success(adminCopy.orders.toasts.numberingReset, {
        description: `O próximo pedido será ${data.next_order_number}.`,
      });
    },
    onError: () => {
      toast.error(adminCopy.orders.toasts.numberingResetFailed);
    },
  });
}
