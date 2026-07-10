import type { OptionGroup } from "@/features/catalog/types/catalog.types";

import type { GroupGuidance, ProductBuilderState } from "./types";
import { countGroupSelections } from "./validation";

export function getGroupGuidance(group: OptionGroup, selections: ProductBuilderState): GroupGuidance | null {
  const count = countGroupSelections(group, selections);
  const { min_selections: min, max_selections: max, is_required: required, selection_type: type } = group;
  const prefix = group.icon ? `${group.icon} ` : "";
  const customHint = group.ui_config?.hint;

  if (required && count < min) {
    const remaining = min - count;
    return {
      tone: "warm",
      message:
        remaining === 1
          ? `${prefix}Falta escolher 1 em ${group.name}`
          : `${prefix}Faltam ${remaining} em ${group.name}`,
    };
  }

  if (type === "multiple" && max > 1) {
    if (count === 0 && !required) {
      return {
        tone: "neutral",
        message: customHint ?? `${prefix}Escolha até ${max}`,
      };
    }

    if (count > 0 && count < max) {
      return {
        tone: "warm",
        message: `${prefix}Escolha mais ${max - count} (até ${max})`,
      };
    }

    if (max > 0 && count >= max) {
      return {
        tone: "success",
        message: group.ui_config?.success_message ?? "Limite atingido ✔",
      };
    }
  }

  if (type === "multiple" && max === 0 && count === 0 && customHint) {
    return { tone: "neutral", message: customHint };
  }

  if (required && count >= min) {
    return {
      tone: "success",
      message: group.ui_config?.success_message ?? "Excelente escolha ✔",
    };
  }

  if (group.description && count === 0) {
    return {
      tone: "neutral",
      message: group.description,
    };
  }

  return null;
}
