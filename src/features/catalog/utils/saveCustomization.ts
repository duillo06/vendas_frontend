import {
  catalogAdminApi,
  type OptionGroupAdmin,
} from "@/features/catalog/api/catalogAdminApi";
import {
  createDefaultsPayload,
  mergeEssentialIntoGroup,
  type ChoiceDraft,
  type CustomizationDraft,
  validateDraft,
} from "@/features/catalog/utils/conversationalOptions";

export type SaveCustomizationResult = {
  group: OptionGroupAdmin;
};

/** cria grupo + escolhas com padrões seguros */
export async function createCustomizationFromDraft(
  draft: CustomizationDraft,
  sortOrder = 0,
): Promise<SaveCustomizationResult> {
  const check = validateDraft(draft);
  if (!check.ok) throw new Error(check.message);

  const created = await catalogAdminApi.createOptionGroup({
    ...createDefaultsPayload(draft),
    sort_order: sortOrder,
  });

  const named = draft.choices.filter((c) => c.name.trim());
  for (const [index, choice] of named.entries()) {
    await catalogAdminApi.createOption(created.id, {
      name: choice.name.trim(),
      price_modifier: choice.price,
      description: choice.description?.trim() || null,
      is_active: true,
      is_available: true,
      sort_order: index,
    });
  }

  const fresh = await catalogAdminApi.listOptionGroups();
  const group = fresh.find((item) => item.id === created.id) ?? {
    ...created,
    options: [],
    options_count: named.length,
  };

  return { group };
}

/**
 * Atualiza só o essencial e sincroniza a lista de escolhas.
 * Preserva campos avançados do grupo e options que não tocamos (stock, metadata…).
 */
export async function updateCustomizationFromDraft(
  group: OptionGroupAdmin,
  draft: CustomizationDraft,
): Promise<SaveCustomizationResult> {
  const check = validateDraft(draft);
  if (!check.ok) throw new Error(check.message);

  await catalogAdminApi.updateOptionGroup(group.id, mergeEssentialIntoGroup(group, draft));
  await syncChoices(group, draft.choices.filter((c) => c.name.trim()));

  const fresh = await catalogAdminApi.listOptionGroups();
  const updated = fresh.find((item) => item.id === group.id);
  if (!updated) throw new Error("Salvo, mas não encontramos na biblioteca. Atualize a página.");

  return { group: updated };
}

async function syncChoices(group: OptionGroupAdmin, choices: ChoiceDraft[]) {
  const existingById = new Map(group.options.map((option) => [option.id, option]));
  const keptIds = new Set<string>();

  for (const [index, choice] of choices.entries()) {
    if (choice.id && existingById.has(choice.id)) {
      keptIds.add(choice.id);
      const original = existingById.get(choice.id)!;
      const nameChanged = original.name !== choice.name.trim();
      const priceChanged = original.price_modifier !== choice.price;
      const orderChanged = original.sort_order !== index;
      if (nameChanged || priceChanged || orderChanged) {
        await catalogAdminApi.updateOption(group.id, choice.id, {
          name: choice.name.trim(),
          price_modifier: choice.price,
          description: choice.description?.trim() || null,
          sort_order: index,
        });
      }
      continue;
    }

    const created = (await catalogAdminApi.createOption(group.id, {
      name: choice.name.trim(),
      price_modifier: choice.price,
      description: choice.description?.trim() || null,
      is_active: true,
      is_available: true,
      sort_order: index,
    })) as { id: string };
    keptIds.add(String(created.id));
  }

  for (const option of group.options) {
    if (!keptIds.has(option.id)) {
      await catalogAdminApi.deleteOption(group.id, option.id);
    }
  }
}

export function emptyProductLink(groupId: string, sortOrder: number) {
  return {
    option_group_id: groupId,
    sort_order: sortOrder,
    override_min: null,
    override_max: null,
    override_required: null,
    override_display_type: null,
    override_pricing_config: null,
    override_ui_config: null,
  };
}
