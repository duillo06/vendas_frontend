import type { OptionGroupAdmin } from "@/features/catalog/api/catalogAdminApi";
import type { OptionSelectionType } from "@/features/catalog/types/catalog.types";
import { createId } from "@/shared/lib/utils";

function formatMoney(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** escolha na lista do assistente (ainda sem id = nova) */
export type ChoiceDraft = {
  key: string;
  id?: string;
  name: string;
  price: number;
  description?: string;
};

export type CustomizationDraft = {
  name: string;
  description: string;
  selection_type: OptionSelectionType;
  is_required: boolean;
  min_selections: number;
  max_selections: number;
  choices: ChoiceDraft[];
  /** atalho usado — pra achar a biblioteca certa */
  kindId?: PersonalizationKindId;
};

export type PersonalizationKindId =
  | "size"
  | "crust"
  | "extras"
  | "buildable"
  | "half"
  | "sauces"
  | "other";

/** Tipo 1 — preço no produto (varia por item) */
export const PRODUCT_PRICE_KINDS = new Set<string>(["size", "volume"]);

/** Tipo 2 — preço padrão na categoria */
export const CATEGORY_PRICE_KINDS = new Set<string>([
  "crust",
  "extras",
  "buildable",
  "sauces",
  "dough",
  "other",
]);

export function isProductPricedKind(kind: string) {
  return PRODUCT_PRICE_KINDS.has(kind);
}

export function isCategoryPricedKind(kind: string) {
  return CATEGORY_PRICE_KINDS.has(kind);
}

export type PersonalizationKind = {
  id: PersonalizationKindId;
  emoji: string;
  label: string;
  example: string;
  /** pergunta sim/não */
  gateQuestion: string;
  gateHint?: string;
  /** pergunta da biblioteca */
  libraryQuestion: string;
  libraryHint?: string;
  createLabel: string;
  /** nome do grupo no cardápio */
  groupName: string;
  groupDescription: string;
  selection_type: OptionSelectionType;
  is_required: boolean;
  max_selections: number;
  suggestions: string[];
  /** palavras pra achar grupos salvos */
  matchNames: string[];
  /** meio a meio usa composition, não option group */
  opensComposition?: boolean;
};

/** cartões do hub — linguagem do comerciante */
export const PERSONALIZATION_KINDS: PersonalizationKind[] = [
  {
    id: "size",
    emoji: "🍕",
    label: "Possui tamanhos",
    example: "Pequena, Média e Grande.",
    gateQuestion: "Este produto será vendido em mais de um tamanho?",
    libraryQuestion: "Quais tamanhos deseja oferecer?",
    libraryHint: "Marque os que já existem ou crie um novo — fica salvo pra próxima vez.",
    createLabel: "Criar novo tamanho",
    groupName: "Tamanho",
    groupDescription: "Escolha o tamanho",
    selection_type: "single",
    is_required: true,
    max_selections: 1,
    suggestions: ["Pequena", "Média", "Grande", "Família", "Gigante", "Broto", "Individual"],
    matchNames: ["tamanho", "tamanhos", "size"],
  },
  {
    id: "crust",
    emoji: "🧀",
    label: "Possui bordas",
    example: "Cheddar, Catupiry.",
    gateQuestion: "Esta pizza permite borda recheada?",
    libraryQuestion: "Quais bordas deseja oferecer?",
    libraryHint: "Escolha as da casa ou crie uma nova.",
    createLabel: "Criar nova borda",
    groupName: "Borda",
    groupDescription: "Quer borda recheada?",
    selection_type: "single",
    is_required: false,
    max_selections: 1,
    suggestions: ["Sem borda", "Catupiry", "Cheddar", "Chocolate", "Cream Cheese"],
    matchNames: ["borda", "bordas", "crust"],
  },
  {
    id: "extras",
    emoji: "🥓",
    label: "Possui adicionais",
    example: "Bacon, Queijo, Ovo.",
    gateQuestion: "Este produto possui adicionais?",
    libraryQuestion: "Quais adicionais deseja oferecer?",
    libraryHint: "Tudo que você criar fica na biblioteca da empresa.",
    createLabel: "Criar novo adicional",
    groupName: "Adicionais",
    groupDescription: "Quer algo a mais?",
    selection_type: "multiple",
    is_required: false,
    max_selections: 5,
    suggestions: ["Bacon", "Queijo", "Ovo", "Milho", "Calabresa", "Azeitona", "Cebola"],
    matchNames: ["adicionais", "adicional", "extras", "complementos"],
  },
  {
    id: "buildable",
    emoji: "🥟",
    label: "Produto montável",
    example: "Monte seu pastel.",
    gateQuestion: "O cliente monta este produto?",
    gateHint: "Ex.: pastel, açaí, hambúrguer, pizza personalizada.",
    libraryQuestion: "Quais ingredientes estarão disponíveis?",
    libraryHint: "Usa a mesma biblioteca de adicionais — sem recriar.",
    createLabel: "Criar novo ingrediente",
    groupName: "Ingredientes",
    groupDescription: "Monte do seu jeito",
    selection_type: "multiple",
    is_required: false,
    max_selections: 0,
    suggestions: ["Queijo", "Presunto", "Frango", "Carne", "Bacon", "Milho", "Catupiry"],
    matchNames: ["ingredientes", "montagem", "monte", "recheio", "adicionais", "extras"],
  },
  {
    id: "half",
    emoji: "🍕",
    label: "Meio a meio / Sabores",
    example: "Escolher outro sabor.",
    gateQuestion: "Este produto permite escolher outros sabores?",
    libraryQuestion: "",
    createLabel: "",
    groupName: "",
    groupDescription: "",
    selection_type: "single",
    is_required: false,
    max_selections: 1,
    suggestions: [],
    matchNames: [],
    opensComposition: true,
  },
  {
    id: "sauces",
    emoji: "🧴",
    label: "Possui molhos",
    example: "Ketchup, Barbecue, Alho.",
    gateQuestion: "Este produto oferece molhos?",
    libraryQuestion: "Quais molhos deseja oferecer?",
    createLabel: "Criar novo molho",
    groupName: "Molhos",
    groupDescription: "Escolha os molhos",
    selection_type: "multiple",
    is_required: false,
    max_selections: 3,
    suggestions: ["Ketchup", "Maionese", "Mostarda", "Barbecue", "Alho"],
    matchNames: ["molho", "molhos", "sauce"],
  },
  {
    id: "other",
    emoji: "✨",
    label: "Outra personalização",
    example: "Massa, ponto da carne, bebida…",
    gateQuestion: "Quer criar uma personalização diferente?",
    libraryQuestion: "Quais opções o cliente poderá escolher?",
    createLabel: "Criar nova opção",
    groupName: "",
    groupDescription: "",
    selection_type: "single",
    is_required: false,
    max_selections: 1,
    suggestions: [],
    matchNames: [],
  },
];

/** @deprecated use PERSONALIZATION_KINDS — mantido pro script de check */
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

export const CUSTOMIZATION_TEMPLATES: CustomizationTemplate[] = PERSONALIZATION_KINDS.filter(
  (k) => !k.opensComposition,
).map((k) => ({
  id: k.id,
  label: k.label,
  emoji: k.emoji,
  name: k.groupName,
  description: k.groupDescription,
  selection_type: k.selection_type,
  is_required: k.is_required,
  max_selections: k.max_selections,
  suggestions: k.suggestions,
}));

export function kindById(id: PersonalizationKindId): PersonalizationKind | undefined {
  return PERSONALIZATION_KINDS.find((k) => k.id === id);
}

/** categorias → cartões em destaque no hub */
export function suggestedKindIds(categoryName?: string | null): PersonalizationKindId[] {
  const name = (categoryName ?? "").toLowerCase();
  if (/pizza|pizzaria/.test(name)) return ["size", "crust", "half", "extras"];
  if (/hamb|burger|lanche/.test(name)) return ["extras", "sauces", "buildable"];
  if (/pastel/.test(name)) return ["buildable", "extras"];
  if (/a[cç]a[ií]|sorvete|milk/.test(name)) return ["extras", "buildable"];
  return ["size", "extras", "other"];
}

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

export function draftFromKind(kind: PersonalizationKind, customName?: string): CustomizationDraft {
  const name = customName?.trim() || kind.groupName;
  return {
    name,
    description: kind.groupDescription,
    selection_type: kind.selection_type,
    is_required: kind.is_required,
    min_selections: kind.is_required ? 1 : 0,
    max_selections: kind.selection_type === "single" ? 1 : kind.max_selections,
    choices: [],
    kindId: kind.id,
  };
}

export function draftFromTemplate(template: CustomizationTemplate): CustomizationDraft {
  const kind = kindById(template.id as PersonalizationKindId);
  if (kind) return draftFromKind(kind);
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

export function draftFromGroup(
  group: OptionGroupAdmin,
  productPrices?: Record<string, number>,
): CustomizationDraft {
  const selection_type = (group.selection_type === "multiple" ? "multiple" : "single") as OptionSelectionType;
  const kind = inferKindFromGroup(group);
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
      // preço do produto se existir; senão legado; senão 0
      price:
        productPrices?.[option.id] ??
        (productPrices ? 0 : option.price_modifier),
      description: option.description ?? "",
    })),
    kindId: kind?.id,
  };
}

