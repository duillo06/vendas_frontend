import type {
  OptionGroup,
  ProductComposition,
  ProductDetail,
} from "@/features/catalog/types/catalog.types";

import type { ProductBuilderState } from "./types";

export function isSizeLikeGroup(group: OptionGroup): boolean {
  const kind = group.kind ?? "";
  return kind === "size" || kind === "volume";
}

export function findSizeGroup(groups: OptionGroup[]): OptionGroup | undefined {
  return groups.find((group) => isSizeLikeGroup(group) && group.options.some((o) => o.is_available));
}

/** prefere Grande; senão o último disponível (costuma ser o maior) */
export function preferredSizeOptionId(group: OptionGroup): string | null {
  const available = group.options.filter((option) => option.is_available);
  if (!available.length) return null;

  const defaults = (group.default_option_ids ?? []).filter((id) =>
    available.some((option) => option.id === id),
  );
  if (defaults.length) return defaults[0] ?? null;

  const grande = available.find((option) => /grande|fam[ií]lia|gigante|\bg\b/i.test(option.name));
  if (grande) return grande.id;

  return available[available.length - 1]?.id ?? null;
}

export function selectedSizeOptionId(
  groups: OptionGroup[],
  selections: ProductBuilderState,
): string | null {
  const sizeGroup = findSizeGroup(groups);
  if (!sizeGroup) return null;
  return selections[sizeGroup.id]?.[0]?.option_id ?? null;
}

export function effectiveCompositionMaxParts(
  composition: ProductComposition | null | undefined,
  sizeOptionId: string | null,
): number {
  if (!composition?.enabled) return 1;
  if (sizeOptionId && composition.max_parts_by_size?.[sizeOptionId]) {
    return composition.max_parts_by_size[sizeOptionId];
  }
  return composition.max_parts;
}

export function orderGroupsForFocus(groups: OptionGroup[]): OptionGroup[] {
  const sizes = groups.filter(isSizeLikeGroup);
  const rest = groups.filter((group) => !isSizeLikeGroup(group));
  return [...sizes, ...rest];
}

export function hasSizeSelection(product: ProductDetail, selections: ProductBuilderState): boolean {
  const sizeGroup = findSizeGroup(product.option_groups);
  if (!sizeGroup) return true;
  return Boolean(selections[sizeGroup.id]?.length);
}
