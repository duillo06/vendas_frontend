import type { Option, PricingConfig, ProductDetail } from "@/features/catalog/types/catalog.types";

import type { ProductBuilderState } from "./types";
import { getVisibleGroups } from "./visibility";

function unitModifier(basePrice: number, option: Option): number {
  if (option.price_type === "percentage") {
    return Math.round(basePrice * (option.price_modifier / 100) * 100) / 100;
  }
  return option.price_modifier;
}

function findTier(count: number, tiers: Array<{ from: number; to?: number; unit_price: number }>) {
  if (!tiers.length) return null;
  const sorted = [...tiers].sort((a, b) => a.from - b.from);
  for (const tier of sorted) {
    if (count >= tier.from && (tier.to === undefined || count <= tier.to)) {
      return tier;
    }
  }
  return sorted[sorted.length - 1] ?? null;
}

function applyGroupPricing(
  basePrice: number,
  entries: Array<{ option: Option; quantity: number }>,
  configIn?: PricingConfig,
): number {
  const config = configIn ?? { strategy: "additive" as const };
  const strategy = config.strategy;

  if (strategy === "additive" || strategy === "quantity_multiplier") {
    return entries.reduce(
      (sum, entry) => sum + unitModifier(basePrice, entry.option) * entry.quantity,
      0,
    );
  }

  if (strategy === "tiered") {
    const totalCount = entries.reduce((sum, entry) => sum + entry.quantity, 0);
    const tier = findTier(totalCount, config.tiers ?? []);
    if (!tier) return 0;
    return tier.unit_price * totalCount;
  }

  const freeUnits =
    strategy === "charge_extras_only" ? config.included_count : config.free_count;

  const units: Option[] = [];
  for (const entry of entries) {
    for (let i = 0; i < entry.quantity; i += 1) {
      units.push(entry.option);
    }
  }

  return units.reduce((sum, option, index) => {
    if (index >= freeUnits) {
      return sum + unitModifier(basePrice, option);
    }
    return sum;
  }, 0);
}

export function calculateProductPrice(product: ProductDetail, selections: ProductBuilderState): number {
  let total = product.base_price;
  const visibleGroups = getVisibleGroups(product.option_groups, selections);

  for (const group of visibleGroups) {
    const items = selections[group.id] ?? [];
    const entries = items
      .map((item) => {
        const option = group.options.find((o) => o.id === item.option_id);
        if (!option?.is_available) return null;
        return { option, quantity: item.quantity };
      })
      .filter((entry): entry is { option: Option; quantity: number } => entry !== null);

    total += applyGroupPricing(product.base_price, entries, group.pricing_config);
  }

  return Math.round(Math.max(total, 0) * 100) / 100;
}

export function calculateBuilderTotal(
  basePrice: number,
  optionGroups: ProductDetail["option_groups"],
  selections: ProductBuilderState,
): number {
  return calculateProductPrice({ base_price: basePrice, option_groups: optionGroups } as ProductDetail, selections);
}

export function formatOptionPriceModifier(option: Option, basePrice: number, quantity = 1): string {
  const value = unitModifier(basePrice, option) * quantity;
  if (value === 0) return "";
  return `+ R$ ${value.toFixed(2).replace(".", ",")}`;
}
