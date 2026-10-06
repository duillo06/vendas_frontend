import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, EyeOff, GripVertical, LayoutGrid, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { CustomerSplitCard } from "@/features/dashboard/components/CustomerSplitCard";
import { dashboardPanelShellClass } from "@/features/dashboard/components/DashboardPanel";
import { DeliveryMixChart } from "@/features/dashboard/components/DeliveryMixChart";
import { HoursChart } from "@/features/dashboard/components/HoursChart";
import { PaymentsChart } from "@/features/dashboard/components/PaymentsChart";
import { ProductRankList } from "@/features/dashboard/components/ProductRankList";
import { WeekdaysChart } from "@/features/dashboard/components/WeekdaysChart";
import {
  WIDGET_LABELS,
  type DashboardWidgetId,
} from "@/features/dashboard/constants/widgets";
import { useDashboardPreferences } from "@/features/dashboard/hooks/useDashboardPreferences";
import type { DashboardData } from "@/features/dashboard/types/dashboard.types";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { adminCopy } from "@/shared/copy/admin";

type DashboardWidgetsBoardProps = {
  data: DashboardData;
};

function widgetSpan(_id: DashboardWidgetId) {
  return "md:col-span-1";
}

function WidgetBody({ id, data }: { id: DashboardWidgetId; data: DashboardData }) {
  switch (id) {
    case "hours":
      return (
        <HoursChart
          weekday={data.by_hour.weekday}
          weekend={data.by_hour.weekend}
          peakSlot={data.by_hour.peak_slot}
          peakOrders={data.by_hour.peak_orders}
        />
      );
    case "days":
      return (
        <WeekdaysChart
          days={data.by_weekday.days}
          bestWeekday={data.by_weekday.best_weekday}
          bestOrders={data.by_weekday.best_orders}
        />
      );
    case "payments":
      return <PaymentsChart methods={data.by_payment_method} />;
    case "top_products":
      return (
        <ProductRankList
          mode="top"
          items={data.top_products}
          insight={
            data.top_products[0]
              ? `${data.top_products[0].name} lidera com ${data.top_products[0].quantity} un.`
              : undefined
          }
        />
      );
    case "slow_products":
      return <ProductRankList mode="slow" items={data.slow_products} />;
    case "delivery":
      return <DeliveryMixChart mix={data.by_delivery_type} />;
    case "customers":
      return <CustomerSplitCard customers={data.customers} />;
    default:
      return null;
  }
}

