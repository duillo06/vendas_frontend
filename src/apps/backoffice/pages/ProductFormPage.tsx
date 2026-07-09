import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, FolderOpen, ImagePlus, Save, Sparkles, Tag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { catalogAdminApi } from "@/features/catalog/api/catalogAdminApi";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { CurrencyInput } from "@/shared/components/CurrencyInput";
import { UiHint } from "@/shared/components/UiHint";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { adminCopy } from "@/shared/copy/admin";

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
    base_price: 0,
    category_id: "",
    is_active: true,
    is_available: true,
    option_group_ids: [] as string[],
  });
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description ?? "",
        base_price: product.base_price,
        category_id: product.category_id,
        is_active: product.is_active,
        is_available: product.is_available,
        option_group_ids: product.option_group_ids,
      });
      const primary = product.images.find((image) => image.is_primary) ?? product.images[0];
      setPreviewUrl(primary?.image_url ?? null);
      setPendingImage(null);
    } else if (isNew && categories?.length) {
      setForm((current) => ({
        ...current,
        category_id: current.category_id || categories[0].id,
      }));
    }
  }, [product, isNew, categories]);

  useEffect(() => {
    if (!pendingImage) return;
    const objectUrl = URL.createObjectURL(pendingImage);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [pendingImage]);

  const checklist = useMemo(
    () => ({
      photo: Boolean(previewUrl),
      name: form.name.trim().length >= 3,
      price: form.base_price > 0,
      category: Boolean(form.category_id),
    }),
    [previewUrl, form.name, form.base_price, form.category_id],
  );

  const save = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) {
        throw new Error("Informe o nome do produto");
      }
      if (!form.category_id) {
        throw new Error("Selecione uma categoria");
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        base_price: form.base_price,
        category_id: form.category_id,
        is_active: form.is_active,
        is_available: form.is_available,
        option_group_ids: form.option_group_ids,
      };

      const saved = isNew
        ? await catalogAdminApi.createProduct(payload)
        : await catalogAdminApi.updateProduct(id!, payload);

      if (pendingImage) {
        await catalogAdminApi.uploadProductImage(saved.id, pendingImage);
      }

      return saved;
    },
    onSuccess: (saved) => {
      toast.success(isNew ? adminCopy.products.form.successNew : adminCopy.products.form.successEdit);
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.all });
      void navigate(`/produtos/${saved.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Não foi possível salvar o produto");
    },
  });

  const uploadImage = useMutation({
    mutationFn: (file: File) => catalogAdminApi.uploadProductImage(id!, file),
    onSuccess: () => {
      toast.success("Imagem enviada");
      setPendingImage(null);
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.product(id!) });
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.products() });
    },
    onError: () => toast.error("Não foi possível enviar a imagem"),
  });

  const handleImagePick = (file: File | undefined) => {
    if (!file) return;

    if (isNew) {
      setPendingImage(file);
      return;
    }

    setPendingImage(file);
    uploadImage.mutate(file);
  };

  if (!isNew && isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  const noCategories = !categories?.length;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <Link to="/produtos" className="text-sm text-[hsl(var(--primary))] hover:underline">
          ← Voltar aos produtos
        </Link>
        <h1 className="text-2xl font-bold">
          {isNew ? adminCopy.products.form.titleNew : adminCopy.products.form.titleEdit}
        </h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {isNew ? adminCopy.products.form.subtitleNew : adminCopy.products.form.subtitleEdit}
        </p>
      </div>

      <UiHint icon={Sparkles} tone="warm">
        {adminCopy.products.form.guidance}
      </UiHint>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do produto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 p-4 sm:grid-cols-2">
            <p className="text-sm font-medium sm:col-span-2">{adminCopy.products.form.checklistTitle}</p>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className={`h-4 w-4 ${checklist.photo ? "text-brand" : "text-[hsl(var(--muted-foreground))]"}`} />
              {adminCopy.products.form.checklist.photo}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className={`h-4 w-4 ${checklist.name ? "text-brand" : "text-[hsl(var(--muted-foreground))]"}`} />
              {adminCopy.products.form.checklist.name}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className={`h-4 w-4 ${checklist.price ? "text-brand" : "text-[hsl(var(--muted-foreground))]"}`} />
              {adminCopy.products.form.checklist.price}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className={`h-4 w-4 ${checklist.category ? "text-brand" : "text-[hsl(var(--muted-foreground))]"}`} />
              {adminCopy.products.form.checklist.category}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Foto do produto</Label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                {previewUrl ? (
                  <img src={previewUrl} alt="Prévia do produto" className="h-full w-full object-cover" />
                ) : (
                  <ImagePlus className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
                )}
              </div>
              <div className="space-y-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  disabled={uploadImage.isPending}
                  onChange={(event) => {
                    handleImagePick(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {isNew
                    ? "A foto será enviada junto com o cadastro do produto."
                    : uploadImage.isPending
                      ? "Enviando imagem..."
                      : "JPG ou PNG. A nova foto vira capa do produto."}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Ex: Pizza frango com catupiry"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: molho artesanal, frango desfiado e catupiry cremoso"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="base_price">Preço</Label>
              <CurrencyInput
                id="base_price"
                value={form.base_price}
                onChange={(value) => setForm({ ...form, base_price: value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category_id">Categoria</Label>
              <select
                id="category_id"
                className="h-10 w-full rounded-md border border-[hsl(var(--border))] bg-white px-3 text-sm"
                value={form.category_id}
                onChange={(event) => setForm({ ...form, category_id: event.target.value })}
              >
                {!categories?.length ? <option value="">Sem categorias</option> : null}
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {noCategories ? (
            <UiHint icon={FolderOpen} title={adminCopy.products.form.noCategories.title} tone="warm">
              {adminCopy.products.form.noCategories.description}
              <Link to="/categorias" className="ml-1 font-medium text-[hsl(var(--primary))] underline">
                Ir para categorias
              </Link>
            </UiHint>
          ) : null}

          {optionGroups?.length ? (
            <div className="space-y-2">
              <Label>Grupos de opções</Label>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {adminCopy.products.form.optionGroupsHelp}
              </p>
              <div className="space-y-2 rounded-lg border border-[hsl(var(--border))] p-3">
                {optionGroups.map((group) => (
                  <label key={group.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[hsl(var(--primary))]"
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
                    <Tag className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                    {group.name}
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <Button
            type="button"
            className="w-full gap-2 sm:w-auto"
            disabled={save.isPending || !form.name.trim() || !form.category_id}
            onClick={() => save.mutate()}
          >
            <Save className="h-4 w-4" />
            {save.isPending ? "Salvando..." : isNew ? "Cadastrar produto" : "Salvar alterações"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
