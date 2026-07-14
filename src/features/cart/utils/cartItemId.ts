/** chave única do item — inclui quantity por opção e as partes da composição */
export function buildCartItemId(
  productId: string,
  options: Array<{ optionId: string; quantity?: number }>,
  components?: Array<{ productId: string }>,
): string {
  const signature = [...options]
    .map((opt) => `${opt.optionId}:${opt.quantity ?? 1}`)
    .sort()
    .join(",");
  const parts = [...(components ?? [])]
    .map((c) => c.productId)
    .sort()
    .join(",");
  return `${productId}::${signature}::${parts}`;
}
