import { useState } from "react";

import type { OrderAdminDetail } from "@/features/orders/types/order-admin.types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { adminCopy } from "@/shared/copy/admin";
import { cn } from "@/shared/lib/utils";

import { getNowCardCopy } from "./orderDetailCopy";

type OrderNextActionCardProps = {
  order: OrderAdminDetail;
  isPending: boolean;
  cancelNotes: string;
  onCancelNotesChange: (value: string) => void;
  onCancel: () => void;
  canCancel: boolean;
};

/** copy curta + cancelamento em disclosure — sem CTA primário duplicado */
export function OrderNextActionCard({
  order,
  isPending,
  cancelNotes,
  onCancelNotesChange,
  onCancel,
  canCancel,
}: OrderNextActionCardProps) {
  const copy = getNowCardCopy(order);
  const done = order.status === "completed" || order.status === "cancelled";
  const [cancelOpen, setCancelOpen] = useState(false);

  if (done) {
    return (
      <p className="text-sm text-[hsl(var(--muted-foreground))]">
        <span className="font-medium text-[hsl(var(--foreground))]">{copy.title}.</span> {copy.body}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-[hsl(var(--muted-foreground))]">
        <span className="font-medium text-[hsl(var(--foreground))]">{copy.body}</span>
        {copy.emotion ? ` · ${copy.emotion}` : null}
      </p>

      {canCancel ? (
        <div>
          {!cancelOpen ? (
            <button
              type="button"
              className="text-xs font-medium text-[hsl(var(--muted-foreground))] underline-offset-2 hover:text-red-700 hover:underline"
              onClick={() => setCancelOpen(true)}
            >
              Cancelar pedido…
            </button>
          ) : (
            <div
              className={cn(
                "mt-1 space-y-2 rounded-xl bg-[hsl(var(--muted))]/40 p-3",
              )}
            >
              <Input
                placeholder="Motivo do cancelamento (obrigatório)"
                value={cancelNotes}
                onChange={(event) => onCancelNotesChange(event.target.value)}
                className="h-9 bg-white"
              />
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                {adminCopy.orders.detail.cancelHint}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs text-red-700 hover:bg-red-50"
                  disabled={isPending || !cancelNotes.trim()}
                  onClick={onCancel}
                >
                  Confirmar cancelamento
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    setCancelOpen(false);
                    onCancelNotesChange("");
                  }}
                >
                  Voltar
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
