import { z } from "zod";

import { isBrazilianMobile, MOBILE_PHONE_MESSAGE } from "@/shared/lib/phone";

const addressSchema = z
  .object({
    street: z.string().min(1, "Rua é obrigatória"),
    number: z.string().min(1, "Número é obrigatório"),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, "Bairro é obrigatório"),
    city: z.string().min(1, "Cidade é obrigatória"),
    state: z.string().length(2, "UF com 2 letras"),
    cityId: z.number().int().positive().nullable().optional(),
    stateId: z.number().int().positive().nullable().optional(),
    zipCode: z.string().optional(),
    reference: z.string().optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    fromGeo: z.boolean().optional(),
  });

const customerPhoneSchema = z
  .string()
  .min(1, "Celular é obrigatório")
  .refine(isBrazilianMobile, MOBILE_PHONE_MESSAGE);

export const checkoutStep1Schema = z.object({
  customerName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  customerPhone: customerPhoneSchema,
  customerEmail: z.string().email("E-mail inválido").optional().or(z.literal("")),
});

export const checkoutStep2Schema = z.discriminatedUnion("deliveryType", [
  z.object({ deliveryType: z.literal("pickup") }),
  z.object({
    deliveryType: z.literal("dine_in"),
    tableId: z.string().uuid().optional(),
    qrToken: z.string().min(1).optional(),
  }),
  z.object({
    deliveryType: z.literal("delivery"),
    address: addressSchema,
  }),
]);

export const checkoutStep3Schema = z.discriminatedUnion("paymentMethod", [
  z.object({
    paymentMethod: z.literal("cash"),
    changeFor: z.number({ error: "Informe o valor para troco" }).positive("Informe um valor válido"),
    notes: z.string().max(500).optional(),
  }),
  z.object({
    paymentMethod: z.enum(["pix", "card_on_delivery"]),
    notes: z.string().max(500).optional(),
  }),
]);

export const checkoutSchema = z
  .object({
    customerName: z.string().optional().or(z.literal("")),
    customerPhone: z.string().optional().or(z.literal("")),
    customerEmail: z.string().email("E-mail inválido").optional().or(z.literal("")),
    deliveryType: z.enum(["delivery", "pickup", "dine_in"]),
    paymentMethod: z.enum(["cash", "pix", "card_on_delivery", "pay_at_venue"]),
    notes: z.string().max(500).optional(),
    changeFor: z.number().positive("Informe um valor válido").optional(),
    address: addressSchema.optional(),
    tableId: z.string().uuid().optional(),
    qrToken: z.string().optional(),
  })
  .refine(
    (data) =>
      data.deliveryType === "dine_in" ||
      Boolean(data.customerName && data.customerName.trim().length >= 2),
    { message: "Nome deve ter pelo menos 2 caracteres", path: ["customerName"] },
  )
  .refine(
    (data) => data.deliveryType === "dine_in" || isBrazilianMobile(data.customerPhone || ""),
    { message: MOBILE_PHONE_MESSAGE, path: ["customerPhone"] },
  )
  .refine((data) => data.deliveryType !== "delivery" || Boolean(data.address), {
    message: "Endereço é obrigatório para entrega",
    path: ["address"],
  })
  .refine(
    (data) =>
      data.deliveryType !== "dine_in" || Boolean(data.tableId) || Boolean(data.qrToken),
    {
      message: "Informe a mesa ou escaneie o QR",
      path: ["tableId"],
    },
  )
  .refine(
    (data) =>
      data.deliveryType === "dine_in" ||
      data.paymentMethod !== "cash" ||
      Boolean(data.changeFor),
    {
      message: "Informe o valor para troco",
      path: ["changeFor"],
    },
  );

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
