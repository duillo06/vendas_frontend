import type { OptionGroup } from "@/features/catalog/types/catalog.types";

import { isSizeLikeGroup, preferredSizeOptionId } from "./sizeFocus";
import type { ProductBuilderState } from "./types";

export function buildInitialSelections(groups: OptionGroup[]): ProductBuilderState {
  const selections: ProductBuilderState = {};

  for (const group of groups) {
    if (isSizeLikeGroup(group)) {
      const preferred = preferredSizeOptionId(group);
      if (preferred) {
        selections[group.id] = [{ option_id: preferred, quantity: 1 }];
      }
      continue;
    }

    const defaults = group.default_option_ids ?? [];
    if (!defaults.length) continue;

    const available = new Set(
      group.options.filter((option) => option.is_available).map((option) => option.id),
    );
    const items = defaults
      .filter((optionId) => available.has(optionId))
      .map((optionId) => ({ option_id: optionId, quantity: 1 }));

    if (items.length) {
      selections[group.id] = items;
    }
  }

  return selections;
}