export function inferKindFromGroup(group: OptionGroupAdmin): PersonalizationKind | undefined {
  const name = group.name.toLowerCase();
  return PERSONALIZATION_KINDS.find(
    (k) => !k.opensComposition && k.matchNames.some((m) => name.includes(m) || m.includes(name)),
  );
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
    visibility: group.visibility ?? "always",
    pricing_config: group.pricing_config ?? { strategy: "additive" },
    ui_config: group.ui_config ?? {},
    icon: group.icon ?? "",
    image_url: group.image_url ?? null,
    default_option_ids: group.default_option_ids ?? [],
    selection_mode: group.selection_mode ?? "pick",
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
    return { ok: false, message: "Marque ou crie pelo menos uma opção pro cliente ver no cardápio." };
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
  const names = group.options
    .filter((o) => o.is_active !== false)
    .map((o) => o.name)
    .slice(0, 4);
  if (names.length === 0) {
    const count = group.options_count || group.options.length;
    return `${count} escolha${count === 1 ? "" : "s"}`;
  }
  const extra =
    (group.options_count || group.options.length) > names.length
      ? ` +${(group.options_count || group.options.length) - names.length}`
      : "";
  return `${names.join(" · ")}${extra}`;
}

/** grupos salvos parecidos com o atalho */
export function findReusableGroups(
  groups: OptionGroupAdmin[],
  kindOrTemplate: PersonalizationKind | CustomizationTemplate,
  excludeIds: Set<string>,
): OptionGroupAdmin[] {
  const matchNames =
    "matchNames" in kindOrTemplate
      ? kindOrTemplate.matchNames
      : kindOrTemplate.name
        ? [kindOrTemplate.name.toLowerCase()]
        : [];
  if (matchNames.length === 0) return [];

  return groups.filter((group) => {
    if (excludeIds.has(group.id) || !group.is_active) return false;
    const name = group.name.toLowerCase();
    return matchNames.some((m) => name.includes(m) || m.includes(name));
  });
}

