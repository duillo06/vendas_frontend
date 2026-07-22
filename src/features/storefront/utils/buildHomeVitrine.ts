import type { Category, ProductListItem } from "@/features/catalog/types/catalog.types";
import type { PublicOffer } from "@/features/promotions";
import { productHasMatcher, TAG_MATCHERS } from "@/features/catalog/utils/productTags";

import {
  categoryPriorityScore,
  getDayPart,
  productMomentScore,
  type DayPart,
} from "./homeGreeting";

export type HighlightKind = "promos" | "bestsellers" | "favorites" | "novelties";

export type HomeHighlightBlock = {
  kind: HighlightKind;
  title: string;
  description?: string;
  products: ProductListItem[];
  offers: PublicOffer[];
};

export type SecondaryBlockKind = "launches" | "combos";

export type HomeSecondaryBlock = {
  kind: SecondaryBlockKind;
  title: string;
  description?: string;
  products: ProductListItem[];
};

export type HomeCategoryRail = {
  category: Category;
  products: ProductListItem[];
  coverUrl: string | null;
  totalAvailable: number;
};

export type HomeVitrine = {
  highlight: HomeHighlightBlock | null;
  /** lançamentos / combos / momento — depois do topo, antes dos trilhos */
  secondaryBlocks: HomeSecondaryBlock[];
  categoryChips: Category[];
  categoryRails: HomeCategoryRail[];
  dayPart: DayPart;
};

function byTag(products: ProductListItem[], re: RegExp) {
  return products.filter((p) => productHasMatcher(p.tags, re));
}

