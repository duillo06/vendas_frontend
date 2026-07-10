import { UtensilsCrossed } from "lucide-react";

import {
  CategoryNav,
  CategoryNavSkeleton,
  ProductList,
  ProductListSkeleton,
  useCategories,
  useProducts,
} from "@/features/catalog";
import { CatalogSearchSection } from "@/features/storefront/components/CatalogSearchSection";
import { useCatalogSearch } from "@/features/storefront/hooks/useCatalogSearch";
import { EmptyState } from "@/shared/components/EmptyState";
import { BackLink, PageHeader } from "@/shared/components/visual";
import { storefrontCopy } from "@/shared/copy/storefront";

export function MenuPage() {
  const { search, setSearch, debouncedSearch } = useCatalogSearch();

  const { data: categories, isLoading: loadingCategories } = useCategories();
  const { data: productsPage, isLoading: loadingProducts, isError } = useProducts({
    search: debouncedSearch || undefined,
    page_size: 24,
  });

  const products = productsPage?.results ?? [];
  const hasSearch = Boolean(debouncedSearch);
  const showEmpty = !loadingProducts && !isError && products.length === 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <BackLink to="/" label="Início" />

      <PageHeader
        variant="hero"
        density="compact"
        mobileHidden
        accent="chart-1"
        icon={UtensilsCrossed}
        title="Cardápio"
        subtitle={
          hasSearch && productsPage
            ? storefrontCopy.menu.searchResults(productsPage.count, debouncedSearch)
            : productsPage
              ? storefrontCopy.menu.count(productsPage.count)
              : storefrontCopy.menu.subtitle
        }
      />

      <CatalogSearchSection value={search} onChange={setSearch}>
        {loadingCategories ? <CategoryNavSkeleton /> : categories ? <CategoryNav categories={categories} /> : null}
      </CatalogSearchSection>

      {loadingProducts ? (
        <ProductListSkeleton />
      ) : isError ? (
        <EmptyState title="Erro ao carregar cardápio" accent="chart-1" />
      ) : showEmpty ? (
        <EmptyState
          icon={UtensilsCrossed}
          title={hasSearch ? storefrontCopy.menu.searchEmpty.title : storefrontCopy.menu.empty.title}
          description={
            hasSearch ? storefrontCopy.menu.searchEmpty.description : storefrontCopy.menu.empty.description
          }
          accent="chart-2"
        />
      ) : (
        <ProductList products={products} />
      )}
    </div>
  );
}
