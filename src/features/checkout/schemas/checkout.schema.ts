import { z } from "zod";

const addressSchema = z.object({
  street: z.string().min(1, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().length(2, "UF com 2 letras"),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
  reference: z.string().optional(),
});

export const checkoutStep1Schema = z.object({
  customerName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  customerPhone: z
    .string()
    .min(10, "Telefone inválido")
    .regex(/^[\d\s()-]+$/, "Telefone inválido"),
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
    customerPhone: z
      .string()
      .min(10, "Telefone inválido")
      .regex(/^[\d\s()-]+$/, "Telefone inválido"),
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
