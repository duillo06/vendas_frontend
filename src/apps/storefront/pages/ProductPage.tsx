import { useMemo } from "react";
import { useParams, Link } from "react-router";

import { useAddToCart } from "@/features/cart";
import { ProductDetailSkeleton, ProductDetailView, useProduct, useProducts } from "@/features/catalog";
import { pickComplementaryProducts } from "@/features/catalog/utils/relatedSuggestions";
import { useRecordCategoryVisit } from "@/features/storefront/hooks/useCategoryAffinity";
import { EmptyState } from "@/shared/components/EmptyState";
import { BackLink } from "@/shared/components/visual";
import { Button } from "@/shared/components/ui/button";

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, isError } = useProduct(slug);
  const { data: catalogPage } = useProducts({ page_size: 48 });
  const addToCart = useAddToCart();

  const listItem = catalogPage?.results.find((item) => item.slug === product?.slug);
  useRecordCategoryVisit(listItem?.category?.id);

  const relatedProducts = useMemo(() => {
    if (!product || !catalogPage?.results) return [];

    const currentInList = catalogPage.results.find((item) => item.slug === product.slug);

    return pickComplementaryProducts(
      {
        id: product.id,
        name: product.name,
        categorySlug: currentInList?.category.slug,
        categoryName: currentInList?.category.name,
      },
      catalogPage.results,
      8,
    );
  }, [product, catalogPage]);

  const categoryName = useMemo(() => {
    if (!product || !catalogPage?.results) return undefined;
    return catalogPage.results.find((item) => item.slug === product.slug)?.category.name;
  }, [product, catalogPage]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <BackLink to="/cardapio" label="Cardápio" />
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="space-y-4">
        <BackLink to="/cardapio" label="Cardápio" />
        <EmptyState
          title="Produto não encontrado"
          description="Esse item pode ter sido removido do cardápio."
          action={
            <Link to="/cardapio">
              <Button variant="outline">Voltar ao cardápio</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BackLink to="/cardapio" label="Cardápio" />
      <ProductDetailView
        product={product}
        relatedProducts={relatedProducts}
        categoryName={categoryName}
        onAddToCart={addToCart}
      />
    </div>
  );
}
