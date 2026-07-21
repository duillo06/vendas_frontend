import {
  catalogAdminApi,
  type OptionGroupAdmin,
} from "@/features/catalog/api/catalogAdminApi";
import {
  createDefaultsPayload,
  draftFromKind,
  findReusableGroups,
  inferKindFromGroup,
  kindById,
  mergeEssentialIntoGroup,
  type ChoiceDraft,
  type CustomizationDraft,
  type PersonalizationKind,
  type PersonalizationKindId,
  validateDraft,
} from "@/features/catalog/utils/conversationalOptions";

export type CanonicalSaveResult = {
  group: OptionGroupAdmin;
  /** true se reaproveitou grupo que já existia na casa */
  reused: boolean;
  /** opções novas criadas nesta gravação */
  createdCount: number;
};

/** acha o grupo canônico da empresa pra aquele tipo (Tamanho, Borda…) */
export function findCanonicalGroup(
  groups: OptionGroupAdmin[],
  kind: PersonalizationKind,
): OptionGroupAdmin | null {
  const matches = findReusableGroups(groups, kind, new Set());
  if (matches.length === 0) return null;
  // prefere nome exato do kind; senão o que tem mais opções
  const exact = matches.find((g) => g.name.toLowerCase() === kind.groupName.toLowerCase());
  if (exact) return exact;
  return [...matches].sort((a, b) => (b.options_count || b.options.length) - (a.options_count || a.options.length))[0];
}

export function resolveKindFromDraft(draft: CustomizationDraft): PersonalizationKind | null {
  if (draft.kindId) {
    const byId = kindById(draft.kindId);
    if (byId && !byId.opensComposition) return byId;
  }
  // fallback: nome do draft
  const fake = {
    id: "tmp",
    name: draft.name,
    description: null,
    selection_type: draft.selection_type,
    min_selections: draft.min_selections,
    max_selections: draft.max_selections,
    is_required: draft.is_required,
    is_active: true,
    sort_order: 0,
    options: [],
    options_count: 0,
  } as OptionGroupAdmin;
  return inferKindFromGroup(fake) ?? null;
}

/**
 * Garante o grupo da casa + upsert das opções por NOME.
 * Nunca apaga opções da biblioteca (outros produtos podem usar).
 * Nunca cria um segundo "Tamanho"/"Borda" se já existir.
 */
export async function saveCanonicalFromDraft(
  draft: CustomizationDraft,
  availableGroups: OptionGroupAdmin[],
): Promise<CanonicalSaveResult> {
  const check = validateDraft(draft);
  if (!check.ok) throw new Error(check.message);

  const kind = resolveKindFromDraft(draft);
  const named = draft.choices.filter((c) => c.name.trim());

  let group = kind ? findCanonicalGroup(availableGroups, kind) : null;
  let reused = Boolean(group);

  if (!group) {
    // kind "other" ou primeira vez — cria o canônico
    const seed = kind
      ? { ...draftFromKind(kind), name: draft.name.trim() || kind.groupName, description: draft.description }
      : draft;
    const created = await catalogAdminApi.createOptionGroup({
      ...createDefaultsPayload({ ...seed, choices: named }),
      sort_order: availableGroups.length,
    });
    group = { ...created, options: [], options_count: 0 };
    reused = false;
  } else {
    // atualiza só metadados essenciais do grupo (sem matar pricing avançado)
    await catalogAdminApi.updateOptionGroup(group.id, mergeEssentialIntoGroup(group, draft));
  }

  const { group: synced, createdCount } = await upsertChoicesByName(group, named);
  return { group: synced, reused, createdCount };
}

