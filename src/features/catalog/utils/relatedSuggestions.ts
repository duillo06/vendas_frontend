import type { ProductListItem } from "@/features/catalog/types/catalog.types";

/** regras de complemento por tipo de prato — sobe o ticket médio */
const COMPLEMENT_RULES: Array<{
  when: RegExp;
  boost: RegExp;
  emoji: string;
}> = [
  {
    when: /hamb[uú]rguer|burger|lanche|x-|xis|hot.?dog/i,
    boost: /batata|fritas|refrigerante|suco|milkshake|shake|coca|guaran[aá]|onion|anel/i,
    emoji: "🍟",
  },
  {
    when: /pizza|calzone/i,
    boost: /refrigerante|suco|sobremesa|doce|borda|coca|guaran[aá]|brownie|pudim/i,
    emoji: "🥤",
  },
  {
    when: /pastel|coxinha|esfiha|empada/i,
    boost: /caldo.?de.?cana|refrigerante|suco|doce|guaran[aá]|coca|sobremesa/i,
    emoji: "🧃",
  },
  {
    when: /a[cç]a[ií]|sorvete|milkshake|shake/i,
    boost: /granola|leite.?condensado|pa[cç]oca|brownie|cookie/i,
    emoji: "🍨",
  },
];

function haystack(product: ProductListItem): string {
  return `${product.name} ${product.category.name} ${product.tags.join(" ")}`;
}

function isNearDuplicate(a: string, b: string): boolean {
  const na = a.toLowerCase().trim();
  const nb = b.toLowerCase().trim();
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  return false;
}

export type RelatedSectionCopy = {
  emoji: string;
  title: string;
};

/** título de venda — configurável depois via settings */
export function resolveRelatedSectionCopy(
  productName: string,
  categoryName?: string,
): RelatedSectionCopy {
  const text = `${productName} ${categoryName ?? ""}`;
  const rule = COMPLEMENT_RULES.find((entry) => entry.when.test(text));
  if (rule) {
    return { emoji: rule.emoji, title: "Complete seu pedido" };
  }
  return { emoji: "✨", title: "Combina com este produto" };
}

export const RELATED_SECTION_TITLE_OPTIONS = [
  "Complete seu pedido",
  "Combina com este produto",
  "Clientes também levam",
  "Aproveite e adicione",
] as const;

/**
 * prioriza complementos (bebida, acompanhamento…) em vez de itens iguais.
 * mesma categoria só entra se não houver complemento suficiente.
 */
export function pickComplementaryProducts(
  current: { id: string; name: string; categorySlug?: string; categoryName?: string },
  catalog: ProductListItem[],
  limit = 8,
): ProductListItem[] {
  const pool = catalog.filter(
    (item) =>
      item.id !== current.id &&
      item.is_available &&
      !isNearDuplicate(item.name, current.name),
  );

  const context = `${current.name} ${current.categoryName ?? ""}`;
  const matchingRules = COMPLEMENT_RULES.filter((rule) => rule.when.test(context));

  const scored = pool.map((item) => {
    const text = haystack(item);
    let score = 0;

    for (const rule of matchingRules) {
      if (rule.boost.test(text)) score += 40;
    }

    // complemento genérico sempre útil
    if (/refrigerante|suco|água|agua|coca|guaran[aá]|bebida|cerveja/i.test(text)) score += 18;
    if (/batata|fritas|acompanhamento|onion/i.test(text)) score += 16;
    if (/sobremesa|doce|brownie|pudim|sorvete|milkshake/i.test(text)) score += 14;

    const sameCategory =
      current.categorySlug && item.category.slug === current.categorySlug;
    if (sameCategory) score -= 12;
    else score += 8;

    if (item.has_options) score -= 4;

    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name));

  const complements = scored.filter((entry) => entry.score > 0).map((entry) => entry.item);
  if (complements.length >= Math.min(3, limit)) {
    return complements.slice(0, limit);
  }

  // fallback: outros da mesma categoria, depois qualquer disponível
  const sameCat = pool.filter((item) => item.category.slug === current.categorySlug);
  const rest = pool.filter((item) => item.category.slug !== current.categorySlug);
  const merged = [...complements];
  for (const item of [...rest, ...sameCat]) {
    if (merged.length >= limit) break;
    if (!merged.some((m) => m.id === item.id)) merged.push(item);
  }
  return merged.slice(0, limit);
}
