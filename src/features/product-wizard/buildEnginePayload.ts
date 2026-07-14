import { catalogAdminApi } from "@/features/catalog/api/catalogAdminApi";
import { builderFieldsToPayload } from "@/features/catalog/components/OptionGroupBuilderFields";
import type { WizardComposition, WizardGroup, WizardImage, WizardOptionInput } from "./types";

export type BuildProductInput = {
  name: string;
  description: string;
  categoryId: string;
  basePrice: number;
  groups: WizardGroup[];
  optionsByGroup: Record<string, WizardOptionInput[]>;
  images: WizardImage[];
  composition?: WizardComposition | null;
};

// Traduz as respostas do assistente pras chamadas reais do Product Engine.
// Cria os grupos + opções, depois o produto vinculado, e sobe as imagens.
export async function createProductFromWizard(input: BuildProductInput) {
  const createdGroupIds: string[] = [];

  for (const [index, group] of input.groups.entries()) {
    const options = (input.optionsByGroup[group.key] ?? []).filter((o) => o.name.trim());
    // grupo sem nenhuma opção não vai pro engine (evita grupo vazio no cardápio)
    if (options.length === 0) continue;

    const created = await catalogAdminApi.createOptionGroup({
      name: group.name,
      ...builderFieldsToPayload(group.fields),
      is_active: true,
      sort_order: index,
    });

    for (const [optIndex, option] of options.entries()) {
      await catalogAdminApi.createOption(created.id, {
        name: option.name.trim(),
        price_modifier: option.price,
        is_active: true,
        is_available: true,
        sort_order: optIndex,
      });
    }

    createdGroupIds.push(created.id);
  }

  const product = await catalogAdminApi.createProduct({
    name: input.name.trim(),
    description: input.description.trim(),
    base_price: input.basePrice,
    category_id: input.categoryId,
    is_active: true,
    is_available: true,
    product_option_groups: createdGroupIds.map((id, i) => ({
      option_group_id: id,
      sort_order: i,
    })),
    // composição: produto formado por outros da mesma categoria (ex: meio a meio)
    ...(input.composition
      ? {
          composition: {
            enabled: true,
            source_type: "category",
            source_category_id: null,
            source_tag: "",
            custom_product_ids: [],
            label: input.composition.label,
            min_parts: input.composition.min_parts,
            max_parts: input.composition.max_parts,
            pricing_rule: input.composition.pricing_rule,
          },
        }
      : {}),
  });

  for (const [i, image] of input.images.entries()) {
    await catalogAdminApi.uploadProductImage(product.id, image.file, { isPrimary: i === 0 });
  }

  return product;
}
