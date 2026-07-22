import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { catalogAdminApi } from "@/features/catalog/api/catalogAdminApi";
import { ProductTagPicker } from "@/features/catalog/components/ProductTagPicker";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { normalizeProductTags } from "@/features/catalog/utils/productTags";

import { FlowActions, IntentFlowDialog } from "../components/IntentFlowDialog";
import type { IntentFlowProps } from "../types";

export function TagsIntentFlow({ product, onClose, onSuccess }: IntentFlowProps) {
  const queryClient = useQueryClient();
  const [tags, setTags] = useState(() => normalizeProductTags(product.tags ?? []));

  const save = useMutation({
    mutationFn: () =>
      catalogAdminApi.updateProduct(product.id, {
        tags: normalizeProductTags(tags),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.product(product.id) });
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.products() });
      void queryClient.invalidateQueries({ queryKey: ["catalog"] });
      onSuccess("Destaques da vitrine atualizados");
    },
    onError: () => toast.error("Não deu pra salvar os destaques."),
  });

  const original = normalizeProductTags(product.tags ?? []).join("|");
  const current = normalizeProductTags(tags).join("|");

  return (
    <IntentFlowDialog
      open
      onClose={onClose}
      emoji="🏠"
      title="Como este produto aparece na vitrine?"
      description="Marque o que fizer sentido — a Home e os selos do cardápio se ajustam sozinhos."
    >
      <ProductTagPicker tags={tags} onChange={setTags} />
      <FlowActions
        onCancel={onClose}
        onConfirm={() => save.mutate()}
        pending={save.isPending}
        confirmDisabled={current === original}
      />
    </IntentFlowDialog>
  );
}
