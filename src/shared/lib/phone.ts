/** máscara BR de celular: (11) 98765-4321 */

export function phoneDigits(value: string): string {
  return (value || "").replace(/\D/g, "").slice(0, 11);
}

export function formatPhoneMask(value: string): string {
  const digits = phoneDigits(value);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** DDD + 9 + 8 dígitos (celular) */
export function isBrazilianMobile(value: string): boolean {
  const digits = phoneDigits(value);
  return digits.length === 11 && digits[2] === "9";
}

export const MOBILE_PHONE_MESSAGE = "Informe um celular válido com DDD";
