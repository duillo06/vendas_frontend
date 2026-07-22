import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Eye, FolderOpen, Save, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import {
  catalogAdminApi,
  type ProductOptionGroupLink,
} from "@/features/catalog/api/catalogAdminApi";
import { ProductBuilderPreview } from "@/features/catalog/components/ProductBuilderPreview";
import { ProductCustomizationsPanel } from "@/features/catalog/components/ProductCustomizationsPanel";
import {
  DEFAULT_COMPOSITION,
  type CompositionForm,
} from "@/features/catalog/components/ProductCompositionEditor";
import { formatCategoryLabel } from "@/features/catalog/utils/categoryLabel";
import { linksFromProduct, serializeProductLinks } from "@/features/catalog/utils/productLinks";
import { ProductImageGallery } from "@/features/catalog/components/ProductImageGallery";
import { ProductTagPicker } from "@/features/catalog/components/ProductTagPicker";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { normalizeProductTags } from "@/features/catalog/utils/productTags";
import { CurrencyInput } from "@/shared/components/CurrencyInput";
import { ProductCard } from "@/shared/components/ProductCard";
import { UiHint } from "@/shared/components/UiHint";
import { PageHeader, BackLink } from "@/shared/components/visual";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { adminCopy } from "@/shared/copy/admin";
import { createId } from "@/shared/lib/utils";

const MAX_IMAGES = 5;

