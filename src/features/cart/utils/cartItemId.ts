/** chave única do item — inclui quantity por opção */
export function buildCartItemId(
  productId: string,
  options: Array<{ optionId: string; quantity?: number }>,
): string {
  const signature = [...options]
    .map((opt) => `${opt.optionId}:${opt.quantity ?? 1}`)
    .sort()
    .join(",");
  return `${productId}::${signature}`;
}
