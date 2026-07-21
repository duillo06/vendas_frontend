export const catalogAdminKeys = {
  all: ["catalog-admin"] as const,
  products: () => [...catalogAdminKeys.all, "products"] as const,
  product: (id: string) => [...catalogAdminKeys.products(), id] as const,
  categories: () => [...catalogAdminKeys.all, "categories"] as const,
  categoryRecipe: (id: string) => [...catalogAdminKeys.categories(), id, "recipe"] as const,
  optionGroups: () => [...catalogAdminKeys.all, "option-groups"] as const,
};
