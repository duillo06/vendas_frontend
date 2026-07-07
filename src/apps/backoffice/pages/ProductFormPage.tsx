import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { catalogAdminApi } from "@/features/catalog/api/catalogAdminApi";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "novo" || !id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: catalogAdminKeys.product(id ?? ""),
    queryFn: () => catalogAdminApi.getProduct(id!),
    enabled: !isNew && Boolean(id),
  });

  const { data: categories } = useQuery({
    queryKey: catalogAdminKeys.categories(),
    queryFn: () => catalogAdminApi.listCategories(),
  });

  const { data: optionGroups } = useQuery({
    queryKey: catalogAdminKeys.optionGroups(),
    queryFn: () => catalogAdminApi.listOptionGroups(),
  });

  const [form, setForm] = useState({
    name: "",
    description: "",
    base_price: "",
    category_id: "",
    is_active: true,
    is_available: true,
    option_group_ids: [] as string[],
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description ?? "",
        base_price: String(product.base_price),
        category_id: product.category_id,
        is_active: product.is_active,
        is_available: product.is_available,
        option_group_ids: product.option_group_ids,
      });
    } else if (isNew && categories?.length) {
      setForm((current) => ({ ...current, category_id: categories[0].id }));
    }
  }, [product, isNew, categories]);

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name,
        description: form.description,
        base_price: Number(form.base_price),
        category_id: form.category_id,
        is_active: form.is_active,
        is_available: form.is_available,
        option_group_ids: form.option_group_ids,
      };
      return isNew
        ? catalogAdminApi.createProduct(payload)
        : catalogAdminApi.updateProduct(id!, payload);
    },
    onSuccess: (saved) => {
      toast.success(isNew ? "Produto criado" : "Produto atualizado");
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.all });
      void navigate(`/produtos/${saved.id}`);
    },
    onError: () => toast.error("Não foi possível salvar o produto"),
  });

  const uploadImage = useMutation({
    mutationFn: (file: File) => catalogAdminApi.uploadProductImage(id!, file),
    onSuccess: () => {
      toast.success("Imagem enviada");
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.product(id!) });
    },
  });

  if (!isNew && isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link to="/produtos" className="text-sm text-[hsl(var(--primary))] hover:underline">
          ← Voltar aos produtos
        </Link>
        <h1 className="text-2xl font-bold">{isNew ? "Novo produto" : "Editar produto"}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do produto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="base_price">Preço (R$)</Label>
              <Input
                id="base_price"
                type="number"
                step="0.01"
                value={form.base_price}
                onChange={(event) => setForm({ ...form, base_price: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category_id">Categoria</Label>
              <select
                id="category_id"
                className="h-10 w-full rounded-md border border-[hsl(var(--border))] px-3 text-sm"
                value={form.category_id}
                onChange={(event) => setForm({ ...form, category_id: event.target.value })}
              >
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {optionGroups?.length ? (
            <div className="space-y-2">
              <Label>Grupos de opções</Label>
              <div className="space-y-2">
                {optionGroups.map((group) => (
                  <label key={group.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.option_group_ids.includes(group.id)}
                      onChange={(event) => {
                        setForm((current) => ({
                          ...current,
                          option_group_ids: event.target.checked
                            ? [...current.option_group_ids, group.id]
                            : current.option_group_ids.filter((value) => value !== group.id),
                        }));
                      }}
                    />
                    {group.name}
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {!isNew ? (
            <div className="space-y-2">
              <Label htmlFor="image">Imagem</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) uploadImage.mutate(file);
                }}
              />
            </div>
          ) : null}

          <Button type="button" disabled={save.isPending} onClick={() => save.mutate()}>
            {save.isPending ? "Salvando..." : "Salvar produto"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
