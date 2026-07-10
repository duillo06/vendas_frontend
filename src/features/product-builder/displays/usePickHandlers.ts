import type { OptionGroup } from "@/features/catalog/types/catalog.types";

import type { OptionSelectionItem } from "../types";
import { getOptionStockLimit, isAtGroupMax } from "../validation";

export function usePickHandlers(
  group: OptionGroup,
  items: OptionSelectionItem[],
  onChange: (items: OptionSelectionItem[]) => void,
) {
  const atMax = isAtGroupMax(group, items);

  const isSelected = (optionId: string) => items.some((item) => item.option_id === optionId);

  const getStockCap = (optionId: string) => {
    const option = group.options.find((entry) => entry.id === optionId);
    return option ? getOptionStockLimit(option) : null;
  };

  const toggleSingle = (optionId: string) => {
    const stock = getStockCap(optionId);
    if (stock != null && stock < 1) return;
    onChange([{ option_id: optionId, quantity: 1 }]);
  };

  const toggleMultiple = (optionId: string) => {
    if (isSelected(optionId)) {
      onChange(items.filter((item) => item.option_id !== optionId));
      return;
    }
    const stock = getStockCap(optionId);
    if (stock != null && stock < 1) return;
    if (atMax) return;
    onChange([...items, { option_id: optionId, quantity: 1 }]);
  };

  const setQuantity = (optionId: string, quantity: number) => {
    if (quantity <= 0) {
      onChange(items.filter((item) => item.option_id !== optionId));
      return;
    }

    const stock = getStockCap(optionId);
    if (stock != null) {
      quantity = Math.min(quantity, stock);
    }

    const others = items.filter((item) => item.option_id !== optionId);
    const otherTotal = others.reduce((sum, item) => sum + item.quantity, 0);
    const max = group.max_selections;

    if (max > 0 && otherTotal + quantity > max) {
      quantity = Math.max(0, max - otherTotal);
    }

    if (quantity <= 0) {
      onChange(others);
      return;
    }

    onChange([...others, { option_id: optionId, quantity }]);
  };

  return { toggleSingle, toggleMultiple, setQuantity, isSelected, atMax };
}
