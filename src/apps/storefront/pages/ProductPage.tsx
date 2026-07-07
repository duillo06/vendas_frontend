import { useParams, Link } from "react-router";

import { ProductDetailSkeleton, ProductDetailView, useProduct } from "@/features/catalog";
import { EmptyState } from "@/shared/components/EmptyState";
import { Button } from "@/shared/components/ui/button";

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, isError } = useProduct(slug);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (isError || !product) {
    return (
      <EmptyState
        title="Produto não encontrado"
        description="Esse item pode ter sido removido do cardápio."
        action={
          <Link to="/cardapio">
            <Button variant="outline">Voltar ao cardápio</Button>
          </Link>
        }
      />
    );
  }

  return <ProductDetailView product={product} />;
}
