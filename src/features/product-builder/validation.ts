import type { Option, OptionGroup } from "@/features/catalog/types/catalog.types";

import { getVisibleGroups, isGroupVisible } from "./visibility";
import type { OptionSelectionItem, ProductBuilderState } from "./types";
import { getItemQuantity } from "./types";

export function getOptionStockLimit(option: Option): number | null {
  if (option.stock_quantity == null) return null;
  return option.stock_quantity;
}

export function isOptionSelectable(option: Option, requestedQty = 1): boolean {
  if (!option.is_available) return false;
  const stock = getOptionStockLimit(option);
  if (stock == null) return true;
  return requestedQty <= stock && stock > 0;
}

export function countGroupSelections(group: OptionGroup, selections: ProductBuilderState): number {
  const items = selections[group.id] ?? [];
  if (group.selection_mode === "quantity") {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }
  return items.length;
}

export function isGroupComplete(group: OptionGroup, count: number): boolean {
  const min = group.min_selections;
  const max = group.max_selections;

  if (count < min) return false;
  if (max > 0 && count > max) return false;
  return true;
}

export function validateGroup(group: OptionGroup, selections: ProductBuilderState): string | null {
  const count = countGroupSelections(group, selections);
  const min = group.min_selections;
  const max = group.max_selections;

  if (group.is_required && count < min) {
    return min === 1
      ? `Selecione uma opção em ${group.name}`
      : `Selecione ao menos ${min} em ${group.name}`;
  }

  if (count < min) {
    return `Seleção incompleta em ${group.name}`;
  }

  if (max > 0 && count > max) {
    return `Limite de ${max} opções em ${group.name}`;
  }

  for (const item of selections[group.id] ?? []) {
    const option = group.options.find((entry) => entry.id === item.option_id);
    if (!option) continue;
    const stock = getOptionStockLimit(option);
    if (stock != null && item.quantity > stock) {
      return `${option.name} sem estoque suficiente`;
    }
  }

  return null;
}

export function validateAllGroups(
  groups: OptionGroup[],
  selections: ProductBuilderState,
): { message: string; groupId: string } | null {
  for (const group of groups) {
    if (!isGroupVisible(group, selections) && (selections[group.id]?.length ?? 0) > 0) {
      return { message: `Seleção inválida em ${group.name}`, groupId: group.id };
    }
  }

  const visibleGroups = getVisibleGroups(groups, selections);

  for (const group of visibleGroups) {
    const error = validateGroup(group, selections);
    if (error) {
      return { message: error, groupId: group.id };
    }
  }
  return null;
}

export function flattenSelectionsForCart(
  product: { option_groups: OptionGroup[] },
  selections: ProductBuilderState,
) {
  const result: Array<{
    optionId: string;
    optionGroupId: string;
    optionGroupName: string;
    name: string;
    priceModifier: number;
    priceType: Option["price_type"];
    quantity: number;
  }> = [];

  for (const group of getVisibleGroups(product.option_groups, selections)) {
    const items = selections[group.id] ?? [];
    for (const item of items) {
      const option = group.options.find((o) => o.id === item.option_id);
      if (!option?.is_available) continue;
      result.push({
        optionId: option.id,
        optionGroupId: group.id,
        optionGroupName: group.name,
        name: option.name,
        priceModifier: option.price_modifier,
        priceType: option.price_type,
        quantity: item.quantity,
      });
    }
  }

  return result;
}

export function isAtGroupMax(group: OptionGroup, items: OptionSelectionItem[]): boolean {
  const max = group.max_selections;
  if (max === 0) return false;
  const count =
    group.selection_mode === "quantity"
      ? items.reduce((sum, item) => sum + item.quantity, 0)
      : items.length;
  return count >= max;
}

export { getItemQuantity };
