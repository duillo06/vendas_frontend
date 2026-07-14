import type { OrderStatus } from "@/features/checkout/types/checkout.types";
import type { OrderAdminDetail } from "@/features/orders/types/order-admin.types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { adminCopy } from "@/shared/copy/admin";

import { getNowCardCopy, PRIMARY_ACTION_LABELS } from "./orderDetailCopy";
import { getPrimaryNextStatus } from "./orderDetailHelpers";

type OrderNextActionCardProps = {
  order: OrderAdminDetail;
  isPending: boolean;
  cancelNotes: string;
  onCancelNotesChange: (value: string) => void;
  onAdvance: (status: OrderStatus) => void;
  onCancel: () => void;
  canCancel: boolean;
};

export function OrderNextActionCard({
  order,
  isPending,
  cancelNotes,
  onCancelNotesChange,
  onAdvance,
  onCancel,
  canCancel,
}: OrderNextActionCardProps) {
  const copy = getNowCardCopy(order);
  const primary = getPrimaryNextStatus(order);
  const done = order.status === "completed" || order.status === "cancelled";

  return (
    <section
      className={cn(
        "rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-sm)] md:p-6",
        !done && "ring-1 ring-[hsl(var(--primary)/0.12)]",
      )}
    >
      <p className="text-xs font-semibold tracking-wide text-brand uppercase">{copy.title}</p>
      <p className="type-subtitle mt-2 text-[hsl(var(--foreground))]">{copy.body}</p>
      <p className="mt-1.5 text-sm text-[hsl(var(--muted-foreground))]">{copy.emotion}</p>

      {primary ? (
        <Button
          type="button"
          size="lg"
          className="mt-5 h-12 w-full gap-2 sm:w-auto"
          disabled={isPending}
          onClick={() => onAdvance(primary)}
        >
          {PRIMARY_ACTION_LABELS[primary] ?? primary}
        </Button>
      ) : null}

      {canCancel ? (
        <div className="mt-5 space-y-2 border-t border-[hsl(var(--border))] pt-4">
          <Input
            placeholder="Motivo do cancelamento (obrigatório)"
            value={cancelNotes}
            onChange={(event) => onCancelNotesChange(event.target.value)}
          />
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {adminCopy.orders.detail.cancelHint}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending || !cancelNotes.trim()}
            className="text-red-700 hover:bg-red-50"
            onClick={onCancel}
          >
            Cancelar pedido
          </Button>
        </div>
      ) : null}
    </section>
  );
}
