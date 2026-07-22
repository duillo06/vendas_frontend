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
    zipCode: z.string(),
    reference: z.string().optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    fromGeo: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.fromGeo) return;
    if (!data.zipCode || !/^\d{5}-?\d{3}$/.test(data.zipCode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CEP inválido",
        path: ["zipCode"],
      });
    }
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
    customerName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    customerPhone: customerPhoneSchema,
    customerEmail: z.string().email("E-mail inválido").optional().or(z.literal("")),
    deliveryType: z.enum(["delivery", "pickup"]),
    paymentMethod: z.enum(["cash", "pix", "card_on_delivery"]),
    notes: z.string().max(500).optional(),
    changeFor: z.number().positive("Informe um valor válido").optional(),
    address: addressSchema.optional(),
  })
  .refine((data) => data.deliveryType !== "delivery" || Boolean(data.address), {
    message: "Endereço é obrigatório para entrega",
    path: ["address"],
  })
  .refine((data) => data.paymentMethod !== "cash" || Boolean(data.changeFor), {
    message: "Informe o valor para troco",
    path: ["changeFor"],
  });

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
