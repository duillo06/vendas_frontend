export type ProductBadgeTone = "brand" | "accent" | "hot" | "fresh" | "sale" | "neutral";

export type ProductBadge = {
  label: string;
  tone: ProductBadgeTone;
};

const BADGE_RULES: Array<{ match: RegExp; label: string; tone: ProductBadgeTone }> = [
  { match: /mais vendido|destaque|popular|favorito/i, label: "Mais vendido", tone: "hot" },
  { match: /^novo$/i, label: "Novo", tone: "fresh" },
  { match: /promo/i, label: "Promoção", tone: "sale" },
  { match: /vegano/i, label: "Vegano", tone: "fresh" },
  { match: /artesanal/i, label: "Artesanal", tone: "brand" },
];

export function getProductBadges(
  tags: string[],
  options?: { hasPromotion?: boolean },
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
