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
}

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
  images: ProductImageAdmin[];
}

export interface OptionAdmin {
  id: string;
  name: string;
  price_modifier: number;
  is_active: boolean;
  is_available: boolean;
  sort_order: number;
}

export interface OptionGroupAdmin {
  id: string;
  name: string;
  description: string | null;
  selection_type: string;
  min_selections: number;
  max_selections: number;
  is_required: boolean;
  is_active: boolean;
  sort_order: number;
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

  listOptionGroups: () =>
    apiClient.get<OptionGroupAdmin[]>("/admin/option-groups/").then((response) => response.data),

  createOptionGroup: (data: Record<string, unknown>) =>
    apiClient.post<OptionGroupAdmin>("/admin/option-groups/", data).then((response) => response.data),

  updateOptionGroup: (id: string, data: Record<string, unknown>) =>
    apiClient
      .patch<OptionGroupAdmin>(`/admin/option-groups/${id}/`, data)
      .then((response) => response.data),

  deleteOptionGroup: (id: string) => apiClient.delete(`/admin/option-groups/${id}/`),

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
