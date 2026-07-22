import { z } from "zod";

import { isBrazilianMobile, MOBILE_PHONE_MESSAGE } from "@/shared/lib/phone";

export const mobilePhoneSchema = z
  .string()
  .min(1, "Celular é obrigatório")
  .refine(isBrazilianMobile, MOBILE_PHONE_MESSAGE);

/** campo opcional — vazio ok; se preenchido, precisa ser celular */
export const optionalMobilePhoneSchema = z
  .string()
  .optional()
  .nullable()
  .transform((value) => value ?? "")
  .refine((value) => !value.trim() || isBrazilianMobile(value), MOBILE_PHONE_MESSAGE);
