import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ClipboardList,
  LayoutDashboard,
  ShoppingBag,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router";

import { catalogAdminApi } from "@/features/catalog/api/catalogAdminApi";
import { DashboardPeriodToolbar } from "@/features/dashboard/components/DashboardPeriodToolbar";
import { DashboardWidgetsBoard } from "@/features/dashboard/components/DashboardWidgetsBoard";
import { DeltaStatCard } from "@/features/dashboard/components/DeltaStatCard";
import { InsightStrip } from "@/features/dashboard/components/InsightStrip";
import { DashboardPanel } from "@/features/dashboard/components/DashboardPanel";
import { RecentOrderRow } from "@/features/dashboard/components/RecentOrderRow";
import { SalesTrendChart } from "@/features/dashboard/components/SalesTrendChart";
import { useDashboard } from "@/features/dashboard";
import type { DashboardPeriod, DashboardQuery } from "@/features/dashboard";
import { FirstSetupAssistant } from "@/features/flow/FirstSetupAssistant";
import { FlowEmptyState } from "@/features/flow/FlowEmptyState";
import { FlowOnboarding } from "@/features/flow/FlowOnboarding";
import { useFlowOnboarding } from "@/features/flow/useFlowOnboarding";
import { useSettings } from "@/features/settings";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { PageHeader } from "@/shared/components/visual";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { adminCopy } from "@/shared/copy/admin";
import { formatCurrency } from "@/shared/lib/format";
import type { OrderStatus } from "@/shared/components/OrderStatusBadge";

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function todayIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysAgoIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function trendInsight(deltaPct: number | null, period: DashboardPeriod): string | undefined {
  if (deltaPct === null) return undefined;
  const abs = Math.abs(deltaPct);
  if (abs < 0.5) return "Pedidos estáveis vs período anterior";
  const dir = deltaPct > 0 ? "acima" : "abaixo";
  const vs =
    period === "today"
      ? "ontem"
      : period === "7d"
        ? "7 dias anteriores"
        : period === "30d"
          ? "30 dias anteriores"
          : "período anterior";
  return `Pedidos ${abs.toFixed(0)}% ${dir} de ${vs}`;
}

