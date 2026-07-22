import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { UtensilsCrossed } from "lucide-react";

import {
  CategoryNav,
  CategoryNavSkeleton,
  ProductRail,
  useCategories,
  useProducts,
} from "@/features/catalog";
import { useFavorites } from "@/features/favorites";
import { CategoryProductRail } from "@/features/storefront/components/CategoryProductRail";
import { HomeMessageTicker } from "@/features/storefront/components/HomeMessageTicker";
import { StoreHero } from "@/features/storefront/components/StoreHero";
import { useCategoryAffinity } from "@/features/storefront/hooks/useCategoryAffinity";
import { buildHomeVitrine } from "@/features/storefront/utils/buildHomeVitrine";
import { HomeOffersCarousel } from "@/features/promotions/components/HomeOffersCarousel";
import { promotionsPublicApi } from "@/features/promotions";
import { useCompanyPublic } from "@/features/company";
import { EmptyState } from "@/shared/components/EmptyState";
import { storefrontCopy } from "@/shared/copy/storefront";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function HomePage() {
  const { data: company, isLoading: loadingCompany } = useCompanyPublic();
  const { data: categories, isLoading: loadingCategories, isError: categoriesError } = useCategories();
  const { data: productsPage, isLoading: loadingProducts, isError: productsError } = useProducts({
    page_size: 48,
  });
  const { data: offers = [], isLoading: loadingOffers } = useQuery({
    queryKey: ["public", "promotion-offers"],
    queryFn: () => promotionsPublicApi.offers(),
  });
  const { preferredCategoryIds } = useCategoryAffinity();
  const { favorites } = useFavorites();

  const products = productsPage?.results ?? [];
  const categoryList = categories ?? [];

  // preferência: afinidade local + categorias dos favoritos salvos
  const preferredIds = useMemo(() => {
    const fromFavorites = products
      .filter((p) => favorites.includes(p.id) && p.category?.id)
      .map((p) => p.category.id);
    const merged = [...preferredCategoryIds, ...fromFavorites];
    return [...new Set(merged)];
  }, [preferredCategoryIds, favorites, products]);

  const vitrine = useMemo(
    () =>
      buildHomeVitrine({
        products,
        categories: categoryList,
        offers,
        preferredCategoryIds: preferredIds,
      }),
    [products, categoryList, offers, preferredIds],
  );

  const loadingFeed = loadingProducts || loadingOffers;

  return (
    <div className="space-y-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:space-y-6">
      <StoreHero company={company} isLoading={loadingCompany} />

      <HomeMessageTicker company={company} products={products} />

      {loadingFeed ? (
        <section className="space-y-2.5 py-2">
          <Skeleton className="h-4 w-28" />
          <div className="-mx-1 flex gap-3 overflow-hidden px-1">
            <Skeleton className="aspect-square w-[132px] shrink-0 rounded-2xl" />
            <Skeleton className="aspect-square w-[132px] shrink-0 rounded-2xl" />
            <Skeleton className="aspect-square w-[132px] shrink-0 rounded-2xl" />
          </div>
        </section>
      ) : vitrine.highlight?.kind === "promos" ? (
        <HomeOffersCarousel offers={vitrine.highlight.offers} />
      ) : vitrine.highlight ? (
        <ProductRail
          title={vitrine.highlight.title}
          subtitle={vitrine.highlight.description}
          products={vitrine.highlight.products}
        />
      ) : null}

      {/* lançamentos + combos — mesmo motor, após o topo */}
      {!loadingFeed
        ? vitrine.secondaryBlocks.map((block) => (
            <ProductRail
              key={block.kind}
              title={block.title}
              subtitle={block.description}
              products={block.products}
            />
          ))
        : null}

      {loadingCategories ? (
        <CategoryNavSkeleton />
      ) : categoriesError ? (
        <EmptyState
          title="Não foi possível carregar categorias"
          description="Verifique se o backend está rodando e o tenant demo está ativo."
          accent="chart-2"
        />
      ) : vitrine.categoryChips.length > 0 ? (
        <CategoryNav categories={vitrine.categoryChips} showAllOption={false} />
      ) : null}

      {loadingProducts ? (
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-5 w-40" />
              </div>
              <div className="flex gap-3 overflow-hidden">
                <Skeleton className="h-36 w-[132px] shrink-0 rounded-2xl" />
                <Skeleton className="h-36 w-[132px] shrink-0 rounded-2xl" />
                <Skeleton className="h-36 w-[132px] shrink-0 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      ) : productsError ? (
        <EmptyState title="Erro ao carregar produtos" accent="chart-4" />
      ) : vitrine.categoryRails.length === 0 && !vitrine.highlight ? (
        <EmptyState
          icon={UtensilsCrossed}
          title={storefrontCopy.menu.empty.title}
          description={storefrontCopy.menu.empty.description}
          accent="chart-4"
        />
      ) : (
        <div className="space-y-7 sm:space-y-8">
          {vitrine.categoryRails.map((rail) => (
            <CategoryProductRail key={rail.category.id} rail={rail} />
          ))}
        </div>
      )}
    </div>
  );
}
