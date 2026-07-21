import type { Option, OptionGroup, ProductDetail } from "../types/catalog.types";

type PriceOption = Pick<Option, "price_modifier" | "price_type">;

export function calculateItemPrice(basePrice: number, options: PriceOption[]): number {
  let total = basePrice;

  for (const option of options) {
    if (option.price_type === "percentage") {
      total += basePrice * (option.price_modifier / 100);
    } else {
      total += option.price_modifier;
    }
  }

  return Math.round(total * 100) / 100;
}

export function getSelectedOptions(
  product: ProductDetail,
  selections: Record<string, string[]>,
): Option[] {
  const selected: Option[] = [];

  for (const group of product.option_groups) {
    const chosenIds = selections[group.id] ?? [];
    for (const optionId of chosenIds) {
      const option = group.options.find((o) => o.id === optionId);
      if (option?.is_available) {
        selected.push(option);
      }
    }
  }

  return selected;
}

export function validateOptionSelections(
  groups: OptionGroup[],
  selections: Record<string, string[]>,
): string | null {
  for (const group of groups) {
    const chosen = selections[group.id] ?? [];
    const min = group.min_selections;
    const max = group.max_selections;

    if (group.is_required && chosen.length < min) {
      return `Selecione ao menos ${min} opção em ${group.name}`;
    }

    if (chosen.length < min || chosen.length > max) {
      return `Seleção inválida em ${group.name}`;
    }
  }

  return null;
}

export function formatOptionPriceModifier(option: Option, basePrice: number): string {
  if (option.price_modifier === 0) return "";

  if (option.price_type === "percentage") {
    const value = basePrice * (option.price_modifier / 100);
    return `+ ${value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;
  }

  return `+ ${option.price_modifier.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;
}
