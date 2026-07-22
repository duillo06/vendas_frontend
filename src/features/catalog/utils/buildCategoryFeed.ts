import type { ProductListItem } from "@/features/catalog/types/catalog.types";
import { productHasMatcher, TAG_MATCHERS } from "@/features/catalog/utils/productTags";

export type CategoryFeedBlock =
  | { type: "rail"; id: string; title: string; subtitle?: string; products: ProductListItem[] }
  | { type: "rows"; id: string; products: ProductListItem[] }
  | { type: "spotlight"; id: string; product: ProductListItem; label: string };

function isPromo(p: ProductListItem) {
  return p.compare_price != null && Number(p.compare_price) > Number(p.base_price);
}

function byTag(products: ProductListItem[], re: RegExp) {
  return products.filter((p) => productHasMatcher(p.tags, re));
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

/** feed intercalado pra categoria — sem repetir itens entre rails e lista */
export function buildCategoryFeed(
  products: ProductListItem[],
  options?: { searchActive?: boolean },
): CategoryFeedBlock[] {
  const available = products.filter((p) => p.is_available);
  if (!available.length) return [];

  // busca: lista limpa, sem vitrines
  if (options?.searchActive) {
    return [{ type: "rows", id: "search", products: available }];
  }

  const used = new Set<string>();
  const claim = (list: ProductListItem[], max = 5) => {
    const next = list.filter((p) => !used.has(p.id)).slice(0, max);
    next.forEach((p) => used.add(p.id));
    return next;
  };

  const best = claim(byTag(available, TAG_MATCHERS.bestsellers), 5);
  const promos = claim(available.filter(isPromo), 5);
  const news = claim(byTag(available, TAG_MATCHERS.launches), 5);
  const chef = claim(byTag(available, /chef|escolha do chef/i), 1);

  const rest = available.filter((p) => !used.has(p.id));
  const blocks: CategoryFeedBlock[] = [];

  if (best.length) {
    blocks.push({
      type: "rail",
      id: "rail-best",
      title: "Mais pedidas",
      subtitle: "As queridinhas desta categoria",
      products: best,
    });
  }

  const segments = chunk(rest, 5);
  if (!segments.length && chef.length) {
    blocks.push({ type: "spotlight", id: `spot-${chef[0].id}`, product: chef[0], label: "Escolha do chef" });
  }

  segments.forEach((segment, index) => {
    // spotlight do chef no meio do ritmo (só uma vez)
    if (index === 1 && chef.length) {
      blocks.push({
        type: "spotlight",
        id: `spot-${chef[0].id}`,
        product: chef[0],
        label: "Escolha do chef",
      });
    }

    blocks.push({ type: "rows", id: `rows-${index}`, products: segment });

    if (index === 0 && promos.length) {
      blocks.push({
        type: "rail",
        id: "rail-promo",
        title: "Promoções da semana",
        subtitle: "Preço especial pra aproveitar",
        products: promos,
      });
    }

    if (index === 1 && news.length) {
      blocks.push({
        type: "rail",
        id: "rail-new",
        title: "Novidades",
        subtitle: "Acabaram de chegar",
        products: news,
      });
    }
  });

  // se a lista era curta e rails de promo/news não entraram
  if (segments.length <= 1 && news.length && !blocks.some((b) => b.id === "rail-new")) {
    blocks.push({
      type: "rail",
      id: "rail-new",
      title: "Novidades",
      products: news,
    });
  }
  if (!segments.length && promos.length && !blocks.some((b) => b.id === "rail-promo")) {
    blocks.push({
      type: "rail",
      id: "rail-promo",
      title: "Promoções da semana",
      products: promos,
    });
  }

  // sobrou chef e nunca encaixou
  if (chef.length && !blocks.some((b) => b.type === "spotlight")) {
    blocks.push({
      type: "spotlight",
      id: `spot-${chef[0].id}`,
      product: chef[0],
      label: "Escolha do chef",
    });
  }

  return blocks.filter((b) => (b.type === "rows" ? b.products.length > 0 : true));
}
