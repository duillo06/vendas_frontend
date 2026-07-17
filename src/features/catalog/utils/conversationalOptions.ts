import type { OptionGroupAdmin } from "@/features/catalog/api/catalogAdminApi";
import type { OptionSelectionType } from "@/features/catalog/types/catalog.types";

function formatMoney(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
/** escolha na lista do assistente (ainda sem id = nova) */
export type ChoiceDraft = {
  key: string;
  id?: string;
  name: string;
  price: number;
};

export type CustomizationDraft = {
  name: string;
  description: string;
  selection_type: OptionSelectionType;
  is_required: boolean;
  min_selections: number;
  max_selections: number;
  choices: ChoiceDraft[];
};

export type CustomizationTemplate = {
  id: string;
  label: string;
  emoji: string;
  name: string;
  description: string;
  selection_type: OptionSelectionType;
  is_required: boolean;
  max_selections: number;
  suggestions: string[];
};

export const CUSTOMIZATION_TEMPLATES: CustomizationTemplate[] = [
  {
    id: "size",
    label: "Tamanho",
    emoji: "📏",
    name: "Tamanho",
    description: "Escolha o tamanho",
    selection_type: "single",
    is_required: true,
    max_selections: 1,
    suggestions: ["Pequena", "Média", "Grande", "Família"],
  },
  {
    id: "crust",
    label: "Borda",
    emoji: "🧀",
    name: "Borda",
    description: "Quer borda recheada?",
    selection_type: "single",
    is_required: false,
    max_selections: 1,
    suggestions: ["Sem borda", "Catupiry", "Cheddar", "Chocolate"],
  },
  {
    id: "extras",
    label: "Adicionais",
    emoji: "➕",
    name: "Adicionais",
    description: "Quer algo a mais?",
    selection_type: "multiple",
    is_required: false,
    max_selections: 5,
    suggestions: ["Bacon", "Queijo extra", "Azeitona", "Cebola", "Catupiry"],
  },
  {
    id: "sauces",
    label: "Molhos",
    emoji: "🧴",
    name: "Molhos",
    description: "Escolha os molhos",
    selection_type: "multiple",
    is_required: false,
    max_selections: 3,
    suggestions: ["Ketchup", "Maionese", "Mostarda", "Barbecue", "Alho"],
  },
  {
    id: "other",
    label: "Outra coisa",
    emoji: "✨",
    name: "",
    description: "",
    selection_type: "single",
    is_required: false,
    max_selections: 1,
    suggestions: [],
  },
];

export function emptyDraft(): CustomizationDraft {
  return {
    name: "",
    description: "",
    selection_type: "single",
    is_required: false,
    min_selections: 0,
    max_selections: 1,
    choices: [],
  };
}

export function draftFromTemplate(template: CustomizationTemplate): CustomizationDraft {
  return {
    name: template.name,
    description: template.description,
    selection_type: template.selection_type,
    is_required: template.is_required,
    min_selections: template.is_required ? 1 : 0,
    max_selections: template.selection_type === "single" ? 1 : template.max_selections,
    choices: [],
  };
}

export function draftFromGroup(group: OptionGroupAdmin): CustomizationDraft {
  const selection_type = (group.selection_type === "multiple" ? "multiple" : "single") as OptionSelectionType;
  return {
    name: group.name,
    description: group.description ?? "",
    selection_type,
    is_required: group.is_required,
    min_selections: group.min_selections,
    max_selections: selection_type === "single" ? 1 : group.max_selections,
    choices: group.options.map((option) => ({
      key: option.id,
      id: option.id,
      name: option.name,
      price: option.price_modifier,
    })),
  };
}

/** aplica regras simples quando o usuário muda perguntas */
export function applySelectionType(
  draft: CustomizationDraft,
  selection_type: OptionSelectionType,
): CustomizationDraft {
  if (selection_type === "single") {
    return {
      ...draft,
      selection_type,
      max_selections: 1,
      min_selections: draft.is_required ? 1 : 0,
    };
  }
  return {
    ...draft,
    selection_type,
    max_selections: draft.max_selections <= 1 ? 5 : draft.max_selections,
    min_selections: draft.is_required ? Math.max(draft.min_selections, 1) : 0,
  };
}

export function applyRequired(draft: CustomizationDraft, is_required: boolean): CustomizationDraft {
  return {
    ...draft,
    is_required,
    min_selections: is_required ? Math.max(draft.min_selections, 1) : 0,
  };
}

export function applyMaxSelections(draft: CustomizationDraft, max: number): CustomizationDraft {
  const safe = Math.max(0, Math.min(max, 99));
  return {
    ...draft,
    max_selections: safe,
    min_selections:
      draft.is_required && safe > 0
        ? Math.min(Math.max(draft.min_selections, 1), safe)
        : draft.is_required
          ? 1
          : 0,
  };
}

/**
 * Payload essencial pro create/update.
 * Não mexe em visibility/pricing/ui avançados — quem chama faz merge no edit.
 */
export function essentialPayloadFromDraft(draft: CustomizationDraft): Record<string, unknown> {
  const selection_type = draft.selection_type;
  const is_required = draft.is_required;
  const max_selections = selection_type === "single" ? 1 : draft.max_selections;
  const min_selections = is_required ? Math.max(draft.min_selections, 1) : 0;

  return {
    name: draft.name.trim(),
    description: draft.description.trim() || null,
    selection_type,
    selection_mode: "pick",
    display_type: selection_type === "single" ? "radio" : "checkbox",
    min_selections,
    max_selections,
    is_required,
  };
}

/** merge seguro: só sobrescreve campos essenciais; preserva avançados do grupo */
export function mergeEssentialIntoGroup(
  group: OptionGroupAdmin,
  draft: CustomizationDraft,
): Record<string, unknown> {
  const essential = essentialPayloadFromDraft(draft);
  return {
    ...essential,
    // preserva o que o leigo não vê
    visibility: group.visibility ?? "always",
    pricing_config: group.pricing_config ?? { strategy: "additive" },
    ui_config: group.ui_config ?? {},
    icon: group.icon ?? "",
    image_url: group.image_url ?? null,
    default_option_ids: group.default_option_ids ?? [],
    selection_mode: group.selection_mode ?? "pick",
    // display: só troca se ainda for o padrão antigo/simples
    display_type:
      group.display_type && !["list", "radio", "checkbox"].includes(String(group.display_type))
        ? group.display_type
        : essential.display_type,
  };
}

export function createDefaultsPayload(draft: CustomizationDraft): Record<string, unknown> {
  return {
    ...essentialPayloadFromDraft(draft),
    is_active: true,
    visibility: "always",
    pricing_config: { strategy: "additive" },
    ui_config: {},
    icon: "",
  };
}

export type DraftValidation = { ok: true } | { ok: false; message: string };

export function validateDraft(draft: CustomizationDraft): DraftValidation {
  if (!draft.name.trim()) {
    return { ok: false, message: "Dê um nome pra essa personalização — ex.: Borda ou Tamanho." };
  }
  const named = draft.choices.filter((c) => c.name.trim());
  if (named.length === 0) {
    return { ok: false, message: "Adicione pelo menos uma escolha pro cliente ver no cardápio." };
  }
  if (named.some((c) => Number.isNaN(c.price) || c.price < 0)) {
    return { ok: false, message: "Tem preço inválido. Use zero se a escolha não muda o valor." };
  }
  if (draft.selection_type === "multiple" && draft.max_selections === 0) {
    // 0 = ilimitado — ok
  } else if (draft.selection_type === "multiple" && draft.max_selections < 1) {
    return { ok: false, message: "Defina quantas escolhas o cliente pode fazer." };
  }
  if (draft.is_required && draft.min_selections < 1) {
    return { ok: false, message: "Se for obrigatório, o cliente precisa escolher pelo menos 1." };
  }
  return { ok: true };
}

export function buildPreviewLines(draft: CustomizationDraft): string[] {
  if (!draft.name.trim()) return ["Responda as perguntas pra ver como fica no cardápio."];

  const lines: string[] = [];
  const named = draft.choices.filter((c) => c.name.trim());

  if (draft.selection_type === "single") {
    lines.push(
      draft.is_required
        ? `O cliente escolhe 1 opção em “${draft.name.trim()}”.`
        : `O cliente pode escolher 1 opção em “${draft.name.trim()}” (ou pular).`,
    );
  } else if (draft.max_selections === 0) {
    lines.push(
      draft.is_required
        ? `O cliente escolhe quantas quiser em “${draft.name.trim()}” (pelo menos 1).`
        : `O cliente pode escolher quantas quiser em “${draft.name.trim()}”.`,
    );
  } else {
    lines.push(
      draft.is_required
        ? `O cliente escolhe até ${draft.max_selections} em “${draft.name.trim()}” (obrigatório).`
        : `O cliente pode escolher até ${draft.max_selections} em “${draft.name.trim()}”.`,
    );
  }

  if (named.length === 0) {
    lines.push("Ainda não há escolhas cadastradas.");
  } else {
    const sample = named
      .slice(0, 4)
      .map((c) => (c.price > 0 ? `${c.name} (+${formatMoney(c.price)})` : c.name))
      .join(", ");
    const extra = named.length > 4 ? ` e mais ${named.length - 4}` : "";
    lines.push(`Escolhas: ${sample}${extra}.`);
  }

  return lines;
}

export function summarizeGroup(group: OptionGroupAdmin): string {
  const count = group.options_count || group.options.length;
  const type =
    group.selection_type === "multiple"
      ? group.max_selections === 0
        ? "várias (sem limite)"
        : `até ${group.max_selections}`
      : "1 escolha";
  const req = group.is_required ? "obrigatório" : "opcional";
  return `${count} escolha${count === 1 ? "" : "s"} · ${type} · ${req}`;
}

/** acha personalizações salvas parecidas com o atalho escolhido */
export function findReusableGroups(
  groups: OptionGroupAdmin[],
  template: CustomizationTemplate,
  excludeIds: Set<string>,
): OptionGroupAdmin[] {
  if (template.id === "other" || !template.name) return [];
  const needle = template.name.toLowerCase();
  return groups.filter((group) => {
    if (excludeIds.has(group.id) || !group.is_active) return false;
    const name = group.name.toLowerCase();
    return name === needle || name.includes(needle) || needle.includes(name);
  });
}

export function newChoice(name = "", price = 0): ChoiceDraft {
  return { key: crypto.randomUUID(), name, price };
}

/** checks dos mapeamentos — usado no script de verificação */
export function selfCheckConversationalOptions(): void {
  const size = CUSTOMIZATION_TEMPLATES.find((t) => t.id === "size");
  if (!size) throw new Error("template size ausente");

  const draft = draftFromTemplate(size);
  if (draft.selection_type !== "single" || !draft.is_required || draft.max_selections !== 1) {
    throw new Error("draftFromTemplate size inválido");
  }

  const multi = applySelectionType(draft, "multiple");
  if (multi.selection_type !== "multiple" || multi.max_selections < 2) {
    throw new Error("applySelectionType multiple inválido");
  }

  const optional = applyRequired(multi, false);
  if (optional.is_required || optional.min_selections !== 0) {
    throw new Error("applyRequired false inválido");
  }

  const payload = essentialPayloadFromDraft({
    ...applyMaxSelections(optional, 3),
    name: "Adicionais",
    choices: [{ key: "1", name: "Bacon", price: 5 }],
  });
  if (
    payload.selection_type !== "multiple" ||
    payload.selection_mode !== "pick" ||
    payload.display_type !== "checkbox" ||
    payload.max_selections !== 3
  ) {
    throw new Error("essentialPayloadFromDraft inválido");
  }

  const createPayload = createDefaultsPayload({
    ...emptyDraft(),
    name: "Tamanho",
    selection_type: "single",
    is_required: true,
    min_selections: 1,
    max_selections: 1,
    choices: [{ key: "a", name: "G", price: 0 }],
  });
  if (createPayload.visibility !== "always" || createPayload.display_type !== "radio") {
    throw new Error("createDefaultsPayload inválido");
  }

  if (validateDraft(emptyDraft()).ok) throw new Error("validateDraft deveria falhar");

  const legacy = {
    id: "g1",
    name: "Borda",
    description: null,
    selection_type: "single" as const,
    selection_mode: "pick",
    display_type: "image_cards",
    min_selections: 1,
    max_selections: 1,
    is_required: true,
    is_active: true,
    sort_order: 0,
    visibility: "always" as const,
    pricing_config: { strategy: "first_n_free" as const, free_count: 1 },
    ui_config: { hint: "escolha a borda" },
    icon: "🧀",
    image_url: null,
    default_option_ids: [],
    options: [],
    options_count: 0,
  };

  const merged = mergeEssentialIntoGroup(legacy, {
    name: "Borda recheada",
    description: "Nova desc",
    selection_type: "single",
    is_required: true,
    min_selections: 1,
    max_selections: 1,
    choices: [{ key: "x", name: "Catupiry", price: 8 }],
  });

  if (merged.display_type !== "image_cards") {
    throw new Error("merge deveria preservar display avançado");
  }
  if (JSON.stringify(merged.pricing_config) !== JSON.stringify(legacy.pricing_config)) {
    throw new Error("merge deveria preservar pricing_config");
  }
  if (merged.name !== "Borda recheada") throw new Error("merge name inválido");
}
