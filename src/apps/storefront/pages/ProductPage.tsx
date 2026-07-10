import { useMemo } from "react";
import { useParams, Link } from "react-router";

import { useAddToCart } from "@/features/cart";
import { ProductDetailSkeleton, ProductDetailView, useProduct, useProducts } from "@/features/catalog";
import { EmptyState } from "@/shared/components/EmptyState";
import { BackLink } from "@/shared/components/visual";
import { Button } from "@/shared/components/ui/button";

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, isError } = useProduct(slug);
  const { data: catalogPage } = useProducts({ page_size: 48 });
  const addToCart = useAddToCart();

  const relatedProducts = useMemo(() => {
    if (!product || !catalogPage?.results) {
      return [];
    }

    const currentInList = catalogPage.results.find((item) => item.slug === product.slug);
    if (!currentInList) {
      return catalogPage.results.filter((item) => item.id !== product.id).slice(0, 3);
    }

    return catalogPage.results
      .filter(
        (item) => item.id !== product.id && item.category.slug === currentInList.category.slug,
      )
      .slice(0, 3);
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
      onAddToCart={addToCart}
    />
    </div>
  );
}
