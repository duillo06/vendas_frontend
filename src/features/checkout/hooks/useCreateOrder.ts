import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { useCartStore } from "@/features/cart/store/cartStore";
import { useCustomerAuth } from "@/features/customer-auth";

import { ordersApi } from "../api/ordersApi";
import type { CheckoutFormValues } from "../schemas/checkout.schema";
import { mapCheckoutPayload } from "../utils/mapCheckoutPayload";

export function useCreateOrder() {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const { customer, isAuthenticated } = useCustomerAuth();

  return useMutation({
    mutationFn: (form: CheckoutFormValues) => {
      if (items.length === 0) {
        throw new Error("Carrinho vazio");
      }
      return ordersApi.checkout(
        mapCheckoutPayload(items, form, isAuthenticated ? customer?.id : undefined),
      );
    },
    onSuccess: (order) => {
      clearCart();
      toast.success("Pedido realizado!", { description: order.order_number });
      void navigate(`/pedido/${order.id}/confirmacao`, { replace: true, state: { order } });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Não foi possível finalizar o pedido");
    },
  });
}