function claim(seen: Set<string>, items: ProductListItem[]): ProductListItem[] {
  const out: ProductListItem[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

function offerToProductStub(offer: PublicOffer, catalog: Map<string, ProductListItem>): ProductListItem | null {
  const fromCatalog = catalog.get(offer.product_id);
  if (fromCatalog) {
    return {
      ...fromCatalog,
      base_price: offer.promo_price,
      compare_price: offer.reference_price,
      promotion: {
        campaign_id: offer.campaign_id,
        promo_price: offer.promo_price,
        reference_price: offer.reference_price,
        save_amount: offer.save_amount,
        discount_percent: offer.discount_percent,
        badges: offer.badges,
      },
    };
  }
  if (!offer.product_id) return null;
  return {
    id: offer.product_id,
    name: offer.product_name,
    slug: offer.product_slug,
    description: null,
    base_price: offer.promo_price,
    compare_price: offer.reference_price,
    image_url: offer.image_url,
    category: { id: "", name: "", slug: "" },
    is_available: offer.is_available,
    tags: [],
    has_options: true,
    promotion: {
      campaign_id: offer.campaign_id,
      promo_price: offer.promo_price,
      reference_price: offer.reference_price,
      save_amount: offer.save_amount,
      discount_percent: offer.discount_percent,
      badges: offer.badges,
    },
  };
}

/** Motor Inteligente de Vitrine — prioridade + dedupe + horário + preferência + lançamento/combo */
export function buildHomeVitrine(input: {
  products: ProductListItem[];
  categories: Category[];
  offers?: PublicOffer[];
  now?: Date;
  preferredCategoryIds?: string[];
}): HomeVitrine {
  const now = input.now ?? new Date();
  const dayPart = getDayPart(now);
  const available = input.products.filter((p) => p.is_available);
  const byId = new Map(available.map((p) => [p.id, p]));
  const seen = new Set<string>();
  const offers = [...(input.offers ?? [])]
    .filter((o) => o.is_available !== false)
    .sort((a, b) => (b.weight ?? 10) - (a.weight ?? 10) || a.promo_price - b.promo_price);

  let highlight: HomeHighlightBlock | null = null;

  if (offers.length > 0) {
    const promoProducts: ProductListItem[] = [];
    const usedOffers: PublicOffer[] = [];
    for (const offer of offers) {
      if (seen.has(offer.product_id)) continue;
      const stub = offerToProductStub(offer, byId);
      if (!stub) continue;
      seen.add(offer.product_id);
      promoProducts.push(stub);
      usedOffers.push(offer);
    }
    if (usedOffers.length) {
      highlight = {
        kind: "promos",
        title: "Promoções",
        description: "Ofertas pra aproveitar agora.",
        products: promoProducts,
        offers: usedOffers,
      };
    }
  }

  if (!highlight) {
    const bestsellers = byTag(available, TAG_MATCHERS.bestsellers);
    const claimed = claim(seen, bestsellers);
    if (claimed.length) {
      highlight = {
        kind: "bestsellers",
        title: "Mais pedidos",
        description: "O que a galera mais pede por aqui.",
        products: claimed,
        offers: [],
      };
    }
  }

  if (!highlight) {
    const favorites = byTag(available, TAG_MATCHERS.favorites);
    const claimed = claim(seen, favorites);
    if (claimed.length) {
      highlight = {
        kind: "favorites",
        title: "Favoritos da casa",
        description: "Os queridinhos da cozinha.",
        products: claimed,
        offers: [],
      };
    }
  }

  if (!highlight) {
    const novelties = byTag(available, TAG_MATCHERS.launches);
    const claimed = claim(seen, novelties);
    if (claimed.length) {
      highlight = {
        kind: "novelties",
        title: "Novidades",
        description: "Acabaram de chegar.",
        products: claimed,
        offers: [],
      };
    }
  }

  if (!highlight && available.length) {
    // fallback: melhores do momento
    const momentSorted = [...available].sort(
      (a, b) => productMomentScore(b, dayPart, now) - productMomentScore(a, dayPart, now),
    );
    const claimed = claim(seen, momentSorted.slice(0, 12));
    if (claimed.length) {
      highlight = {
        kind: "bestsellers",
        title: "Pra começar",
        description: "Escolhas que valem o pedido.",
        products: claimed,
        offers: [],
      };
    }
  }

  const secondaryBlocks: HomeSecondaryBlock[] = [];

  // lançamentos (se o topo não foi novidades)
  if (highlight?.kind !== "novelties") {
    const launches = claim(seen, byTag(available, TAG_MATCHERS.launches));
    if (launches.length) {
      secondaryBlocks.push({
        kind: "launches",
        title: "Lançamentos",
        description: "Acabaram de chegar no cardápio.",
        products: launches,
      });
    }
  }

  const combos = claim(seen, byTag(available, TAG_MATCHERS.combos));
  if (combos.length) {
    secondaryBlocks.push({
      kind: "combos",
      title: "Combos",
      description: "Monte o pedido completo com menos decisão.",
      products: combos,
    });
  }

  // horário rico: ordena trilhos/produtos (não rouba o cardápio pra um 3º carrossel)

  const preferred = new Set(input.preferredCategoryIds ?? []);
  const catsWithStock = input.categories.filter((c) =>
    available.some((p) => p.category?.id === c.id || p.category?.slug === c.slug),
  );

  const sortedCats = [...catsWithStock].sort((a, b) => {
    const prefA = preferred.has(a.id) ? 1 : 0;
    const prefB = preferred.has(b.id) ? 1 : 0;
    if (prefB !== prefA) return prefB - prefA;
    return (
      categoryPriorityScore(b.name, dayPart, now) - categoryPriorityScore(a.name, dayPart, now) ||
      a.sort_order - b.sort_order
    );
  });

  const categoryRails: HomeCategoryRail[] = [];
  for (const category of sortedCats) {
    const inCat = available.filter(
      (p) => p.category?.id === category.id || p.category?.slug === category.slug,
    );
    const totalAvailable = inCat.length;
    // dentro da categoria, prioriza o momento
    const ordered = [...inCat].sort(
      (a, b) => productMomentScore(b, dayPart, now) - productMomentScore(a, dayPart, now),
    );
    const products = claim(seen, ordered);
    if (!products.length) continue;
    const coverUrl =
      category.image_url ?? products.find((p) => p.image_url)?.image_url ?? null;
    categoryRails.push({ category, products, coverUrl, totalAvailable });
  }

  return {
    highlight,
    secondaryBlocks,
    categoryChips: sortedCats,
    categoryRails,
    dayPart,
  };
}
