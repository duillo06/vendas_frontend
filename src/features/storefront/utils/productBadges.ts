export type ProductBadgeTone = "brand" | "accent" | "hot" | "fresh" | "sale" | "neutral";

export type ProductBadge = {
  label: string;
  tone: ProductBadgeTone;
};

const BADGE_RULES: Array<{ match: RegExp; label: string; tone: ProductBadgeTone }> = [
  { match: /mais vendido|destaque|popular/i, label: "Mais vendido", tone: "hot" },
  { match: /favorito/i, label: "Favorito", tone: "accent" },
  { match: /^novo$|novidade/i, label: "Novidade", tone: "fresh" },
  { match: /promo/i, label: "Promoção", tone: "sale" },
  { match: /frete.?gr[aá]tis|entrega.?gr[aá]tis/i, label: "Frete grátis", tone: "brand" },
  { match: /vegano|vegetariano/i, label: "Vegano", tone: "fresh" },
  { match: /picante|apimentado/i, label: "Picante", tone: "hot" },
  { match: /premium|gourmet/i, label: "Premium", tone: "brand" },
  { match: /artesanal/i, label: "Artesanal", tone: "brand" },
  { match: /chef|escolha do chef/i, label: "Escolha do chef", tone: "accent" },
];

const FAST_PREP_MINUTES = 25;

export function getProductBadges(
  tags: string[],
  options?: {
    hasPromotion?: boolean;
    isFavorite?: boolean;
    prepTime?: number | null;
  },
): ProductBadge[] {
  const badges: ProductBadge[] = [];
  const used = new Set<string>();

  for (const tag of tags) {
    for (const rule of BADGE_RULES) {
      if (rule.match.test(tag) && !used.has(rule.label)) {
        badges.push({ label: rule.label, tone: rule.tone });
        used.add(rule.label);
        break;
      }
    }
  }

  if (options?.hasPromotion && !used.has("Promoção")) {
    badges.push({ label: "Promoção", tone: "sale" });
    used.add("Promoção");
  }

  if (options?.isFavorite && !used.has("Favorito")) {
    badges.push({ label: "Seu favorito", tone: "accent" });
    used.add("Favorito");
  }

  if (
    options?.prepTime != null &&
    options.prepTime > 0 &&
    options.prepTime <= FAST_PREP_MINUTES &&
    !used.has("Entrega rápida")
  ) {
    badges.push({ label: "Entrega rápida", tone: "brand" });
  }

  return badges.slice(0, 2);
}

export function getProductFeatureChips(tags: string[]): string[] {
  const badgePatterns = BADGE_RULES.map((rule) => rule.match);
  return tags.filter((tag) => !badgePatterns.some((pattern) => pattern.test(tag))).slice(0, 6);
}

const FEATURE_EMOJI: Record<string, string> = {
  molho: "🍅",
  queijo: "🧀",
  fresco: "🌿",
  forno: "🔥",
  picante: "🌶",
  recheado: "🧀",
  vegano: "🍃",
  artesanal: "✨",
};

export function getFeatureEmoji(label: string): string {
  const key = Object.keys(FEATURE_EMOJI).find((token) => label.toLowerCase().includes(token));
  return key ? FEATURE_EMOJI[key] : "✓";
}
