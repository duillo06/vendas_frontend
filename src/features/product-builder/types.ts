import type { Option, OptionGroup, ProductDetail } from "@/features/catalog/types/catalog.types";

export type OptionSelectionItem = {
  option_id: string;
  quantity: number;
};

export type ProductBuilderState = Record<string, OptionSelectionItem[]>;

export type GuidanceTone = "neutral" | "warm" | "success" | "error";

export type GroupGuidance = {
  message: string;
  tone: GuidanceTone;
};

export type BuilderProgress = {
  completed: number;
  total: number;
  show: boolean;
};

export type DisplayProps = {
  group: OptionGroup;
  items: OptionSelectionItem[];
  basePrice: number;
  onChange: (items: OptionSelectionItem[]) => void;
  disabled?: boolean;
};

export type GroupSectionProps = DisplayProps & {
  invalid?: boolean;
  allSelections: ProductBuilderState;
};

export function getItemQuantity(items: OptionSelectionItem[], optionId: string): number {
  return items.find((item) => item.option_id === optionId)?.quantity ?? 0;
}

export function isOptionSelected(items: OptionSelectionItem[], optionId: string): boolean {
  return getItemQuantity(items, optionId) > 0;
}

export type { Option, OptionGroup, ProductDetail };
