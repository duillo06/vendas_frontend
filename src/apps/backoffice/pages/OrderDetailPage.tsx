import { useState } from "react";
import { Package } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import type { OrderStatus } from "@/features/checkout/types/checkout.types";
import { fireFlowConfetti } from "@/features/flow/FlowSuccess";
import { OrderActionPanel } from "@/features/orders/components/order-detail/OrderActionPanel";
import { OrderComandaTicket } from "@/features/orders/components/order-detail/OrderComandaTicket";
import { OrderHeroHeader } from "@/features/orders/components/order-detail/OrderHeroHeader";
import { OrderItemsPanel } from "@/features/orders/components/order-detail/OrderItemsPanel";
import { OrderMobileStickyCta } from "@/features/orders/components/order-detail/OrderMobileStickyCta";
import { buildOrderAlerts } from "@/features/orders/components/order-detail/orderDetailHelpers";
import { useNow } from "@/features/orders/components/order-detail/useNow";
import { useAdminOrder } from "@/features/orders/hooks/useAdminOrder";
import { useUpdateOrderPayment } from "@/features/orders/hooks/useUpdateOrderPayment";
import { useUpdateOrderStatus } from "@/features/orders/hooks/useUpdateOrderStatus";
import { printComandaFromElement } from "@/features/orders/lib/printComandaFromElement";
import { ORDER_NEXT_STATUS } from "@/features/orders/types/order-admin.types";
import { useSettings } from "@/features/settings";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, isError } = useAdminOrder(id, { polling: true });
  const { data: settings } = useSettings();
  const now = useNow(15_000);

  const { mutate: updateStatus, isPending } = useUpdateOrderStatus(order?.id ?? id ?? "");
  const { mutate: updatePayment, isPending: paying } = useUpdateOrderPayment(order?.id ?? id ?? "");
  const [cancelNotes, setCancelNotes] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <div className="grid gap-4 lg:grid-cols-12">
          <Skeleton className="h-72 rounded-2xl lg:col-span-7" />
          <Skeleton className="h-72 rounded-2xl lg:col-span-5" />
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="space-y-4 py-12 text-center">
        <Package className="mx-auto h-10 w-10 text-[hsl(var(--muted-foreground))]" />
        <h1 className="text-xl font-semibold">Pedido não encontrado</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Ele pode ter sido excluído ou o link está inválido.
        </p>
        <Button type="button" onClick={() => navigate("/pedidos")}>
          Voltar aos pedidos
        </Button>
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

  function printComanda() {
    printComandaFromElement(document.getElementById("order-comanda-print"));
  }

  const storeName =
    settings?.company.trade_name?.trim() ||
    settings?.company.legal_name?.trim() ||
    "Pedido";

  return (
    <>
      <div className="space-y-4 pb-24 print:hidden md:pb-6">
        <OrderHeroHeader order={order} />

        {/* estação: comanda ~58% | ação ~42% */}
        <div className="grid items-start gap-4 lg:grid-cols-12 lg:gap-5">
          {/* mobile: ação primeiro */}
          <div className="order-1 lg:order-2 lg:col-span-5">
            <OrderActionPanel
              order={order}
              now={now}
              alerts={alerts}
              isPending={isPending}
              paying={paying}
              cancelNotes={cancelNotes}
              canCancel={canCancel}
              onCancelNotesChange={setCancelNotes}
              onAdvance={advance}
              onCancel={cancelOrder}
              onMarkPaid={() => updatePayment()}
              onPrintComanda={printComanda}
            />
          </div>

          <div className="order-2 lg:order-1 lg:col-span-7">
            <OrderItemsPanel order={order} />
          </div>
        </div>

        <OrderMobileStickyCta order={order} isPending={isPending} onAdvance={advance} />
      </div>

      <OrderComandaTicket
        order={order}
        storeName={storeName}
        storePhone={settings?.company.phone}
        estimatedPrepTime={estimatedPrep}
        printSettings={settings?.settings.print_settings}
      />
    </>
  );
}