/** item da biblioteca da empresa (opções já criadas + sugestões) */
export type LibraryItem = {
  key: string;
  name: string;
  price: number;
  description?: string;
  /** veio de um grupo salvo */
  fromLibrary: boolean;
  optionId?: string;
  groupId?: string;
};

export function buildLibraryItems(
  groups: OptionGroupAdmin[],
  kind: PersonalizationKind,
  excludeGroupIds: Set<string>,
): LibraryItem[] {
  const reusable = findReusableGroups(groups, kind, excludeGroupIds);
  const byName = new Map<string, LibraryItem>();

  for (const group of reusable) {
    for (const option of group.options) {
      if (option.is_active === false) continue;
      const name = option.name.trim();
      if (!name) continue;
      const needle = name.toLowerCase();
      if (byName.has(needle)) continue;
      byName.set(needle, {
        key: `lib-${option.id}`,
        name,
        price: option.price_modifier,
        description: option.description ?? undefined,
        fromLibrary: true,
        optionId: option.id,
        groupId: group.id,
      });
    }
  }

  for (const suggestion of kind.suggestions) {
    const needle = suggestion.toLowerCase();
    if (byName.has(needle)) continue;
    byName.set(needle, {
      key: `sug-${needle}`,
      name: suggestion,
      price: 0,
      fromLibrary: false,
    });
  }

  return [...byName.values()];
}

export function newChoice(name = "", price = 0, description = ""): ChoiceDraft {
  return { key: createId(), name, price, description };
}

/** checks dos mapeamentos — usado no script de verificação */
export function selfCheckConversationalOptions(): void {
  const size = kindById("size");
  if (!size) throw new Error("kind size ausente");

  const draft = draftFromKind(size);
  if (draft.selection_type !== "single" || !draft.is_required || draft.max_selections !== 1) {
    throw new Error("draftFromKind size inválido");
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

  const pizzaHints = suggestedKindIds("Pizzas");
  if (!pizzaHints.includes("size") || !pizzaHints.includes("half")) {
    throw new Error("suggestedKindIds pizza inválido");
  }

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
