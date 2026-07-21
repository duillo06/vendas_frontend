import type {
  OptionDisplayType,
  OptionSelectionMode,
  OptionSelectionType,
  PricingConfig,
} from "@/features/catalog/types/catalog.types";
import { apiClient } from "@/shared/lib/api-client";
import type { PaginatedResponse } from "@/shared/types/api.types";

export interface CategoryAdmin {
  id: string;
  name: string;
  slug: string;
  emoji: string | null;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  product_count: number;
  has_recipe?: boolean;
}

export type CategoryRecipeCapability = {
  kind: string;
  enabled: boolean;
  is_required: boolean;
  sort_order: number;
  settings: Record<string, unknown>;
};

export type CategoryRecipeLibrary = {
  kind: string;
  option_group_id: string;
  option_group_name?: string;
  sort_order: number;
  option_ids: string[];
  options?: { id: string; name: string }[];
};

export type CategoryRecipe = {
  category_id: string;
  category_name: string;
  template_key: string;
  capabilities: CategoryRecipeCapability[];
  libraries: CategoryRecipeLibrary[];
};

export type CategoryRecipeWrite = {
  capabilities: CategoryRecipeCapability[];
  libraries: {
    kind: string;
    option_group_id: string;
    sort_order?: number;
    option_ids: string[];
  }[];
  template_key?: string;
  apply_mode?: "new_only" | "all" | "later";
};

export interface ProductAdminListItem {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  category: { id: string; name: string; slug: string };
  is_active: boolean;
  is_available: boolean;
  sort_order: number;
  image_url: string | null;
  created_at: string;
}

export interface ProductImageAdmin {
  id: string;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductOptionGroupLink {
  id?: string;
  option_group_id: string;
  sort_order: number;
  override_min?: number | null;
  override_max?: number | null;
  override_required?: boolean | null;
  override_display_type?: OptionDisplayType | null;
  override_pricing_config?: PricingConfig | null;
  override_ui_config?: Record<string, string> | null;
  group?: OptionGroupAdmin;
}

export interface ProductCompositionAdmin {
  enabled: boolean;
  source_type: "category" | "tag" | "custom";
  source_category_id: string | null;
  source_tag: string;
  custom_product_ids: string[];
  label: string;
  min_parts: number;
  max_parts: number;
  pricing_rule: "highest" | "average" | "sum" | "main";
}

export interface ProductAdminDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  base_price: number;
  compare_price: number | null;
  category_id: string;
  category: { id: string; name: string; slug: string };
  sku: string | null;
  is_active: boolean;
  is_available: boolean;
  sort_order: number;
  prep_time: number | null;
  option_group_ids: string[];
  product_option_groups: ProductOptionGroupLink[];
  composition?: ProductCompositionAdmin | null;
  option_prices?: { option_id: string; price: number }[];
  option_exclusions?: string[];
  images: ProductImageAdmin[];
  created_at?: string;
  updated_at?: string;
}

export interface OptionAdmin {
  id: string;
  name: string;
  description?: string | null;
  price_modifier: number;
  price_type?: "fixed" | "percentage";
  is_active: boolean;
  is_available: boolean;
  sort_order: number;
  image_url?: string | null;
  icon?: string | null;
    stock_quantity?: number | null;
  metadata?: { color?: string } | Record<string, unknown> | null;
}

export interface OptionGroupAdmin {
  id: string;
  name: string;
  description: string | null;
  selection_type: OptionSelectionType | string;
  selection_mode?: OptionSelectionMode | string;
  display_type?: OptionDisplayType | string;
  min_selections: number;
  max_selections: number;
  is_required: boolean;
  is_active: boolean;
  sort_order: number;
  icon?: string | null;
  image_url?: string | null;
  visibility?: "always" | "hidden";
  pricing_config?: PricingConfig | null;
  ui_config?: Record<string, string> | null;
  default_option_ids?: string[];
  kind?: string | null;
  options: OptionAdmin[];
  options_count: number;
}

