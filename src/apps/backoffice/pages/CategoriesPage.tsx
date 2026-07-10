import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderOpen, Layers, Link2, Pencil, Plus, Sparkles, X } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import { toast } from "sonner";

import { catalogAdminApi, type CategoryAdmin } from "@/features/catalog/api/catalogAdminApi";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { formatCategoryLabel } from "@/features/catalog/utils/categoryLabel";
import { UiHint } from "@/shared/components/UiHint";
import { BackLink, PageHeader } from "@/shared/components/visual";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { adminCopy } from "@/shared/copy/admin";
import { cn } from "@/shared/lib/utils";
import { useConfirm } from "@/shared/hooks/useConfirm";

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmoji, setEditEmoji] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: catalogAdminKeys.categories(),
    queryFn: () => catalogAdminApi.listCategories(),
  });

  const resetForm = () => {
    setName("");
    setEmoji("");
  };

  const createCategory = useMutation({
    mutationFn: () =>
      catalogAdminApi.createCategory({
        name: name.trim(),
        emoji: emoji.trim() || undefined,
        is_active: true,
        sort_order: 0,
      }),
    onSuccess: () => {
      toast.success(adminCopy.categories.toasts.created);
      resetForm();
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

  const updateCategory = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; emoji?: string } }) =>
      catalogAdminApi.updateCategory(id, data),
    onSuccess: () => {
      toast.success(adminCopy.categories.toasts.updated);
      setEditingId(null);
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.categories() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Não foi possível atualizar a categoria");
    },
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

  const applyExample = (example: (typeof adminCopy.categories.examples)[number]) => {
    setName(example.name);
    setEmoji(example.emoji);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    createCategory.mutate();
  };

  const startEditing = (category: CategoryAdmin) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditEmoji(category.emoji ?? "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    setEditEmoji("");
  };

  const handleSaveEdit = () => {
    if (!editingId || !editName.trim()) return;
    updateCategory.mutate({
      id: editingId,
      data: {
        name: editName.trim(),
        emoji: editEmoji.trim(),
      },
    });
  };

  return (
    <div className="space-y-6">
      <BackLink to="/" label="Dashboard" />

      <PageHeader
        variant="hero"
        title="Categorias"
        subtitle={adminCopy.categories.subtitle}
        icon={Layers}
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
                key={example.name}
                type="button"
                className="rounded-full border border-[hsl(var(--border))] bg-white px-3 py-1 text-xs font-medium text-[hsl(var(--foreground))] transition hover:border-[hsl(var(--primary)/0.35)] hover:bg-brand-soft"
                onClick={() => applyExample(example)}
              >
                {example.emoji} {example.name}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_7rem_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nome da categoria</Label>
              <Input
                id="category-name"
                placeholder="Ex: Pizzas salgadas"
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && name.trim()) {
                    event.preventDefault();
                    handleSubmit();
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-emoji">{adminCopy.categories.emojiLabel}</Label>
              <Input
                id="category-emoji"
                placeholder={adminCopy.categories.emojiPlaceholder}
                value={emoji}
                maxLength={8}
                className="text-center text-xl"
                onChange={(event) => setEmoji(event.target.value)}
              />
            </div>

            <Button
              type="button"
              className="gap-2 sm:mb-0.5"
              disabled={!name.trim() || createCategory.isPending}
              onClick={handleSubmit}
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{adminCopy.categories.emojiHelp}</p>
            <div className="flex flex-wrap gap-2">
              {adminCopy.categories.emojiSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-white text-xl transition hover:border-[hsl(var(--primary)/0.35)] hover:bg-brand-soft",
                    emoji === suggestion && "border-brand bg-brand-soft ring-2 ring-brand/20",
                  )}
                  onClick={() => setEmoji(suggestion)}
                  aria-label={`Usar emoji ${suggestion}`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {name.trim() ? (
            <div className="rounded-xl border border-dashed border-brand-soft bg-white/70 px-4 py-3 text-sm">
              <span className="text-[hsl(var(--muted-foreground))]">Prévia no app: </span>
              <span className="font-semibold">{formatCategoryLabel({ name: name.trim(), emoji })}</span>
            </div>
          ) : null}
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
                className="interactive-card rounded-xl border border-[hsl(var(--border))] p-4"
              >
                {editingId === category.id ? (
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_7rem]">
                      <div className="space-y-2">
                        <Label htmlFor={`edit-name-${category.id}`}>Nome</Label>
                        <Input
                          id={`edit-name-${category.id}`}
                          value={editName}
                          onChange={(event) => setEditName(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" && editName.trim()) {
                              event.preventDefault();
                              handleSaveEdit();
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-emoji-${category.id}`}>{adminCopy.categories.emojiLabel}</Label>
                        <Input
                          id={`edit-emoji-${category.id}`}
                          value={editEmoji}
                          maxLength={8}
                          className="text-center text-xl"
                          onChange={(event) => setEditEmoji(event.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {adminCopy.categories.emojiSuggestions.slice(0, 6).map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-white text-lg transition hover:bg-brand-soft",
                            editEmoji === suggestion && "border-brand bg-brand-soft",
                          )}
                          onClick={() => setEditEmoji(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>

                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      Prévia:{" "}
                      <span className="font-medium text-[hsl(var(--foreground))]">
                        {formatCategoryLabel({ name: editName.trim() || category.name, emoji: editEmoji })}
                      </span>
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={!editName.trim() || updateCategory.isPending}
                        onClick={handleSaveEdit}
                      >
                        Salvar
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={cancelEditing}>
                        <X className="mr-1 h-3.5 w-3.5" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{formatCategoryLabel(category)}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {category.product_count} produto{category.product_count === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => startEditing(category)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={deleteCategory.isPending}
                        onClick={() => handleDeleteCategory(category.id, category.name)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
