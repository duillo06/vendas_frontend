export function formatCurrency(value: number | string): string {
  const amount = typeof value === "string" ? Number.parseFloat(value) : value;
  if (Number.isNaN(amount)) return "R$ 0,00";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

/** Converte dígitos digitados em centavos → reais (ex: "1250" → 12.5). */
export function parseCurrencyInput(value: string): number {
  const digits = value.replace(/\D/g, "");
  if (!digits) return 0;
  return Number(digits) / 100;
}

/** Máscara BRL enquanto o usuário digita. */
export function maskCurrencyInput(value: string): string {
  return formatCurrency(parseCurrencyInput(value));
}
