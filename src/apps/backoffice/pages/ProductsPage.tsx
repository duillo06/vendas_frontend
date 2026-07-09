import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Lightbulb, Package, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { catalogAdminApi } from "@/features/catalog/api/catalogAdminApi";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { UiHint } from "@/shared/components/UiHint";
import { PageHeader } from "@/shared/components/visual";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { adminCopy } from "@/shared/copy/admin";
import { cn } from "@/shared/lib/utils";

export function ProductsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: catalogAdminKeys.products(),
    queryFn: () => catalogAdminApi.listProducts(),
  });

  const toggleAvailable = useMutation({
    mutationFn: ({ id, is_available }: { id: string; is_available: boolean }) =>
      catalogAdminApi.updateProduct(id, { is_available }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.products() });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtos"
        subtitle={adminCopy.products.subtitle}
        icon={Package}
        accent="chart-2"
        action={
          <Button type="button" className="w-full gap-2 sm:w-auto" onClick={() => navigate("/produtos/novo")}>
            <Plus className="h-4 w-4" />
            Novo produto
          </Button>
        }
      />

      <UiHint icon={Lightbulb} tone="neutral">
        {adminCopy.products.tip}
      </UiHint>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : data?.results.length ? (
        <ul className="space-y-3">
          {data.results.map((product) => (
            <li key={product.id}>
              <Card className="interactive-card">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt=""
                        className="h-14 w-14 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-md bg-[hsl(var(--muted))] text-xs">
                        Sem foto
                      </div>
                    )}
                    <div>
                      <Link to={`/produtos/${product.id}`} className="font-semibold hover:underline">
                        {product.name}
                      </Link>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {product.category.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <PriceDisplay value={product.base_price} />
                    <button
                      type="button"
                      className={cn(
                        "rounded-full px-2 py-1 text-xs font-medium",
                        product.is_available
                          ? "bg-brand-soft text-brand"
                          : "bg-red-50 text-red-700",
                      )}
                      onClick={() =>
                        toggleAvailable.mutate({
                          id: product.id,
                          is_available: !product.is_available,
                        })
                      }
                    >
                      {product.is_available ? "Disponível" : "Indisponível"}
                    </button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] px-6 py-16 text-center">
          <p className="font-medium">{adminCopy.products.empty.title}</p>
          <p className="mt-1 max-w-sm text-sm text-[hsl(var(--muted-foreground))]">
            {adminCopy.products.empty.description}
          </p>
          <Button
            type="button"
            className="mt-4 gap-2"
            onClick={() => navigate("/produtos/novo")}
          >
            <Plus className="h-4 w-4" />
            Novo produto
          </Button>
        </div>
      )}
    </div>
  );
}
