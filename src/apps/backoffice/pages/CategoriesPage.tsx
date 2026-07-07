import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { catalogAdminApi } from "@/features/catalog/api/catalogAdminApi";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useConfirm } from "@/shared/hooks/useConfirm";

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();
  const [name, setName] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: catalogAdminKeys.categories(),
    queryFn: () => catalogAdminApi.listCategories(),
  });

  const createCategory = useMutation({
    mutationFn: () => catalogAdminApi.createCategory({ name, is_active: true, sort_order: 0 }),
    onSuccess: () => {
      toast.success("Categoria criada");
      setName("");
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.categories() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Não foi possível criar a categoria");
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) => catalogAdminApi.deleteCategory(id),
    onSuccess: () => {
      toast.success("Categoria removida");
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.categories() });
    },
    onError: () => toast.error("Não foi possível excluir a categoria"),
  });

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    const confirmed = await confirm({
      title: "Excluir categoria",
      description: `Remover "${categoryName}"? Produtos desta categoria não serão excluídos.`,
      confirmLabel: "Excluir",
      destructive: true,
    });
    if (confirmed) deleteCategory.mutate(categoryId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Categorias</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Organize o cardápio</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nova categoria</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Nome da categoria"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Button type="button" onClick={() => createCategory.mutate()} disabled={!name.trim()}>
            Adicionar
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : (
        <ul className="space-y-2">
          {data?.map((category) => (
            <li
              key={category.id}
              className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-4"
            >
              <div>
                <p className="font-medium">{category.name}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {category.product_count} produtos
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={deleteCategory.isPending}
                onClick={() => handleDeleteCategory(category.id, category.name)}
              >
                Excluir
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