export function DashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>("30d");
  const [rangeFrom, setRangeFrom] = useState(() => daysAgoIso(29));
  const [rangeTo, setRangeTo] = useState(() => todayIso());

  const query: DashboardQuery =
    period === "custom"
      ? { period: "custom", from: rangeFrom, to: rangeTo }
      : { period };

  const { data, isLoading, isError } = useDashboard(query);
  const { data: settingsData } = useSettings();
  const { data: productsPage } = useQuery({
    queryKey: ["admin", "products", "dashboard-empty-check"],
    queryFn: () => catalogAdminApi.listProducts({ page_size: "1" }),
    staleTime: 1000 * 60 * 2,
  });
  const navigate = useNavigate();
  const onboarding = useFlowOnboarding();
  const [greeting, setGreeting] = useState("Olá");
  const [firstSetupOpen, setFirstSetupOpen] = useState(true);

  const setupPending = settingsData?.settings.setup?.status === "pending";
  const showFirstSetup = Boolean(setupPending && firstSetupOpen);
  const showFlowTour = !setupPending && onboarding.open;
  const hasProducts = (productsPage?.count ?? productsPage?.results?.length ?? 0) > 0;

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Bom dia");
    else if (hour < 18) setGreeting("Boa tarde");
    else setGreeting("Boa noite");
  }, []);

  const pendingOrders = data?.operational?.pending_orders ?? data?.today.pending_orders ?? 0;
  const preparingOrders = data?.operational?.preparing_orders ?? data?.today.preparing_orders ?? 0;
  const kpis = data?.kpis;

  const insightLines = useMemo(() => {
    if (!data || !kpis) return [];
    const lines: string[] = [];
    const copy = adminCopy.dashboard.insights;

    if (pendingOrders > 0) lines.push(copy.pending(pendingOrders));

    if (kpis.orders.value === 0) {
      lines.push(period === "today" ? copy.noOrdersYet : copy.noOrdersPeriod);
    } else {
      lines.push(copy.ordersInPeriod(kpis.orders.value, period));
    }

    if (kpis.average_ticket.value > 0) {
      lines.push(copy.ticket(formatCurrency(kpis.average_ticket.value)));
    }

    const revDelta = kpis.revenue.delta_pct;
    if (revDelta !== null && Math.abs(kpis.revenue.value - kpis.revenue.previous) >= 0.01) {
      const diff = Math.abs(kpis.revenue.value - kpis.revenue.previous);
      if (revDelta > 0) lines.push(copy.revenueUp(formatCurrency(diff), period));
      else lines.push(copy.revenueDown(formatCurrency(diff), period));
    }

    return lines.slice(0, 3);
  }, [data, kpis, pendingOrders, period]);

  const hasPatternData = Boolean(
    data &&
      (data.kpis.revenue.value > 0 ||
        data.by_weekday.best_orders > 0 ||
        data.by_payment_method.length > 0),
  );

  const recentOrders = data?.recent_orders.slice(0, 8) ?? [];
  const seriesInsight = data ? trendInsight(data.kpis.orders.delta_pct, period) : undefined;
  const kpiLabels = adminCopy.dashboard.kpiLabels(period);

  function handlePreset(next: Exclude<DashboardPeriod, "custom">) {
    setPeriod(next);
    if (next === "today") {
      setRangeFrom(todayIso());
      setRangeTo(todayIso());
    } else if (next === "7d") {
      setRangeFrom(daysAgoIso(6));
      setRangeTo(todayIso());
    } else {
      setRangeFrom(daysAgoIso(29));
      setRangeTo(todayIso());
    }
  }

  function handleCustomChange(from: string, to: string) {
    setRangeFrom(from);
    setRangeTo(to);
    if (from && to) setPeriod("custom");
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <FirstSetupAssistant
        open={showFirstSetup}
        onClose={() => setFirstSetupOpen(false)}
        onFinished={(result) => {
          setFirstSetupOpen(false);
          onboarding.dismiss();
          if (result) navigate("/produtos/novo");
        }}
      />

      <FlowOnboarding
        open={showFlowTour}
        onClose={onboarding.dismiss}
        onStart={() => {
          onboarding.dismiss();
          navigate("/produtos/novo");
        }}
      />

      <div className="space-y-2">
        <PageHeader
          title="Dashboard"
          subtitle={adminCopy.dashboard.subtitle(greeting, period)}
          icon={LayoutDashboard}
          density="compact"
        />
        <DashboardPeriodToolbar
          period={period}
          from={rangeFrom}
          to={rangeTo}
          onPreset={handlePreset}
          onCustomChange={handleCustomChange}
        />
      </div>

      {isError ? (
        <p className="text-sm text-red-600">Não foi possível carregar o dashboard. Tente atualizar a página.</p>
      ) : null}

      {!isLoading && insightLines.length > 0 ? (
        <InsightStrip lines={insightLines} pendingOrders={pendingOrders} />
      ) : null}

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <DeltaStatCard
          label={kpiLabels.orders}
          icon={ShoppingBag}
          accent="chart-1"
          highlight={pendingOrders > 0}
          deltaPct={kpis?.orders.delta_pct ?? null}
          value={isLoading || !kpis ? <Skeleton className="h-7 w-12" /> : kpis.orders.value}
          hint={
            isLoading ? (
              <Skeleton className="h-3 w-20" />
            ) : (
              `${pendingOrders} pend. · ${preparingOrders} preparo`
            )
          }
        />
        <DeltaStatCard
          label={kpiLabels.revenue}
          icon={TrendingUp}
          accent="chart-3"
          highlight
          deltaPct={kpis?.revenue.delta_pct ?? null}
          value={
            isLoading || !kpis ? <Skeleton className="h-7 w-20" /> : <PriceDisplay value={kpis.revenue.value} />
          }
          hint={adminCopy.dashboard.metrics.revenue}
        />
        <DeltaStatCard
          label={kpiLabels.ticket}
          icon={TrendingUp}
          accent="chart-4"
          deltaPct={kpis?.average_ticket.delta_pct ?? null}
          value={
            isLoading || !kpis ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <PriceDisplay value={kpis.average_ticket.value} />
            )
          }
          hint={adminCopy.dashboard.metrics.ticket}
        />
        <DeltaStatCard
          label={kpiLabels.cancelled}
          icon={XCircle}
          accent="chart-2"
          neutralDelta
          deltaPct={kpis?.cancellation_rate?.delta_pct ?? kpis?.cancelled.delta_pct ?? null}
          value={
            isLoading || !kpis ? (
              <Skeleton className="h-7 w-10" />
            ) : (
              `${(kpis.cancellation_rate?.value ?? 0).toFixed(1)}%`
            )
          }
          hint={
            isLoading || !kpis
              ? adminCopy.dashboard.metrics.cancelled
              : `${kpis.cancelled.value} cancelados · ${adminCopy.dashboard.metrics.cancelled}`
          }
        />
      </div>

      {/* fila + vendas na mesma linha */}
      <div className="grid gap-3 md:grid-cols-3">
        <DashboardPanel
          className="md:col-span-1"
          title="Pedidos recentes"
          contentClassName="px-0 pb-2 pt-1"
          action={
            <Link to="/pedidos">
              <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs">
                Ver todos
              </Button>
            </Link>
          }
        >
          {isLoading ? (
            <div className="space-y-2 px-4 py-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : recentOrders.length ? (
            <ul>
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <RecentOrderRow
                    id={order.id}
                    orderNumber={order.order_number}
                    customerName={order.customer_name}
                    createdAt={formatTime(order.created_at)}
                    status={order.status as OrderStatus}
                    total={order.total}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 pb-2">
              <FlowEmptyState
                line={{
                  emoji: "🌱",
                  title: adminCopy.dashboard.emptyOrders.title,
                  text: adminCopy.dashboard.emptyOrders.description,
                  mood: "idle",
                }}
                action={
                  hasProducts ? (
                    <Button type="button" size="sm" onClick={() => navigate("/pedidos")} className="gap-2">
                      <ClipboardList className="h-4 w-4" />
                      {adminCopy.dashboard.emptyOrders.ctaViewOrders}
                    </Button>
                  ) : (
                    <Button type="button" size="sm" onClick={() => navigate("/produtos/novo")} className="gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      {adminCopy.dashboard.emptyOrders.ctaCreateProduct}
                    </Button>
                  )
                }
              />
            </div>
          )}
        </DashboardPanel>

        <DashboardPanel className="md:col-span-2" title={adminCopy.dashboard.pattern.salesTitle}>
          {isLoading ? (
            <Skeleton className="h-44 w-full" />
          ) : !hasPatternData ? (
            <p className="py-10 text-center text-xs text-[hsl(var(--muted-foreground))]">
              {adminCopy.dashboard.pattern.emptyDescription}
            </p>
          ) : (
            <SalesTrendChart
              current={data!.series.current}
              previous={data!.series.previous}
              insight={seriesInsight}
            />
          )}
        </DashboardPanel>
      </div>

      {isLoading ? (
        <Skeleton className="h-56 w-full rounded-xl" />
      ) : !hasPatternData ? (
        <Card className="border-dashed">
          <CardContent className="p-4">
            <FlowEmptyState
              line={{
                emoji: "📈",
                title: adminCopy.dashboard.pattern.emptyTitle,
                text: adminCopy.dashboard.pattern.emptyDescription,
                mood: "idle",
              }}
              action={
                <Button type="button" variant="outline" size="sm" onClick={() => navigate("/pedidos")}>
                  {adminCopy.dashboard.pattern.emptyCta}
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <DashboardWidgetsBoard data={data!} />
      )}
    </div>
  );
}
