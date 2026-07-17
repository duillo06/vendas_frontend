import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { catalogAdminApi } from "@/features/catalog/api/catalogAdminApi";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { CurrencyInput } from "@/shared/components/CurrencyInput";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { Label } from "@/shared/components/ui/label";

import { FlowActions, IntentFlowDialog } from "../components/IntentFlowDialog";
import type { IntentFlowProps } from "../types";

export function PriceIntentFlow({ product, onClose, onSuccess }: IntentFlowProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"ask" | "confirm">("ask");
  const [price, setPrice] = useState(product.base_price);

  const save = useMutation({
    mutationFn: () => catalogAdminApi.updateProduct(product.id, { base_price: price }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.product(product.id) });
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.products() });
      onSuccess("Preço atualizado");
    },
    onError: () => toast.error("Não deu pra salvar o preço. Tenta de novo."),
  });

  return (
    <IntentFlowDialog
      open
      onClose={onClose}
      emoji="💰"
      title={step === "ask" ? "Qual será o novo preço?" : "Confirmar novo preço"}
      description={
        step === "ask"
          ? "Só o valor base. Adicionais continuam à parte."
          : "Revise antes de publicar no cardápio."
      }
    >
      {step === "ask" ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 px-4 py-3 text-sm">
            Preço atual: <PriceDisplay value={product.base_price} className="font-semibold text-brand" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-price">Novo preço</Label>
            <CurrencyInput id="new-price" value={price} onChange={setPrice} />
          </div>
          <FlowActions
            onCancel={onClose}
            onConfirm={() => setStep("confirm")}
            confirmLabel="Continuar"
            confirmDisabled={price <= 0 || price === product.base_price}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            De <PriceDisplay value={product.base_price} /> para{" "}
            <PriceDisplay value={price} className="font-semibold text-brand" />.
          </p>
          <FlowActions
            onBack={() => setStep("ask")}
            onCancel={onClose}
            onConfirm={() => save.mutate()}
            confirmLabel="Confirmar preço"
            pending={save.isPending}
          />
        </div>
      )}
    </IntentFlowDialog>
  );
}
