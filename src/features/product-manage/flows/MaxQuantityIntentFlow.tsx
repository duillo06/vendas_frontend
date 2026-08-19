import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { catalogAdminApi } from "@/features/catalog/api/catalogAdminApi";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { MaxPerOrderField } from "@/features/catalog/components/MaxPerOrderField";
import { DEFAULT_MAX_PER_ORDER } from "@/features/cart/utils/orderQuantity";

import { FlowActions, IntentFlowDialog } from "../components/IntentFlowDialog";
import type { IntentFlowProps } from "../types";

export function MaxQuantityIntentFlow({ product, onClose, onSuccess }: IntentFlowProps) {
  const queryClient = useQueryClient();
  const current = product.max_quantity_per_order ?? DEFAULT_MAX_PER_ORDER;
  const [value, setValue] = useState(current);

  const save = useMutation({
    mutationFn: () => catalogAdminApi.updateProduct(product.id, { max_quantity_per_order: value }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.product(product.id) });
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.products() });
      onSuccess("Limite por pedido atualizado");
    },
    onError: () => toast.error("Não deu pra salvar. Tenta de novo."),
  });

  return (
    <IntentFlowDialog
      open
      onClose={onClose}
      emoji="🔢"
      title="Quantas unidades no mesmo pedido?"
      description="Só um teto por pedido. Não controla o que você tem na geladeira."
    >
      <div className="space-y-4">
        <p className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 px-4 py-3 text-sm">
          Hoje: até <span className="font-semibold text-brand">{current}</span> por pedido
        </p>
        <MaxPerOrderField value={value} onChange={setValue} />
        <FlowActions
          onCancel={onClose}
          onConfirm={() => save.mutate()}
          confirmLabel="Salvar limite"
          confirmDisabled={value === current}
          pending={save.isPending}
        />
      </div>
    </IntentFlowDialog>
  );
}
