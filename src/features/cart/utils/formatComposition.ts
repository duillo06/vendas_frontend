/** rótulo meio a meio — "50% Mussarela · 50% Calabresa" */
export function formatCompositionLabel(
  mainName: string,
  extraFlavorNames: string[],
): string | null {
  if (!extraFlavorNames.length) return null;
  const totalParts = extraFlavorNames.length + 1;
  const pct = Math.round(100 / totalParts);
  return [mainName, ...extraFlavorNames]
    .map((name) => `${pct}% ${name}`)
    .join(" · ");
}
