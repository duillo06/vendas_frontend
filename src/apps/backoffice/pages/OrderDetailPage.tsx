import { useState } from "react";
import { useParams } from "react-router";

import type { OrderStatus } from "@/features/checkout/types/checkout.types";
import { fireFlowConfetti } from "@/features/flow/FlowSuccess";
import { OrderAlerts } from "@/features/orders/components/order-detail/OrderAlerts";
import { OrderEventTimeline } from "@/features/orders/components/order-detail/OrderEventTimeline";
import { OrderHeroHeader } from "@/features/orders/components/order-detail/OrderHeroHeader";
import { OrderItemsPanel } from "@/features/orders/components/order-detail/OrderItemsPanel";
import { OrderMobileStickyCta } from "@/features/orders/components/order-detail/OrderMobileStickyCta";
import { OrderNextActionCard } from "@/features/orders/components/order-detail/OrderNextActionCard";
import { OrderProgressRail } from "@/features/orders/components/order-detail/OrderProgressRail";
import { OrderQuickActions } from "@/features/orders/components/order-detail/OrderQuickActions";
import { OrderSidePanel } from "@/features/orders/components/order-detail/OrderSidePanel";
import { buildOrderAlerts } from "@/features/orders/components/order-detail/orderDetailHelpers";
import { useNow } from "@/features/orders/components/order-detail/useNow";
import { useAdminOrder } from "@/features/orders/hooks/useAdminOrder";
import { useUpdateOrderPayment } from "@/features/orders/hooks/useUpdateOrderPayment";
import { useUpdateOrderStatus } from "@/features/orders/hooks/useUpdateOrderStatus";
import { ORDER_NEXT_STATUS } from "@/features/orders/types/order-admin.types";
import { useSettings } from "@/features/settings";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useAdminOrder(id, { polling: true });
  const { data: settings } = useSettings();
  const now = useNow(15_000);

  const { mutate: updateStatus, isPending } = useUpdateOrderStatus(order?.id ?? id ?? "");
  const { mutate: updatePayment, isPending: paying } = useUpdateOrderPayment(order?.id ?? id ?? "");
  const [cancelNotes, setCancelNotes] = useState("");

  if (isLoading || !order) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid gap-4 xl:grid-cols-12">
          <Skeleton className="h-64 rounded-2xl xl:col-span-8" />
          <Skeleton className="h-64 rounded-2xl xl:col-span-4" />
        </div>
      </div>
    );
  }

  const estimatedPrep = settings?.settings.estimated_prep_time ?? 30;
  const alerts = buildOrderAlerts(order, now, estimatedPrep);
  const canCancel = (ORDER_NEXT_STATUS[order.status] ?? []).includes("cancelled");

  function advance(status: OrderStatus) {
    if (status === "cancelled") return;
    updateStatus(
      { status },
      {
        onSuccess: () => {
          if (status === "completed") fireFlowConfetti();
        },
      },
    );
  }

  function cancelOrder() {
    if (!cancelNotes.trim()) return;
    updateStatus({ status: "cancelled", notes: cancelNotes.trim() });
  }

  return (
    <div className="space-y-5 pb-24 print:pb-0 md:pb-6">
      <OrderHeroHeader order={order} now={now} isPending={isPending} onAdvance={advance} />

      <OrderAlerts alerts={alerts} />

      <OrderProgressRail order={order} />

      <OrderQuickActions order={order} />

      <OrderNextActionCard
        order={order}
        isPending={isPending}
        cancelNotes={cancelNotes}
        onCancelNotesChange={setCancelNotes}
        onAdvance={advance}
        onCancel={cancelOrder}
        canCancel={canCancel}
      />

      <div className="grid gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-8">
          <OrderItemsPanel order={order} />
          <OrderEventTimeline order={order} />
        </div>
        <div className="xl:col-span-4">
          <OrderSidePanel
            order={order}
            now={now}
            paying={paying}
            onMarkPaid={() => updatePayment()}
          />
        </div>
      </div>

      <OrderMobileStickyCta order={order} isPending={isPending} onAdvance={advance} />
    </div>
  );
}
