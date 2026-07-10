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
export type OptionPriceType = "fixed" | "percentage";

export interface Option {
  id: string;
  name: string;
  price_modifier: number;
  price_type: OptionPriceType;
  is_available: boolean;
}

export interface OptionGroup {
  id: string;
  name: string;
  description: string | null;
  selection_type: OptionSelectionType;
  min_selections: number;
  max_selections: number;
  is_required: boolean;
  sort_order: number;
  options: Option[];
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
}

export interface ProductFilters {
  category?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export type OptionSelections = Record<string, string[]>;