export const catalogAdminApi = {
  listProducts: (params?: Record<string, string | boolean>) =>
    apiClient
      .get<PaginatedResponse<ProductAdminListItem>>("/admin/products/", { params })
      .then((response) => response.data),

  getProduct: (id: string) =>
    apiClient.get<ProductAdminDetail>(`/admin/products/${id}/`).then((response) => response.data),

  createProduct: (data: Record<string, unknown>) =>
    apiClient.post<ProductAdminDetail>("/admin/products/", data).then((response) => response.data),

  updateProduct: (id: string, data: Record<string, unknown>) =>
    apiClient.patch<ProductAdminDetail>(`/admin/products/${id}/`, data).then((response) => response.data),

  deleteProduct: (id: string) => apiClient.delete(`/admin/products/${id}/`),

  reorderProductOptionGroups: (productId: string, ids: string[]) =>
    apiClient.patch(`/admin/products/${productId}/option-groups/reorder/`, { ids }),

  uploadProductImage: (id: string, file: File, options?: { isPrimary?: boolean }) => {
    const formData = new FormData();
    formData.append("image", file);
    if (options?.isPrimary) {
      formData.append("is_primary", "true");
    }
    return apiClient
      .post<ProductImageAdmin>(`/admin/products/${id}/images/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => response.data);
  },

  deleteProductImage: (productId: string, imageId: string) =>
    apiClient.delete(`/admin/products/${productId}/images/${imageId}/`),

  setPrimaryProductImage: (productId: string, imageId: string) =>
    apiClient
      .patch<ProductImageAdmin>(`/admin/products/${productId}/images/${imageId}/`, {
        is_primary: true,
      })
      .then((response) => response.data),

  listCategories: () =>
    apiClient.get<CategoryAdmin[]>("/admin/categories/").then((response) => response.data),

  createCategory: (data: Record<string, unknown>) =>
    apiClient.post<CategoryAdmin>("/admin/categories/", data).then((response) => response.data),

  updateCategory: (id: string, data: Record<string, unknown>) =>
    apiClient.patch<CategoryAdmin>(`/admin/categories/${id}/`, data).then((response) => response.data),

  deleteCategory: (id: string) => apiClient.delete(`/admin/categories/${id}/`),

  getCategoryRecipe: (id: string) =>
    apiClient
      .get<CategoryRecipe>(`/admin/categories/${id}/recipe/`)
      .then((response) => response.data),

  putCategoryRecipe: (id: string, data: CategoryRecipeWrite) =>
    apiClient
      .put<CategoryRecipe>(`/admin/categories/${id}/recipe/`, data)
      .then((response) => response.data),

  copyProductPrices: (
    productId: string,
    data: {
      source_product_id: string;
      mode?: "same" | "percent" | "fixed";
      percent?: number;
      fixed?: number;
    },
  ) =>
    apiClient
      .post<ProductAdminDetail>(`/admin/products/${productId}/copy-prices/`, data)
      .then((response) => response.data),

  listOptionGroups: () =>
    apiClient.get<OptionGroupAdmin[]>("/admin/option-groups/").then((response) => response.data),

  createOptionGroup: (data: Record<string, unknown>) =>
    apiClient.post<OptionGroupAdmin>("/admin/option-groups/", data).then((response) => response.data),

  updateOptionGroup: (id: string, data: Record<string, unknown>) =>
    apiClient
      .patch<OptionGroupAdmin>(`/admin/option-groups/${id}/`, data)
      .then((response) => response.data),

  deleteOptionGroup: (id: string) => apiClient.delete(`/admin/option-groups/${id}/`),

  reorderOptionGroups: (ids: string[]) =>
    apiClient.patch("/admin/option-groups/reorder/", { ids }),

  duplicateOptionGroup: (id: string) =>
    apiClient.post<OptionGroupAdmin>(`/admin/option-groups/${id}/duplicate/`).then((r) => r.data),

  reorderOptions: (groupId: string, ids: string[]) =>
    apiClient.patch(`/admin/option-groups/${groupId}/options/reorder/`, { ids }),

  duplicateOption: (groupId: string, optionId: string) =>
    apiClient
      .post<OptionAdmin>(`/admin/option-groups/${groupId}/options/${optionId}/duplicate/`)
      .then((response) => response.data),

  createOption: (groupId: string, data: Record<string, unknown>) =>
    apiClient
      .post(`/admin/option-groups/${groupId}/options/`, data)
      .then((response) => response.data),

  updateOption: (groupId: string, optionId: string, data: Record<string, unknown>) =>
    apiClient
      .patch(`/admin/option-groups/${groupId}/options/${optionId}/`, data)
      .then((response) => response.data),

  deleteOption: (groupId: string, optionId: string) =>
    apiClient.delete(`/admin/option-groups/${groupId}/options/${optionId}/`),
};
