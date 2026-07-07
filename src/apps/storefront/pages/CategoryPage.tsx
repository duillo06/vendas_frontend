import { useParams } from "react-router";

import {
  CategoryNav,
  CategoryNavSkeleton,
  ProductList,
  ProductListSkeleton,
  useCategories,
  useProducts,
} from "@/features/catalog";
import { EmptyState } from "@/shared/components/EmptyState";

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const { data: productsPage, isLoading: loadingProducts, isError } = useProducts({
    category: slug,
    page_size: 24,
  });

  const category = categories?.find((c) => c.slug === slug);
  const products = productsPage?.results ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{category?.name ?? "Categoria"}</h1>
        {category?.description ? (
          <p className="text-[hsl(var(--muted-foreground))]">{category.description}</p>
        ) : null}
      </div>

      {loadingCategories ? (
        <CategoryNavSkeleton />
      ) : categories ? (
        <CategoryNav categories={categories} activeSlug={slug} />
      ) : null}

      {loadingProducts ? (
        <ProductListSkeleton />
      ) : isError ? (
        <EmptyState title="Erro ao carregar produtos" />
      ) : (
        <ProductList products={products} />
      )}
    </div>
  );
}
