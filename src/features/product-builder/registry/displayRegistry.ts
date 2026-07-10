import type { ComponentType } from "react";

import type { OptionDisplayType } from "@/features/catalog/types/catalog.types";

import {
  CardGridDisplay,
  CheckboxDisplay,
  DropdownDisplay,
  IconChipDisplay,
  ImageCardDisplay,
  ListDisplay,
  RadioDisplay,
  StepperDisplay,
} from "../displays";
import { ColorSwatchDisplay } from "../displays/ColorSwatchDisplay";
import type { DisplayProps } from "../types";

const displayRegistry: Partial<Record<OptionDisplayType, ComponentType<DisplayProps>>> = {
  list: ListDisplay,
  radio: RadioDisplay,
  checkbox: CheckboxDisplay,
  cards: CardGridDisplay,
  image_cards: ImageCardDisplay,
  dropdown: DropdownDisplay,
  stepper: StepperDisplay,
  icon_chips: IconChipDisplay,
  color_swatch: ColorSwatchDisplay,
};

export function resolveDisplayComponent(type: OptionDisplayType): ComponentType<DisplayProps> {
  return displayRegistry[type] ?? ListDisplay;
}
