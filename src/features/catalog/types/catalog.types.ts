export interface Category {
  id: string;
  name: string;
  slug: string;
  emoji: string | null;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  product_count: number;
}

export interface ProductCategoryRef {
  id: string;
  name: string;
  slug: string;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  base_price: number;
  compare_price: number | null;
  image_url: string | null;
  category: ProductCategoryRef;
  is_available: boolean;
  tags: string[];
  has_options: boolean;
}

export interface ProductImage {
  id: string;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
}

export type OptionSelectionType = "single" | "multiple";
export type OptionSelectionMode = "pick" | "quantity";
export type OptionPriceType = "fixed" | "percentage";

export type OptionDisplayType =
  | "list"
  | "radio"
  | "checkbox"
  | "cards"
  | "image_cards"
  | "dropdown"
  | "stepper"
  | "icon_chips"
  | "color_swatch";

export type PricingConfig =
  | { strategy: "additive" }
  | { strategy: "charge_extras_only"; included_count: number }
  | { strategy: "first_n_free"; free_count: number }
  | { strategy: "quantity_multiplier" }
  | { strategy: "tiered"; tiers: Array<{ from: number; to?: number; unit_price: number }> };

export type OptionUiConfig = {
  hint?: string;
  success_message?: string;
  emoji?: string;
  show_when?: {
    group_id: string;
    option_ids?: string[];
  };
};

export interface Option {
  id: string;
  name: string;
  description?: string | null;
  price_modifier: number;
  price_type: OptionPriceType;
  is_available: boolean;
  image_url?: string | null;
  icon?: string | null;
  stock_quantity?: number | null;
  metadata?: { color?: string } | Record<string, unknown> | null;
}

export interface OptionGroup {
  id: string;
  name: string;
  description: string | null;
  selection_type: OptionSelectionType;
  selection_mode?: OptionSelectionMode;
  display_type?: OptionDisplayType;
  min_selections: number;
  max_selections: number;
  is_required: boolean;
  sort_order: number;
  options: Option[];
  icon?: string | null;
  image_url?: string | null;
  visibility?: "always" | "hidden" | "conditional";
  pricing_config?: PricingConfig;
  ui_config?: OptionUiConfig;
  default_option_ids?: string[];
}

export type CompositionPricingRule = "highest" | "average" | "main";

// composição: o produto é formado por outros produtos (ex: pizza meio a meio)
export interface ProductComposition {
  enabled: boolean;
  label: string;
  min_parts: number;
  max_parts: number;
  pricing_rule: CompositionPricingRule;
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  base_price: number;
  compare_price: number | null;
  is_available: boolean;
  prep_time: number | null;
  tags: string[];
  images: ProductImage[];
  option_groups: OptionGroup[];
  composition?: ProductComposition | null;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

/** @deprecated use OptionSelectionItem[] from product-builder */
export type OptionSelections = Record<string, string[]>;
