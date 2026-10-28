import type { OptionDisplayType, OptionGroup } from "@/features/catalog/types/catalog.types";

const IMPLEMENTED: OptionDisplayType[] = [
  "list",
  "radio",
  "checkbox",
  "cards",
  "image_cards",
  "dropdown",
  "stepper",
  "icon_chips",
  "size_segments",
];

export function resolveDisplayType(group: OptionGroup): OptionDisplayType {
  // tamanho/volume: faixa compacta, independente do display_type antigo
  if (group.kind === "size" || group.kind === "volume") {
    return "size_segments";
  }

  if (group.display_type && IMPLEMENTED.includes(group.display_type)) {
    return group.display_type;
  }

  if (group.selection_mode === "quantity") {
    return "stepper";
  }

  if (group.selection_type === "single") {
    return "cards";
  }

  return "checkbox";
}
