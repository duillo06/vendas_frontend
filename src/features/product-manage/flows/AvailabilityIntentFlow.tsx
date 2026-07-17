import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { catalogAdminApi } from "@/features/catalog/api/catalogAdminApi";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { cn } from "@/shared/lib/utils";

import { FlowActions, IntentFlowDialog } from "../components/IntentFlowDialog";
import type { IntentFlowProps } from "../types";

type Mode = "available" | "paused" | "archived";

function modeFromProduct(product: IntentFlowProps["product"]): Mode {
  if (!product.is_active) return "archived";
  if (!product.is_available) return "paused";
  return "available";
}

const OPTIONS: Array<{ id: Mode; title: string; hint: string }> = [
  {
    id: "available",
    title: "Disponível para pedido",
    hint: "Aparece no cardápio e aceita novas vendas.",
  },
  {
    id: "paused",
    title: "Pausado",
    hint: "Continua no cardápio, mas sem aceitar pedido agora.",
  },
  {
    id: "archived",
    title: "Arquivado",
    hint: "Some do cardápio. Você pode reativar depois.",
  },
];

type AvailabilityIntentFlowProps = IntentFlowProps & {
  initialMode?: Mode;
};

export function AvailabilityIntentFlow({
  product,
  onClose,
  onSuccess,
  initialMode,
}: AvailabilityIntentFlowProps) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>(() => initialMode ?? modeFromProduct(product));

  const save = useMutation({
    mutationFn: () => {
      if (mode === "available") {
        return catalogAdminApi.updateProduct(product.id, { is_active: true, is_available: true });
      }
      if (mode === "paused") {
        return catalogAdminApi.updateProduct(product.id, { is_active: true, is_available: false });
      }
      return catalogAdminApi.updateProduct(product.id, { is_active: false, is_available: false });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.product(product.id) });
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.products() });
      onSuccess(
        mode === "available"
          ? "Produto disponível"
          : mode === "paused"
            ? "Vendas pausadas"
            : "Produto arquivado",
      );
    },
    onError: () => toast.error("Não deu pra atualizar a disponibilidade."),
  });

  return (
    <IntentFlowDialog
      open
      onClose={onClose}
      emoji="🟢"
      title="Como está a disponibilidade?"
      description="Escolha um estado — sem misturar com preço ou fotos."
    >
      <ul className="space-y-2">
        {OPTIONS.map((option) => {
          const selected = mode === option.id;
          return (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => setMode(option.id)}
                className={cn(
                  "w-full rounded-xl border px-4 py-3 text-left transition",
                  selected
                    ? "border-brand bg-[hsl(var(--primary-soft))] shadow-sm"
                    : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.35)]",
                )}
              >
                <p className="text-sm font-semibold">{option.title}</p>
                <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">{option.hint}</p>
              </button>
            </li>
          );
        })}
      </ul>
      <FlowActions
        onCancel={onClose}
        onConfirm={() => save.mutate()}
        pending={save.isPending}
        confirmDisabled={mode === modeFromProduct(product)}
      />
    </IntentFlowDialog>
  );
}

export function PauseIntentFlow(props: IntentFlowProps) {
  return <AvailabilityIntentFlow {...props} initialMode="paused" />;
}
