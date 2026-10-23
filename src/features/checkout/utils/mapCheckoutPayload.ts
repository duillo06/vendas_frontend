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
          city_id: form.address.cityId,
          state_id: form.address.stateId,
          zip_code: "",
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

  const isMesa = form.deliveryType === "dine_in";

  return {
    customer_name: isMesa
      ? form.customerName?.trim() || undefined
      : form.customerName!.trim(),
    customer_phone: isMesa ? undefined : form.customerPhone!.trim(),
    customer_email: isMesa ? undefined : form.customerEmail?.trim() || undefined,
    customer_id: isMesa ? undefined : customerId,
    delivery_type: form.deliveryType,
    payment_method: isMesa ? "pay_at_venue" : form.paymentMethod,
    notes: form.notes?.trim() || undefined,
    change_for: !isMesa && form.paymentMethod === "cash" ? form.changeFor : undefined,
    table_id: isMesa ? form.tableId : undefined,
    qr_token: isMesa ? form.qrToken : undefined,
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
