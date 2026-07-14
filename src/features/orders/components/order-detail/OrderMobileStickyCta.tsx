import type { OrderStatus } from "@/features/checkout/types/checkout.types";
import type { OrderAdminDetail } from "@/features/orders/types/order-admin.types";
import { Button } from "@/shared/components/ui/button";

import { PRIMARY_ACTION_LABELS } from "./orderDetailCopy";
import { getPrimaryNextStatus } from "./orderDetailHelpers";

type OrderMobileStickyCtaProps = {
  order: OrderAdminDetail;
  isPending: boolean;
  onAdvance: (status: OrderStatus) => void;
};

export function OrderMobileStickyCta({ order, isPending, onAdvance }: OrderMobileStickyCtaProps) {
  const primary = getPrimaryNextStatus(order);
  if (!primary) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] backdrop-blur md:hidden">
      <Button
        type="button"
        size="lg"
        className="h-12 w-full text-base shadow-[var(--shadow-md)]"
        disabled={isPending}
        onClick={() => onAdvance(primary)}
      >
        {PRIMARY_ACTION_LABELS[primary] ?? primary}
      </Button>
    </div>
  );
}
