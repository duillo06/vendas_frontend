import type { Category, ProductListItem } from "@/features/catalog/types/catalog.types";
import type { LucideIcon } from "lucide-react";
import { Flame, Heart, Percent, Sparkles, Star, Tag } from "lucide-react";

import { categoryPriorityScore, getDayPart, type DayPart } from "./homeGreeting";

export type HomeProductSection = {
  id: string;
  title: string;
  description?: string;
  icon: LucideIcon;
  accent: "chart-1" | "chart-2" | "chart-3" | "chart-4" | "primary";
  products: ProductListItem[];
};

function byTag(products: ProductListItem[], re: RegExp) {
  return products.filter((p) => p.tags.some((t) => re.test(t)));
}

function take(products: ProductListItem[], n = 8) {
  return products.slice(0, n);
}

/** seções só aparecem se tiverem produto — horário só reordena categorias */
export function buildHomeSections(
  products: ProductListItem[],
  categories: Category[],
  now = new Date(),
): HomeProductSection[] {
  const available = products.filter((p) => p.is_available);
  const dayPart = getDayPart(now);
  const sections: HomeProductSection[] = [];

  const push = (section: HomeProductSection) => {
    if (section.products.length) sections.push(section);
  };

  const featuredTagged = byTag(available, /mais vendido|destaque|popular/i);
  push({
    id: "featured",
    title: "Favoritos da galera",
    description: "Os mais pedidos por aqui.",
    icon: Star,
    accent: "chart-4",
    products: take(featuredTagged.length ? featuredTagged : available),
  });

  push({
    id: "promos",
    title: "Promoções",
    description: "Preço especial pra aproveitar agora.",
    icon: Percent,
    accent: "chart-3",
    products: take(
      available.filter(
        (p) => p.compare_price != null && Number(p.compare_price) > Number(p.base_price),
      ),
    ),
  });

  push({
    id: "new",
    title: "Novidades",
    description: "Acabaram de chegar no cardápio.",
    icon: Sparkles,
    accent: "chart-2",
    products: take(byTag(available, /^novo$|novidade/i)),
  });

  push({
    id: "house",
    title: "Favoritos da casa",
    description: "Os queridinhos da nossa cozinha.",
    icon: Heart,
    accent: "chart-1",
    products: take(byTag(available, /favorito/i)),
  });

  const sortedCats = [...categories].sort(
    (a, b) =>
      categoryPriorityScore(b.name, dayPart) - categoryPriorityScore(a.name, dayPart) ||
      a.sort_order - b.sort_order,
  );

  for (const category of sortedCats) {
    const inCat = available.filter(
      (p) => p.category?.id === category.id || p.category?.slug === category.slug,
    );
    push({
      id: `cat-${category.id}`,
      title: category.emoji ? `${category.emoji} ${category.name}` : category.name,
      description: category.description ?? undefined,
      icon: Tag,
      accent: "primary",
      products: take(inCat, 6),
    });
  }

  // se só caiu nos destaques genéricos e não há categorias, ok
  if (!sections.length) {
    push({
      id: "more",
      title: "Para você explorar",
      description: "Mais opções do cardápio.",
      icon: Flame,
      accent: "chart-2",
      products: take(available, 12),
    });
  }

  return sections;
}

export function searchPlaceholders(categoryNames: string[]): string[] {
  const fromCats = categoryNames
    .map((n) => n.trim())
    .filter(Boolean)
    .slice(0, 6)
    .map((n) => `Buscar ${n.toLowerCase()}...`);

  const fallback = [
    "Buscar pizza...",
    "Buscar hambúrguer...",
    "Buscar bebidas...",
    "Buscar sobremesas...",
    "Buscar o que está com vontade...",
  ];

  return fromCats.length >= 2 ? fromCats : fallback;
}

export function contextualHint(dayPart: DayPart): string | null {
  switch (dayPart) {
    case "morning":
      return "Sugestão da manhã: explore cafés e bebidas.";
    case "lunch":
      return "Sugestão do almoço: pratos e lanches rápidos.";
    case "afternoon":
      return "Sugestão da tarde: sobremesas e algo pra acompanhar.";
    case "evening":
      return "Sugestão da noite: pizzas e clássicos pra compartilhar.";
    default:
      return null;
  }
}
