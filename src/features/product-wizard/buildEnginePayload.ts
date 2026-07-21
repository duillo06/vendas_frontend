import {
  catalogAdminApi,
  type OptionGroupAdmin,
} from "@/features/catalog/api/catalogAdminApi";
import {
  kindIdFromGroupName,
  saveCanonicalFromDraft,
  buildOptionPricesFromDraft,
} from "@/features/catalog/utils/canonicalLibrary";
import {
  draftFromKind,
  kindById,
  type CustomizationDraft,
} from "@/features/catalog/utils/conversationalOptions";
import { createId } from "@/shared/lib/utils";
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

/**
 * Cria o produto reaproveitando a biblioteca da empresa.
 * Identidade na base; preços em option_prices do produto.
 */
export async function createProductFromWizard(input: BuildProductInput) {
  const library = await catalogAdminApi.listOptionGroups();
  const linkedIds: string[] = [];
  const optionPrices: { option_id: string; price: number }[] = [];
  let workingLibrary = library;

  for (const group of input.groups) {
    const options = (input.optionsByGroup[group.key] ?? []).filter((o) => o.name.trim());
    if (options.length === 0) continue;

    const kindId = kindIdFromGroupName(group.name);
    const kind = kindId ? kindById(kindId) : null;

    const draft: CustomizationDraft = kind
      ? {
          ...draftFromKind(kind),
          choices: options.map((o) => ({
            key: o.key || createId(),
            name: o.name.trim(),
            price: o.price,
          })),
        }
      : {
          name: group.name,
          description: group.fields.description || "",
          selection_type: group.fields.selection_type === "multiple" ? "multiple" : "single",
          is_required: group.fields.is_required,
          min_selections: group.fields.min_selections,
          max_selections: group.fields.max_selections,
          choices: options.map((o) => ({
            key: o.key || createId(),
            name: o.name.trim(),
            price: o.price,
          })),
        };

    const { group: saved } = await saveCanonicalFromDraft(draft, workingLibrary);
    if (!linkedIds.includes(saved.id)) linkedIds.push(saved.id);
    optionPrices.push(...buildOptionPricesFromDraft(saved, draft.choices));

    // atualiza cache local pra próximo grupo no mesmo save
    workingLibrary = upsertLocal(workingLibrary, saved);
  }

  const product = await catalogAdminApi.createProduct({
    name: input.name.trim(),
    description: input.description.trim(),
    base_price: input.basePrice,
    category_id: input.categoryId,
    is_active: true,
    is_available: true,
    product_option_groups: linkedIds.map((id, i) => ({
      option_group_id: id,
      sort_order: i,
    })),
    ...(optionPrices.length ? { option_prices: optionPrices } : {}),
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

function upsertLocal(list: OptionGroupAdmin[], group: OptionGroupAdmin): OptionGroupAdmin[] {
  const without = list.filter((g) => g.id !== group.id);
  return [...without, group];
}
