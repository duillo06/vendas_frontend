/** papel do produto na vitrine / selos — o comerciante escolhe, a Home lê */

export type ProductTagGroup = "showcase" | "trait";

export type ProductTagBadgeTone = "brand" | "accent" | "hot" | "fresh" | "sale" | "neutral";

export type ProductTagPreset = {
  /** valor canônico gravado no produto */
  id: string;
  label: string;
  emoji: string;
  hint: string;
  group: ProductTagGroup;
  match: RegExp;
  badge?: { label: string; tone: ProductTagBadgeTone };
};

export const PRODUCT_TAG_PRESETS: ProductTagPreset[] = [
  {
    id: "mais vendido",
    label: "Mais pedido",
    emoji: "🔥",
    hint: "Sobe no destaque da Home quando não há promoção.",
    group: "showcase",
    match: /mais[\s-]?vendido|destaque|popular/i,
    badge: { label: "Mais vendido", tone: "hot" },
  },
  {
    id: "favorito",
    label: "Favorito da casa",
    emoji: "💛",
    hint: "Entra no bloco Favoritos da vitrine.",
    group: "showcase",
    match: /favorito/i,
    badge: { label: "Favorito", tone: "accent" },
  },
  {
    id: "novidade",
    label: "Lançamento",
    emoji: "✨",
    hint: "Aparece em Lançamentos / Novidades na Home.",
    group: "showcase",
    match: /^novo$|novidade|lan[cç]amento/i,
    badge: { label: "Novidade", tone: "fresh" },
  },
  {
    id: "combo",
    label: "Combo",
    emoji: "👨‍👩‍👧",
    hint: "Aparece no bloco Combos da Home.",
    group: "showcase",
    match: /combo|kit|fam[ií]lia/i,
    badge: { label: "Combo", tone: "brand" },
  },
  {
    id: "vegano",
    label: "Vegano",
    emoji: "🍃",
    hint: "Selo no cardápio e na busca.",
    group: "trait",
    match: /^vegano$/i,
    badge: { label: "Vegano", tone: "fresh" },
  },
  {
    id: "vegetariano",
    label: "Vegetariano",
    emoji: "🥗",
    hint: "Selo no cardápio e na busca.",
    group: "trait",
    match: /vegetariano/i,
    badge: { label: "Vegetariano", tone: "fresh" },
  },
  {
    id: "picante",
    label: "Picante",
    emoji: "🌶️",
    hint: "Avisa quem gosta de arder.",
    group: "trait",
    match: /picante|apimentado/i,
    badge: { label: "Picante", tone: "hot" },
  },
  {
    id: "artesanal",
    label: "Artesanal",
    emoji: "✨",
    hint: "Destaque de preparo artesanal.",
    group: "trait",
    match: /artesanal/i,
    badge: { label: "Artesanal", tone: "brand" },
  },
  {
    id: "premium",
    label: "Premium",
    emoji: "💎",
    hint: "Selo de linha premium / gourmet.",
    group: "trait",
    match: /premium|gourmet/i,
    badge: { label: "Premium", tone: "brand" },
  },
  {
    id: "sem glúten",
    label: "Sem glúten",
    emoji: "🌾",
    hint: "Ajuda quem busca sem glúten.",
    group: "trait",
    match: /sem[\s-]?glut[eé]n/i,
    badge: { label: "Sem glúten", tone: "neutral" },
  },
];

/** matchers usados pela Home / feeds — mesma regra do admin */
export const TAG_MATCHERS = {
  bestsellers: /mais[\s-]?vendido|destaque|popular/i,
  favorites: /favorito/i,
  launches: /^novo$|novidade|lan[cç]amento/i,
  combos: /combo|kit|fam[ií]lia/i,
} as const;

export function productHasMatcher(tags: string[], matcher: RegExp): boolean {
  return tags.some((tag) => matcher.test(tag));
}

export function isPresetActive(tags: string[], preset: ProductTagPreset): boolean {
  return tags.some((tag) => preset.match.test(tag));
}

/** liga/desliga preset e limpa aliases do mesmo grupo */
export function togglePreset(tags: string[], preset: ProductTagPreset, on: boolean): string[] {
  const without = tags.filter((tag) => !preset.match.test(tag));
  if (!on) return without;
  if (without.some((tag) => tag === preset.id)) return without;
  return [...without, preset.id];
}

/** troca aliases por ids canônicos + mantém tags livres */
export function normalizeProductTags(tags: string[]): string[] {
  const free: string[] = [];
  const active = new Set<string>();

  for (const raw of tags) {
    const tag = raw.trim();
    if (!tag) continue;
    const preset = PRODUCT_TAG_PRESETS.find((p) => p.match.test(tag));
    if (preset) {
      active.add(preset.id);
    } else {
      free.push(tag);
    }
  }

  return [...PRODUCT_TAG_PRESETS.filter((p) => active.has(p.id)).map((p) => p.id), ...free];
}

export function showcasePresets() {
  return PRODUCT_TAG_PRESETS.filter((p) => p.group === "showcase");
}

export function traitPresets() {
  return PRODUCT_TAG_PRESETS.filter((p) => p.group === "trait");
}

export function getActiveShowcaseLabels(tags: string[]): string[] {
  return showcasePresets()
    .filter((p) => isPresetActive(tags, p))
    .map((p) => `${p.emoji} ${p.label}`);
}
