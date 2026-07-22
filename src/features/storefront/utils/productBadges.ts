import {
  PRODUCT_TAG_PRESETS,
  productHasMatcher,
  TAG_MATCHERS,
} from "@/features/catalog/utils/productTags";

export type ProductBadgeTone = "brand" | "accent" | "hot" | "fresh" | "sale" | "neutral";

export type ProductBadge = {
  label: string;
  tone: ProductBadgeTone;
};

const EXTRA_BADGE_RULES: Array<{ match: RegExp; label: string; tone: ProductBadgeTone }> = [
  { match: /promo/i, label: "Promoção", tone: "sale" },
  { match: /frete.?gr[aá]tis|entrega.?gr[aá]tis/i, label: "Frete grátis", tone: "brand" },
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

  for (const preset of PRODUCT_TAG_PRESETS) {
    if (!preset.badge) continue;
    if (!productHasMatcher(tags, preset.match)) continue;
    if (used.has(preset.badge.label)) continue;
    badges.push({ label: preset.badge.label, tone: preset.badge.tone });
    used.add(preset.badge.label);
  }

  for (const tag of tags) {
    for (const rule of EXTRA_BADGE_RULES) {
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

  if (options?.isFavorite && !used.has("Favorito") && !used.has("Seu favorito")) {
    badges.push({ label: "Seu favorito", tone: "accent" });
    used.add("Seu favorito");
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
  const known = [
    ...PRODUCT_TAG_PRESETS.map((p) => p.match),
    ...EXTRA_BADGE_RULES.map((r) => r.match),
  ];
  return tags.filter((tag) => !known.some((pattern) => pattern.test(tag))).slice(0, 6);
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

export function isPopularProduct(tags: string[]): boolean {
  return productHasMatcher(tags, TAG_MATCHERS.bestsellers);
}
