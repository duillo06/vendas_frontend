import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

import { catalogAdminApi } from "@/features/catalog/api/catalogAdminApi";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { formatCategoryLabel } from "@/features/catalog/utils/categoryLabel";
import { Label } from "@/shared/components/ui/label";

import { FlowActions, IntentFlowDialog } from "../components/IntentFlowDialog";
import type { IntentFlowProps } from "../types";

export function CategoryIntentFlow({ product, onClose, onSuccess }: IntentFlowProps) {
  const queryClient = useQueryClient();
  const [categoryId, setCategoryId] = useState(product.category_id);

  const { data: categories, isLoading } = useQuery({
    queryKey: catalogAdminKeys.categories(),
    queryFn: () => catalogAdminApi.listCategories(),
  });

  const save = useMutation({
    mutationFn: () => catalogAdminApi.updateProduct(product.id, { category_id: categoryId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.product(product.id) });
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.products() });
      onSuccess("Categoria atualizada");
    },
    onError: () => toast.error("Não deu pra mudar a categoria."),
  });

  return (
    <IntentFlowDialog
      open
      onClose={onClose}
      emoji="📁"
      title="Para qual categoria?"
      description={`Hoje está em “${formatCategoryLabel(product.category)}”.`}
    >
      {isLoading ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Carregando categorias…</p>
      ) : !categories?.length ? (
        <p className="text-sm">
          Nenhuma categoria ainda.{" "}
          <Link to="/categorias" className="font-medium text-brand underline" onClick={onClose}>
            Criar categoria
          </Link>
        </p>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="product-category">Categoria</Label>
          <select
            id="product-category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="h-11 w-full rounded-lg border border-[hsl(var(--border))] bg-white px-3 text-sm"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {formatCategoryLabel(category)}
              </option>
            ))}
          </select>
        </div>
      )}
      <FlowActions
        onCancel={onClose}
        onConfirm={() => save.mutate()}
        pending={save.isPending}
        confirmDisabled={!categoryId || categoryId === product.category_id}
      />
    </IntentFlowDialog>
  );
}