type PendingImage = {
  key: string;
  file: File;
  previewUrl: string;
};

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
    tags: [] as string[],
    product_option_groups: [] as ProductOptionGroupLink[],
    composition: DEFAULT_COMPOSITION as CompositionForm,
    option_prices: [] as { option_id: string; price: number }[],
  });
  const [previewMode, setPreviewMode] = useState<"storefront" | "builder">("storefront");
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description ?? "",
        base_price: product.base_price,
        category_id: product.category_id,
        is_active: product.is_active,
        is_available: product.is_available,
        tags: normalizeProductTags(product.tags ?? []),
        product_option_groups: linksFromProduct(product),
        composition: product.composition
          ? { ...DEFAULT_COMPOSITION, ...product.composition }
          : DEFAULT_COMPOSITION,
        option_prices: product.option_prices ?? [],
      });
      setPendingImages([]);
    } else if (isNew && categories?.length) {
      setForm((current) => ({
        ...current,
        category_id: current.category_id || categories[0].id,
      }));
    }
  }, [product, isNew, categories]);

  useEffect(() => {
    return () => {
      pendingImages.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [pendingImages]);

  const savedImages = product?.images ?? [];
  const totalImageCount = savedImages.length + pendingImages.length;

  const previewImageUrl =
    pendingImages[0]?.previewUrl ??
    savedImages.find((image) => image.is_primary)?.image_url ??
    savedImages[0]?.image_url ??
    null;

  const previewSlug =
    product?.slug ??
    (form.name.trim()
      ? form.name
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      : "preview");

  const checklist = useMemo(
    () => ({
      photo: totalImageCount > 0,
      name: form.name.trim().length >= 3,
      price: form.base_price > 0,
      category: Boolean(form.category_id),
    }),
    [totalImageCount, form.name, form.base_price, form.category_id],
  );

  const groupsById = useMemo(
    () => new Map((optionGroups ?? []).map((group) => [group.id, group])),
    [optionGroups],
  );

  const invalidateProductQueries = (productId: string) => {
    void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.product(productId) });
    void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.products() });
    void queryClient.invalidateQueries({ queryKey: ["catalog"] });
  };

  const uploadImage = useMutation({
    mutationFn: (file: File) => catalogAdminApi.uploadProductImage(id!, file),
    onSuccess: () => {
      toast.success(adminCopy.products.form.imageUploaded);
      invalidateProductQueries(id!);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Não foi possível enviar a imagem");
    },
  });

  const deleteImage = useMutation({
    mutationFn: (imageId: string) => catalogAdminApi.deleteProductImage(id!, imageId),
    onSuccess: () => {
      toast.success(adminCopy.products.form.imageDeleted);
      invalidateProductQueries(id!);
    },
    onError: () => toast.error("Não foi possível remover a imagem"),
  });

  const setPrimaryImage = useMutation({
    mutationFn: (imageId: string) => catalogAdminApi.setPrimaryProductImage(id!, imageId),
    onSuccess: () => {
      toast.success(adminCopy.products.form.primarySet);
      invalidateProductQueries(id!);
    },
    onError: () => toast.error("Não foi possível definir a capa"),
  });

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
        tags: normalizeProductTags(form.tags),
        product_option_groups: serializeProductLinks(form.product_option_groups),
        ...(form.option_prices.length ? { option_prices: form.option_prices } : {}),
        composition: {
          enabled: form.composition.enabled,
          source_type: form.composition.source_type,
          source_category_id: form.composition.source_category_id,
          source_tag: form.composition.source_tag,
          custom_product_ids: form.composition.custom_product_ids,
          label: form.composition.label,
          min_parts: form.composition.min_parts,
          max_parts: form.composition.max_parts,
          pricing_rule: form.composition.pricing_rule,
        },
      };

      const saved = isNew
        ? await catalogAdminApi.createProduct(payload)
        : await catalogAdminApi.updateProduct(id!, payload);

      if (pendingImages.length) {
        for (const [index, item] of pendingImages.entries()) {
          await catalogAdminApi.uploadProductImage(saved.id, item.file, {
            isPrimary: index === 0,
          });
        }
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

  const handleAddFiles = (files: FileList | File[]) => {
    const incoming = Array.from(files);
    const availableSlots = MAX_IMAGES - totalImageCount;

    if (availableSlots <= 0) {
      toast.error(adminCopy.products.form.imageLimit);
      return;
    }

    const nextFiles = incoming.slice(0, availableSlots);
    if (nextFiles.length < incoming.length) {
      toast.error(adminCopy.products.form.imageLimit);
    }

    if (isNew) {
      setPendingImages((current) => [
        ...current,
        ...nextFiles.map((file) => ({
          key: `${file.name}-${file.lastModified}-${createId()}`,
          file,
          previewUrl: URL.createObjectURL(file),
        })),
      ]);
      return;
    }

    nextFiles.forEach((file) => uploadImage.mutate(file));
  };

  const removePendingImage = (key: string) => {
    setPendingImages((current) => {
      const target = current.find((item) => item.key === key);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return current.filter((item) => item.key !== key);
    });
  };

  if (!isNew && isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  const noCategories = !categories?.length;

  return (
    <div className="space-y-6">
      <BackLink to={isNew ? "/produtos" : `/produtos/${id}`} label={isNew ? "Produtos" : "Gerenciar produto"} />

      <PageHeader
        title={isNew ? adminCopy.products.form.titleNew : "Editor completo"}
        subtitle={
          isNew
            ? adminCopy.products.form.subtitleNew
            : "Todos os campos numa tela — use quando precisar de visão avançada."
        }
        icon={Sparkles}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="space-y-6">
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
            <Label>Fotos do produto</Label>
            <ProductImageGallery
              images={savedImages}
              pendingPreviews={pendingImages.map((item) => ({
                key: item.key,
                url: item.previewUrl,
              }))}
              isUploading={uploadImage.isPending || save.isPending}
              onAddFiles={handleAddFiles}
              onSetPrimary={!isNew ? (imageId) => setPrimaryImage.mutate(imageId) : undefined}
              onDelete={!isNew ? (imageId) => deleteImage.mutate(imageId) : undefined}
              onRemovePending={isNew ? removePendingImage : undefined}
            />
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {adminCopy.products.form.imagesHelp}
            </p>
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

          <div className="space-y-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 p-4">
            <ProductTagPicker
              tags={form.tags}
              onChange={(tags) => setForm({ ...form, tags })}
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
                    {formatCategoryLabel(category)}
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

          <ProductCustomizationsPanel
            links={form.product_option_groups}
            availableGroups={optionGroups ?? []}
            categoryName={categories?.find((c) => c.id === form.category_id)?.name}
            categories={categories}
            currentProductId={product?.id}
            productOptionPrices={form.option_prices}
            onOptionPricesChange={(option_prices) =>
              setForm((current) => ({ ...current, option_prices }))
            }
            composition={form.composition}
            onCompositionChange={(composition) =>
              setForm((current) => ({ ...current, composition }))
            }
            onChange={(product_option_groups) =>
              setForm((current) => ({ ...current, product_option_groups }))
            }
          />

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

        <Card className="sticky top-6 border-[hsl(var(--border))] shadow-sm lg:top-8">
          <CardHeader className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="h-4 w-4 text-brand" />
              Prévia
            </CardTitle>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  previewMode === "storefront"
                    ? "bg-brand text-white"
                    : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                }`}
                onClick={() => setPreviewMode("storefront")}
              >
                Vitrine
              </button>
              <button
                type="button"
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  previewMode === "builder"
                    ? "bg-brand text-white"
                    : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                }`}
                onClick={() => setPreviewMode("builder")}
              >
                Builder
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {previewMode === "storefront" ? (
              <>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {adminCopy.products.form.previewHint}
                </p>
                <div className="pointer-events-none mx-auto max-w-[260px]">
                  <ProductCard
                    id={product?.id ?? "preview"}
                    slug={previewSlug}
                    name={form.name.trim() || "Nome do produto"}
                    description={form.description.trim() || undefined}
                    price={form.base_price || 0}
                    imageUrl={previewImageUrl}
                    tags={form.tags}
                    unavailable={!form.is_available}
                    className="scale-in"
                  />
                </div>
              </>
            ) : (
              <ProductBuilderPreview
                name={form.name}
                basePrice={form.base_price}
                links={form.product_option_groups}
                groupsById={groupsById}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
