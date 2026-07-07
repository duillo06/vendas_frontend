/** K-04: id único por produto + opções */
export function buildCartItemId(productId: string, optionIds: string[]): string {
  const sorted = [...optionIds].sort().join(",");
  return `${productId}:${sorted}`;
}
