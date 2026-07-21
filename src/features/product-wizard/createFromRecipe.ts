import {
  catalogAdminApi,
  type CategoryRecipe,
} from "@/features/catalog/api/catalogAdminApi";
import {
  isCategoryPricedKind,
  isProductPricedKind,
} from "@/features/catalog/utils/conversationalOptions";

export type CreateFromRecipeInput = {
  name: string;
  description: string;
  categoryId: string;
  basePrice: number;
  optionPrices: { option_id: string; price: number }[];
  optionExclusions: string[];
  images: { file: File }[];
};

/** produto mágico: herda a receita no backend; aqui só preços Tipo 1 + overrides */
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
  /** preço efetivo no form (editável se Tipo 1 ou personalizado) */
  price: number;
  /** preço padrão da categoria (Tipo 2) */
  category_price: number;
  /** true = grava no produto; false = herda da categoria */
  customized: boolean;
  included: boolean;
};

export function recipeToPriceRows(recipe: CategoryRecipe): RecipePriceRow[] {
  const categoryPrices = new Map(
    (recipe.option_prices ?? []).map((p) => [p.option_id, Number(p.price)]),
  );
  const rows: RecipePriceRow[] = [];
  for (const lib of recipe.libraries) {
    for (const opt of lib.options ?? []) {
      const categoryPrice = categoryPrices.get(opt.id) ?? 0;
      const productOwned = isProductPricedKind(lib.kind);
      rows.push({
        option_id: opt.id,
        name: opt.name,
        kind: lib.kind,
        group_name: lib.option_group_name ?? lib.kind,
        price: productOwned ? 0 : categoryPrice,
        category_price: categoryPrice,
        customized: productOwned,
        included: true,
      });
    }
  }
  return rows;
}

/** só manda pro produto o que é Tipo 1 ou override explícito */
export function productOptionPricesFromRows(rows: RecipePriceRow[]) {
  return rows
    .filter((r) => r.included && (isProductPricedKind(r.kind) || r.customized))
    .map((r) => ({ option_id: r.option_id, price: r.price }));
}

export function formatInheritedHint(row: RecipePriceRow) {
  if (isProductPricedKind(row.kind)) return null;
  if (!isCategoryPricedKind(row.kind)) return null;
  return row.category_price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
