import { UtensilsCrossed } from "lucide-react";

import {
  CategoryNav,
  CategoryNavSkeleton,
  CategoryProductFeed,
  ProductListRowSkeleton,
  useCategories,
  useProducts,
} from "@/features/catalog";
import { useCompanyPublic } from "@/features/company";
import { CatalogSearchSection } from "@/features/storefront/components/CatalogSearchSection";
import { StoreHero } from "@/features/storefront/components/StoreHero";
import { useCatalogSearch } from "@/features/storefront/hooks/useCatalogSearch";
import { EmptyState } from "@/shared/components/EmptyState";
import { storefrontCopy } from "@/shared/copy/storefront";

export function MenuPage() {
  const { search, setSearch, debouncedSearch } = useCatalogSearch();
  const { data: company, isLoading: loadingCompany } = useCompanyPublic();

  const { data: categories, isLoading: loadingCategories } = useCategories();
  const { data: productsPage, isLoading: loadingProducts, isError } = useProducts({
    search: debouncedSearch || undefined,
    page_size: 48,
  });

  const products = productsPage?.results ?? [];
  const hasSearch = Boolean(debouncedSearch);
  const showEmpty = !loadingProducts && !isError && products.length === 0;

  return (
    // banner → busca → categorias → produtos — sem atalho rivalizando
    <div className="-mt-4 space-y-3 pb-2 sm:-mt-6 sm:space-y-4">
      <StoreHero company={company} isLoading={loadingCompany} compact />

      <CatalogSearchSection value={search} onChange={setSearch} className="space-y-2.5">
        {loadingCategories ? <CategoryNavSkeleton /> : categories ? <CategoryNav categories={categories} /> : null}
      </CatalogSearchSection>

      {hasSearch && productsPage ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {storefrontCopy.menu.searchResults(productsPage.count, debouncedSearch)}
        </p>
      ) : null}

      {loadingProducts ? (
        <ProductListRowSkeleton />
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
        <CategoryProductFeed products={products} searchActive={hasSearch} />
      )}
    </div>
  );
}
