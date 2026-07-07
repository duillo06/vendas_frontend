import type { CartItem } from "@/features/cart/types/cart.types";

import type { CheckoutFormValues } from "../schemas/checkout.schema";
import type { CheckoutPayload } from "../types/checkout.types";

export function mapCheckoutPayload(items: CartItem[], form: CheckoutFormValues): CheckoutPayload {
  return {
    customer_name: form.customerName.trim(),
    customer_phone: form.customerPhone.trim(),
    customer_email: form.customerEmail?.trim() || undefined,
    delivery_type: form.deliveryType,
    payment_method: form.paymentMethod,
    notes: form.notes?.trim() || undefined,
    change_for: form.paymentMethod === "cash" ? form.changeFor : undefined,
    address:
      form.deliveryType === "delivery" && form.address
        ? {
            street: form.address.street,
            number: form.address.number,
            complement: form.address.complement,
            neighborhood: form.address.neighborhood,
            city: form.address.city,
            state: form.address.state.toUpperCase(),
            zip_code: form.address.zipCode,
            reference: form.address.reference,
          }
        : undefined,
    items: items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
      options: item.selectedOptions.map((opt) => ({ option_id: opt.optionId })),
    })),
  };
}
