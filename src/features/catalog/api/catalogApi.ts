import { apiClient } from "@/shared/lib/api-client";
import type { PaginatedResponse } from "@/shared/types/api.types";

import type { Category, ProductDetail, ProductFilters, ProductListItem } from "../types/catalog.types";

export const catalogApi = {
  getCategories: () => apiClient.get<Category[]>("/public/catalog/categories/").then((r) => r.data),

  getProducts: (params?: ProductFilters) =>
    apiClient
      .get<PaginatedResponse<ProductListItem>>("/public/catalog/products/", { params })
      .then((r) => r.data),

  getProduct: (slug: string) =>
    apiClient.get<ProductDetail>(`/public/catalog/products/${slug}/`).then((r) => r.data),

  // produtos que podem compor este (ex: outros sabores da pizza)
  getCompositionOptions: (slug: string) =>
    apiClient
      .get<ProductListItem[]>(`/public/catalog/products/${slug}/composition/`)
      .then((r) => r.data),
};
