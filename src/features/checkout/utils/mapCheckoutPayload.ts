import type { CartItem } from "@/features/cart/types/cart.types";

import type { CheckoutFormValues } from "../schemas/checkout.schema";
import type { CheckoutPayload } from "../types/checkout.types";
import { roundGeoCoordinate } from "@/shared/lib/geo";

export function mapCheckoutPayload(
  items: CartItem[],
  form: CheckoutFormValues,
  customerId?: string,
): CheckoutPayload {
  const address =
    form.deliveryType === "delivery" && form.address
      ? {
          street: form.address.street,
          number: form.address.number,
          complement: form.address.complement,
          neighborhood: form.address.neighborhood,
          city: form.address.city,
          state: form.address.state.toUpperCase(),
          zip_code: form.address.zipCode || "",
          reference: form.address.reference,
          latitude:
            form.address.latitude != null
              ? roundGeoCoordinate(form.address.latitude)
              : undefined,
          longitude:
            form.address.longitude != null
              ? roundGeoCoordinate(form.address.longitude)
              : undefined,
        }
      : undefined;

  return {
    customer_name: form.customerName.trim(),
    customer_phone: form.customerPhone.trim(),
    customer_email: form.customerEmail?.trim() || undefined,
    customer_id: customerId,
    delivery_type: form.deliveryType,
    payment_method: form.paymentMethod,
    notes: form.notes?.trim() || undefined,
    change_for: form.paymentMethod === "cash" ? form.changeFor : undefined,
    address,
    items: items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
      options: item.selectedOptions.map((opt) => ({
        option_id: opt.optionId,
        quantity: opt.quantity ?? 1,
      })),
      components: item.components?.length
        ? item.components.map((c) => c.productId)
        : undefined,
    })),
  };
}
