import { useEffect, useState } from "react";

import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { OrderStatusBadge, type OrderStatus } from "@/shared/components/OrderStatusBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

import { useDashboard } from "@/features/dashboard";

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function DashboardPage() {
  const { data, isLoading, isError } = useDashboard();
  const [greeting, setGreeting] = useState("Olá");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Bom dia");
    } else if (hour < 18) {
      setGreeting("Boa tarde");
    } else {
      setGreeting("Boa noite");
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-[hsl(var(--muted-foreground))]">{greeting}!</p>
      </div>

      {isError ? (
        <p className="text-sm text-red-600">Não foi possível carregar o dashboard.</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pedidos hoje</CardDescription>
            <CardTitle className="text-3xl">
              {isLoading ? <Skeleton className="h-9 w-16" /> : (data?.today.total_orders ?? 0)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-[hsl(var(--muted-foreground))]">
            {isLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <>
                {data?.today.pending_orders ?? 0} pendentes · {data?.today.preparing_orders ?? 0} em
                preparo
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Faturamento</CardDescription>
            <CardTitle className="text-3xl">
              {isLoading ? (
                <Skeleton className="h-9 w-28" />
              ) : (
                <PriceDisplay value={data?.today.revenue ?? 0} />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-[hsl(var(--muted-foreground))]">
            {isLoading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <>{data?.today.completed_orders ?? 0} concluídos</>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ticket médio</CardDescription>
            <CardTitle className="text-3xl">
              {isLoading ? (
                <Skeleton className="h-9 w-24" />
              ) : (
                <PriceDisplay value={data?.today.average_ticket ?? 0} />
              )}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cancelados</CardDescription>
            <CardTitle className="text-3xl">
              {isLoading ? (
                <Skeleton className="h-9 w-12" />
              ) : (
                (data?.today.cancelled_orders ?? 0)
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pedidos recentes</CardTitle>
          <CardDescription>Últimos pedidos de hoje</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : data?.recent_orders.length ? (
            <ul className="divide-y divide-[hsl(var(--border))]">
              {data.recent_orders.map((order) => (
                <li
                  key={order.id}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {order.order_number} — {order.customer_name}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {formatTime(order.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <OrderStatusBadge status={order.status as OrderStatus} />
                    <PriceDisplay value={order.total} className="font-semibold" />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Nenhum pedido hoje ainda.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
