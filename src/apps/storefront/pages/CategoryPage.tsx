import { Layers } from "lucide-react";
import { Link, useParams } from "react-router";

import {
  CategoryNav,
  CategoryNavSkeleton,
  ProductList,
  ProductListSkeleton,
  useCategories,
  useProducts,
} from "@/features/catalog";
import { CatalogSearchSection } from "@/features/storefront/components/CatalogSearchSection";
import { formatCategoryLabel } from "@/features/catalog/utils/categoryLabel";
import { useCatalogSearch } from "@/features/storefront/hooks/useCatalogSearch";
import { EmptyState } from "@/shared/components/EmptyState";
import { BackLink, PageHeader } from "@/shared/components/visual";
import { storefrontCopy } from "@/shared/copy/storefront";

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { search, setSearch, debouncedSearch } = useCatalogSearch();
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const { data: productsPage, isLoading: loadingProducts, isError } = useProducts({
    category: slug,
    search: debouncedSearch || undefined,
    page_size: 24,
  });

  const category = categories?.find((c) => c.slug === slug);
  const products = productsPage?.results ?? [];
  const hasSearch = Boolean(debouncedSearch);
  const showEmpty = !loadingProducts && !isError && products.length === 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <BackLink to="/cardapio" label="Cardápio" />

      <PageHeader
        density="compact"
        mobileHidden
        icon={Layers}
        accent="chart-2"
        title={category ? formatCategoryLabel(category) : "Categoria"}
        subtitle={
          hasSearch && productsPage
            ? storefrontCopy.menu.searchResults(productsPage.count, debouncedSearch)
            : category?.description ??
              (productsPage
                ? storefrontCopy.menu.count(productsPage.count)
                : storefrontCopy.menu.categoryFallback)
        }
      />

      <CatalogSearchSection value={search} onChange={setSearch}>
        {loadingCategories ? (
          <CategoryNavSkeleton />
        ) : categories ? (
          <CategoryNav categories={categories} activeSlug={slug} />
        ) : null}
      </CatalogSearchSection>

      {loadingProducts ? (
        <ProductListSkeleton />
      ) : isError ? (
        <EmptyState title="Erro ao carregar produtos" accent="chart-2" />
      ) : showEmpty ? (
        <EmptyState
          icon={Layers}
          title={hasSearch ? storefrontCopy.menu.searchEmpty.title : storefrontCopy.menu.empty.title}
          description={
            hasSearch ? storefrontCopy.menu.searchEmpty.description : storefrontCopy.menu.empty.description
          }
          action={
            hasSearch ? (
              <Link
                to={`/cardapio?q=${encodeURIComponent(debouncedSearch)}`}
                className="text-sm font-semibold text-brand hover:underline"
              >
                Buscar no cardápio completo
              </Link>
            ) : undefined
          }
          accent="chart-3"
        />
      ) : (
        <ProductList products={products} />
      )}
    </div>
  );
}