/** atualiza existente ou cria — nunca deleta da biblioteca */
async function upsertChoicesByName(
  group: OptionGroupAdmin,
  choices: ChoiceDraft[],
): Promise<{ group: OptionGroupAdmin; createdCount: number }> {
  const byName = new Map(
    group.options.map((option) => [option.name.trim().toLowerCase(), option]),
  );
  let createdCount = 0;
  let sortBase = group.options.reduce((max, o) => Math.max(max, o.sort_order), -1);

  for (const choice of choices) {
    const name = choice.name.trim();
    const needle = name.toLowerCase();
    const existing = byName.get(needle);

    if (existing) {
      const priceChanged = existing.price_modifier !== choice.price;
      const descChanged =
        (existing.description ?? "") !== (choice.description?.trim() ?? "");
      if (priceChanged || descChanged) {
        await catalogAdminApi.updateOption(group.id, existing.id, {
          name,
          price_modifier: choice.price,
          description: choice.description?.trim() || null,
        });
      }
      continue;
    }

    sortBase += 1;
    await catalogAdminApi.createOption(group.id, {
      name,
      price_modifier: choice.price,
      description: choice.description?.trim() || null,
      is_active: true,
      is_available: true,
      sort_order: sortBase,
    });
    createdCount += 1;
  }

  const fresh = await catalogAdminApi.listOptionGroups();
  const updated = fresh.find((item) => item.id === group.id);
  if (!updated) throw new Error("Salvo, mas não achamos na biblioteca. Atualize a página.");
  return { group: updated, createdCount };
}

/**
 * Edição explícita na Biblioteca: pode remover opções não listadas.
 * Usar só na tela /opcoes — não no cadastro do produto.
 */
export async function replaceCanonicalChoices(
  group: OptionGroupAdmin,
  draft: CustomizationDraft,
): Promise<CanonicalSaveResult> {
  const check = validateDraft(draft);
  if (!check.ok) throw new Error(check.message);

  await catalogAdminApi.updateOptionGroup(group.id, mergeEssentialIntoGroup(group, draft));

  const named = draft.choices.filter((c) => c.name.trim());
  const existingById = new Map(group.options.map((o) => [o.id, o]));
  const byName = new Map(group.options.map((o) => [o.name.trim().toLowerCase(), o]));
  const keptIds = new Set<string>();
  let createdCount = 0;

  for (const [index, choice] of named.entries()) {
    if (choice.id && existingById.has(choice.id)) {
      keptIds.add(choice.id);
      const original = existingById.get(choice.id)!;
      if (
        original.name !== choice.name.trim() ||
        original.price_modifier !== choice.price ||
        original.sort_order !== index
      ) {
        await catalogAdminApi.updateOption(group.id, choice.id, {
          name: choice.name.trim(),
          price_modifier: choice.price,
          description: choice.description?.trim() || null,
          sort_order: index,
        });
      }
      continue;
    }

    const sameName = byName.get(choice.name.trim().toLowerCase());
    if (sameName) {
      keptIds.add(sameName.id);
      await catalogAdminApi.updateOption(group.id, sameName.id, {
        name: choice.name.trim(),
        price_modifier: choice.price,
        description: choice.description?.trim() || null,
        sort_order: index,
      });
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
    createdCount += 1;
  }

  for (const option of group.options) {
    if (!keptIds.has(option.id)) {
      await catalogAdminApi.deleteOption(group.id, option.id);
    }
  }

  const fresh = await catalogAdminApi.listOptionGroups();
  const updated = fresh.find((item) => item.id === group.id);
  if (!updated) throw new Error("Biblioteca salva, mas não encontramos o item. Atualize a página.");
  return { group: updated, reused: true, createdCount };
}

/** mapeia nome de grupo do wizard → kind id */
export function kindIdFromGroupName(name: string): PersonalizationKindId | null {
  const fake = {
    id: "x",
    name,
    description: null,
    selection_type: "single" as const,
    min_selections: 0,
    max_selections: 1,
    is_required: false,
    is_active: true,
    sort_order: 0,
    options: [],
    options_count: 0,
  };
  return inferKindFromGroup(fake)?.id ?? null;
}

/** pré-carrega sugestões da biblioteca pro wizard / assistente */
export function librarySuggestionsForGroupName(
  groups: OptionGroupAdmin[],
  groupName: string,
): { name: string; price: number }[] {
  const kindId = kindIdFromGroupName(groupName);
  const kind = kindId ? kindById(kindId) : null;
  if (!kind) return [];
  const canonical = findCanonicalGroup(groups, kind);
  if (!canonical) return [];
  return canonical.options
    .filter((o) => o.is_active !== false)
    .map((o) => ({ name: o.name, price: o.price_modifier }));
}
