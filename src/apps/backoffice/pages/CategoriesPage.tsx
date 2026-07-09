import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderOpen, Layers, Link2, Plus, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import { toast } from "sonner";

import { catalogAdminApi } from "@/features/catalog/api/catalogAdminApi";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { UiHint } from "@/shared/components/UiHint";
import { PageHeader } from "@/shared/components/visual";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { adminCopy } from "@/shared/copy/admin";
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
      toast.success(adminCopy.categories.toasts.created);
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
      toast.success(adminCopy.categories.toasts.removed);
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.categories() });
    },
    onError: () => toast.error("Não foi possível excluir a categoria"),
  });

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    const confirmed = await confirm({
      title: "Excluir categoria",
      description: `Remover "${categoryName}"? ${adminCopy.categories.deleteConfirm}`,
      confirmLabel: "Excluir",
      destructive: true,
    });
    if (confirmed) deleteCategory.mutate(categoryId);
  };

  const categories = data ?? [];

  const applyExample = (example: string) => {
    setName(example);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorias"
        subtitle={adminCopy.categories.subtitle}
        icon={Layers}
        accent="chart-4"
      />

      <UiHint icon={Sparkles} tone="warm">
        {adminCopy.categories.guidance}
      </UiHint>

      <Card className="border-brand-soft bg-brand-soft/40">
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-start gap-3">
            <div className="tile-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <Plus className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">{adminCopy.categories.createTitle}</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {adminCopy.categories.createHint}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {adminCopy.categories.examples.map((example) => (
              <button
                key={example}
                type="button"
                className="rounded-full border border-[hsl(var(--border))] bg-white px-3 py-1 text-xs font-medium text-[hsl(var(--foreground))] transition hover:border-[hsl(var(--primary)/0.35)] hover:bg-brand-soft"
                onClick={() => applyExample(example)}
              >
                {example}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="category-name">Nome da categoria</Label>
              <Input
                id="category-name"
                placeholder="Ex: Pizzas salgadas"
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && name.trim()) {
                    event.preventDefault();
                    createCategory.mutate();
                  }
                }}
              />
            </div>
            <Button
              type="button"
              className="gap-2"
              disabled={!name.trim() || createCategory.isPending}
              onClick={() => createCategory.mutate()}
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] px-6 py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
            <FolderOpen className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
          </div>
          <p className="font-medium">{adminCopy.categories.empty.title}</p>
          <p className="mt-1 max-w-sm text-sm text-[hsl(var(--muted-foreground))]">
            {adminCopy.categories.empty.description}
          </p>
        </div>
      ) : (
        <>
          <UiHint tone="neutral">
            {adminCopy.categories.linkProducts}
            <Link to="/produtos" className="ml-1 inline-flex items-center gap-1 font-medium text-brand underline">
              <Link2 className="h-3.5 w-3.5" />
              Ir para produtos
            </Link>
          </UiHint>

          <ul className="space-y-2">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-4"
              >
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {category.product_count} produto{category.product_count === 1 ? "" : "s"}
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
        </>
      )}
    </div>
  );
}
