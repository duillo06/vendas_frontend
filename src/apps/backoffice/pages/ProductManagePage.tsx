import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { catalogAdminApi } from "@/features/catalog/api/catalogAdminApi";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import {
  IntentFlowHost,
  ProductHistoryCard,
  ProductInsightCards,
  ProductIntentBar,
  ProductManageHeader,
  ProductQuickActions,
  type ProductIntentId,
} from "@/features/product-manage";
import { BackLink } from "@/shared/components/visual";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function ProductManagePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeIntent, setActiveIntent] = useState<ProductIntentId | null>(null);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: catalogAdminKeys.product(id ?? ""),
    queryFn: () => catalogAdminApi.getProduct(id!),
    enabled: Boolean(id),
  });

  const openIntent = (intentId: ProductIntentId) => {
    if (intentId === "advanced") {
      navigate(`/produtos/${id}/avancado`);
      return;
    }
    if (intentId === "promo") {
      toast.message("Promoção chega em breve", {
        description: "O atalho já está no lugar — quando liberar, não muda a tela.",
      });
      return;
    }
    setActiveIntent(intentId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="space-y-4 py-12 text-center">
        <Package className="mx-auto h-10 w-10 text-[hsl(var(--muted-foreground))]" />
        <h1 className="text-xl font-semibold">Produto não encontrado</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Ele pode ter sido excluído ou o link está inválido.
        </p>
        <Button type="button" onClick={() => navigate("/produtos")}>
          Voltar aos produtos
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <BackLink to="/produtos" label="Produtos" />

      <ProductManageHeader product={product} />

      <ProductIntentBar product={product} onSelect={openIntent} />

      <ProductInsightCards product={product} />

      <ProductQuickActions product={product} onSelect={openIntent} />

      <ProductHistoryCard product={product} />

      <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
        Prefere a tela antiga de uma vez?{" "}
        <Link to={`/produtos/${product.id}/avancado`} className="font-medium text-brand underline">
          Abrir editor completo
        </Link>
      </p>

      {activeIntent ? (
        <IntentFlowHost
          product={product}
          intent={activeIntent}
          onClose={() => setActiveIntent(null)}
        />
      ) : null}
    </div>
  );
}