function SortableWidget({
  id,
  title,
  organizing,
  hidden,
  onToggleHidden,
  children,
}: {
  id: DashboardWidgetId;
  title: string;
  organizing: boolean;
  hidden: boolean;
  onToggleHidden: () => void;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !organizing,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(widgetSpan(id), isDragging && "z-20 opacity-40")}
    >
      <Card
        className={cn(
          dashboardPanelShellClass,
          "h-full",
          organizing && "ring-1 ring-[hsl(var(--primary)/0.22)] hover:translate-y-0",
          isDragging && "shadow-lg ring-2 ring-[hsl(var(--primary)/0.35)] hover:translate-y-0",
          hidden && organizing && "opacity-55",
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 px-4 pb-0 pt-3.5">
          <div className="flex min-w-0 items-start gap-1.5">
            {organizing ? (
              <button
                type="button"
                className="mt-0.5 flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-md text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] active:cursor-grabbing"
                aria-label={`Arrastar ${title}`}
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-4 w-4" />
              </button>
            ) : null}
            <div className="min-w-0 space-y-1.5">
              <CardTitle className="truncate text-sm font-semibold tracking-tight">{title}</CardTitle>
              <div className="h-0.5 w-7 rounded-full bg-brand/75" aria-hidden />
            </div>
          </div>
          {organizing ? (
            <button
              type="button"
              onClick={onToggleHidden}
              className="flex h-8 w-8 items-center justify-center rounded-md text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-brand"
              aria-label={hidden ? `Mostrar ${title}` : `Ocultar ${title}`}
              title={hidden ? "Mostrar" : "Ocultar"}
            >
              {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          ) : null}
        </CardHeader>
        <CardContent className={cn("px-4 pb-4 pt-3", hidden && organizing && "pointer-events-none blur-[1px]")}>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardWidgetsBoard({ data }: DashboardWidgetsBoardProps) {
  const { prefs, isSaving, saveOrder, toggleHidden, reset } = useDashboardPreferences();
  const [organizing, setOrganizing] = useState(false);
  const [activeId, setActiveId] = useState<DashboardWidgetId | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
  );

  const visibleOrder = useMemo(() => {
    if (organizing) return prefs.widget_order;
    return prefs.widget_order.filter((id) => !prefs.hidden_widgets.includes(id));
  }, [organizing, prefs.hidden_widgets, prefs.widget_order]);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as DashboardWidgetId);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = prefs.widget_order.indexOf(active.id as DashboardWidgetId);
    const newIndex = prefs.widget_order.indexOf(over.id as DashboardWidgetId);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(prefs.widget_order, oldIndex, newIndex);
    saveOrder(next);
    toast.success("Layout salvo", { description: "Sua ordem fica nesse usuário." });
  }

  function titleFor(id: DashboardWidgetId) {
    if (id === "hours") return adminCopy.dashboard.pattern.hoursTitle;
    if (id === "days") return adminCopy.dashboard.pattern.daysTitle;
    if (id === "payments") return adminCopy.dashboard.pattern.paymentsTitle;
    if (id === "top_products") return adminCopy.dashboard.pattern.topProductsTitle;
    if (id === "slow_products") return adminCopy.dashboard.pattern.slowProductsTitle;
    if (id === "delivery") return adminCopy.dashboard.pattern.deliveryTitle;
    if (id === "customers") return adminCopy.dashboard.pattern.customersTitle;
    return WIDGET_LABELS[id];
  }

  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight">{adminCopy.dashboard.pattern.title}</h2>
          <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
            {organizing
              ? "Arraste pelos ··· e oculte o que não usa — salvamos na sua conta."
              : adminCopy.dashboard.pattern.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {organizing ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-2 text-xs"
              onClick={() => {
                reset();
              }}
              disabled={isSaving}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Padrão
            </Button>
          ) : null}
          <Button
            type="button"
            variant={organizing ? "default" : "outline"}
            size="sm"
            className={cn("h-8 gap-1.5 px-2.5 text-xs", organizing && "bg-brand")}
            onClick={() => {
              setOrganizing((v) => {
                const next = !v;
                if (next) toast.message("Modo organizar", { description: "Segure o ··· e arraste." });
                return next;
              });
            }}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            {organizing ? "Concluir" : "Organizar"}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {organizing ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mb-2 rounded-lg border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.06)] px-3 py-2 text-xs text-[hsl(var(--foreground))]">
              Layout premium: ordem e visibilidade ficam salvos no seu usuário — em qualquer
              dispositivo depois do login.
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext items={visibleOrder} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {visibleOrder.map((id) => (
              <SortableWidget
                key={id}
                id={id}
                title={titleFor(id)}
                organizing={organizing}
                hidden={prefs.hidden_widgets.includes(id)}
                onToggleHidden={() => toggleHidden(id)}
              >
                <WidgetBody id={id} data={data} />
              </SortableWidget>
            ))}
          </div>
        </SortableContext>

        <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.2, 0, 0, 1)" }}>
          {activeId ? (
            <Card className={cn(dashboardPanelShellClass, "scale-[1.02] border-[hsl(var(--primary)/0.35)] shadow-xl hover:translate-y-0")}>
              <CardHeader className="px-4 pb-0 pt-3.5">
                <div className="space-y-1.5">
                  <CardTitle className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
                    <GripVertical className="h-4 w-4 text-brand" />
                    {titleFor(activeId)}
                  </CardTitle>
                  <div className="h-0.5 w-7 rounded-full bg-brand/75" aria-hidden />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-3 opacity-80">
                <div className="h-24 rounded-md bg-[hsl(var(--muted))]/50" />
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </section>
  );
}
