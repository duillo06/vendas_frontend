import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { catalogAdminApi } from "@/features/catalog/api/catalogAdminApi";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { Label } from "@/shared/components/ui/label";

import { FlowActions, IntentFlowDialog } from "../components/IntentFlowDialog";
import type { IntentFlowProps } from "../types";

export function DescriptionIntentFlow({ product, onClose, onSuccess }: IntentFlowProps) {
  const queryClient = useQueryClient();
  const [description, setDescription] = useState(product.description ?? "");

  const save = useMutation({
    mutationFn: () =>
      catalogAdminApi.updateProduct(product.id, {
        description: description.trim() || null,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.product(product.id) });
      onSuccess("Descrição atualizada");
    },
    onError: () => toast.error("Não deu pra salvar a descrição."),
  });

  return (
    <IntentFlowDialog
      open
      onClose={onClose}
      emoji="📝"
      title="Como você descreve este produto?"
      description="Texto curto e apetitoso ajuda o cliente a decidir."
    >
      <div className="space-y-2">
        <Label htmlFor="product-description">Descrição</Label>
        <textarea
          id="product-description"
          rows={5}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Ex: Massa fina, molho da casa e queijo derretido…"
          className="w-full resize-y rounded-lg border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.35)]"
        />
      </div>
      <FlowActions
        onCancel={onClose}
        onConfirm={() => save.mutate()}
        pending={save.isPending}
        confirmDisabled={description.trim() === (product.description ?? "").trim()}
      />
    </IntentFlowDialog>
  );
}

export function NameIntentFlow({ product, onClose, onSuccess }: IntentFlowProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(product.name);

  const save = useMutation({
    mutationFn: () => catalogAdminApi.updateProduct(product.id, { name: name.trim() }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.product(product.id) });
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.products() });
      onSuccess("Nome atualizado");
    },
    onError: () => toast.error("Não deu pra salvar o nome."),
  });

  return (
    <IntentFlowDialog
      open
      onClose={onClose}
      emoji="✏️"
      title="Qual o novo nome?"
      description="É o título que aparece no cardápio."
    >
      <div className="space-y-2">
        <Label htmlFor="product-name">Nome</Label>
        <input
          id="product-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="h-11 w-full rounded-lg border border-[hsl(var(--border))] bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.35)]"
        />
      </div>
      <FlowActions
        onCancel={onClose}
        onConfirm={() => save.mutate()}
        pending={save.isPending}
        confirmDisabled={!name.trim() || name.trim() === product.name}
      />
    </IntentFlowDialog>
  );
}
