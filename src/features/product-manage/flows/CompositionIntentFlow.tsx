import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { catalogAdminApi } from "@/features/catalog/api/catalogAdminApi";
import {
  DEFAULT_COMPOSITION,
  ProductCompositionEditor,
  type CompositionForm,
} from "@/features/catalog/components/ProductCompositionEditor";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { linksFromProduct, serializeProductLinks } from "@/features/catalog/utils/productLinks";

import { FlowActions, IntentFlowDialog } from "../components/IntentFlowDialog";
import type { IntentFlowProps } from "../types";

export function CompositionIntentFlow({ product, onClose, onSuccess }: IntentFlowProps) {
  const queryClient = useQueryClient();
  const alreadySaved = !!product.composition?.enabled;
  const [composition, setComposition] = useState<CompositionForm>(
    product.composition
      ? { ...DEFAULT_COMPOSITION, ...product.composition }
      : { ...DEFAULT_COMPOSITION, enabled: false },
  );

  const { data: categories } = useQuery({
    queryKey: catalogAdminKeys.categories(),
    queryFn: () => catalogAdminApi.listCategories(),
  });

  const save = useMutation({
    mutationFn: () => catalogAdminApi.updateProduct(product.id, { composition }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.product(product.id) });
      onSuccess(
        composition.enabled
          ? "Pronto! Seu cliente já pode combinar sabores."
          : "Combinar sabores desligado neste produto.",
      );
    },
    onError: () => toast.error("Não deu pra salvar. Tente de novo."),
  });

  return (
    <IntentFlowDialog
      open
      onClose={onClose}
      emoji="🍕"
      title="Meio a meio e sabores"
      description="Responda as perguntas e toque em Salvar — só então vale no cardápio."
      wide
    >
      {!alreadySaved && composition.enabled ? (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Ainda não está no cardápio. Toque em <strong>Salvar</strong> embaixo pra liberar a
          combinação de sabores.
        </p>
      ) : null}
      <ProductCompositionEditor
        value={composition}
        onChange={setComposition}
        categories={categories}
        currentProductId={product.id}
      />
      <FlowActions
        onCancel={onClose}
        onConfirm={() => save.mutate()}
        pending={save.isPending}
        confirmLabel={composition.enabled ? "Salvar e liberar no cardápio" : "Salvar"}
      />
    </IntentFlowDialog>
  );
}

export function DuplicateIntentFlow({ product, onClose, onSuccess }: IntentFlowProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const duplicate = useMutation({
    mutationFn: async () => {
      const created = await catalogAdminApi.createProduct({
        name: `${product.name} (cópia)`,
        description: product.description,
        base_price: product.base_price,
        category_id: product.category_id,
        is_active: product.is_active,
        is_available: false,
        product_option_groups: serializeProductLinks(linksFromProduct(product)),
        composition: product.composition ?? undefined,
      });
      return created;
    },
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.products() });
      onSuccess("Cópia criada — vendas pausadas até você revisar");
      navigate(`/produtos/${created.id}`);
    },
    onError: () => toast.error("Não deu pra duplicar."),
  });

  return (
    <IntentFlowDialog
      open
      onClose={onClose}
      emoji="⧉"
      title="Duplicar este produto?"
      description="Cria uma cópia com opções e composição. Fotos não são copiadas."
    >
      <p className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 px-4 py-3 text-sm">
        Nova versão: <strong>{product.name} (cópia)</strong>
      </p>
      <FlowActions
        onCancel={onClose}
        onConfirm={() => duplicate.mutate()}
        confirmLabel="Duplicar"
        pending={duplicate.isPending}
      />
    </IntentFlowDialog>
  );
}

export function DeleteIntentFlow({ product, onClose, onSuccess }: IntentFlowProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmText, setConfirmText] = useState("");

  const remove = useMutation({
    mutationFn: () => catalogAdminApi.deleteProduct(product.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.products() });
      onSuccess("Produto excluído");
      navigate("/produtos");
    },
    onError: () => toast.error("Não deu pra excluir."),
  });

  return (
    <IntentFlowDialog
      open
      onClose={onClose}
      emoji="🗑️"
      title="Excluir produto?"
      description="Isso remove o item do cardápio. Digite o nome para confirmar."
    >
      <p className="text-sm text-[hsl(var(--muted-foreground))]">
        Digite <strong>{product.name}</strong> abaixo.
      </p>
      <input
        value={confirmText}
        onChange={(event) => setConfirmText(event.target.value)}
        className="mt-3 h-11 w-full rounded-lg border border-[hsl(var(--border))] bg-white px-3 text-sm"
        placeholder={product.name}
      />
      <FlowActions
        onCancel={onClose}
        onConfirm={() => remove.mutate()}
        confirmLabel="Excluir de vez"
        pending={remove.isPending}
        confirmDisabled={confirmText.trim() !== product.name}
        danger
      />
    </IntentFlowDialog>
  );
}
