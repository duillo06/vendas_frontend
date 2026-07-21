import {
  catalogAdminApi,
  type CategoryRecipe,
} from "@/features/catalog/api/catalogAdminApi";

export type CreateFromRecipeInput = {
  name: string;
  description: string;
  categoryId: string;
  basePrice: number;
  optionPrices: { option_id: string; price: number }[];
  optionExclusions: string[];
  images: { file: File }[];
};

/** produto mágico: herda a receita no backend; aqui só preços e exclusões */
export async function createProductFromRecipe(input: CreateFromRecipeInput) {
  const product = await catalogAdminApi.createProduct({
    name: input.name.trim(),
    description: input.description.trim(),
    base_price: input.basePrice,
    category_id: input.categoryId,
    is_active: true,
    is_available: true,
    from_recipe: true,
    ...(input.optionPrices.length ? { option_prices: input.optionPrices } : {}),
    ...(input.optionExclusions.length
      ? { option_exclusions: input.optionExclusions }
      : {}),
  });

  for (const [i, image] of input.images.entries()) {
    await catalogAdminApi.uploadProductImage(product.id, image.file, { isPrimary: i === 0 });
  }

  return product;
}

export type RecipePriceRow = {
  option_id: string;
  name: string;
  kind: string;
  group_name: string;
  price: number;
  included: boolean;
};

export function recipeToPriceRows(recipe: CategoryRecipe): RecipePriceRow[] {
  const rows: RecipePriceRow[] = [];
  for (const lib of recipe.libraries) {
    for (const opt of lib.options ?? []) {
      rows.push({
        option_id: opt.id,
        name: opt.name,
        kind: lib.kind,
        group_name: lib.option_group_name ?? lib.kind,
        price: 0,
        included: true,
      });
    }
  }
  return rows;
}
