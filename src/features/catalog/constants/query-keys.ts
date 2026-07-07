import type { ProductFilters } from "../types/catalog.types";

export const catalogKeys = {
  all: ["catalog"] as const,
  categories: () => [...catalogKeys.all, "categories"] as const,
  products: (filters?: ProductFilters) =>
    [...catalogKeys.all, "products", filters ?? {}] as const,
  product: (slug: string) => [...catalogKeys.all, "product", slug] as const,
};
