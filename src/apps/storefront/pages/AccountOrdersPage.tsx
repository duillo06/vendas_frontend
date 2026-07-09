import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";

import { customerAuthApi } from "@/features/customer-auth";
import { OrderStatusBadge, type OrderStatus } from "@/shared/components/OrderStatusBadge";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { storefrontCopy } from "@/shared/copy/storefront";

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function AccountOrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["account", "orders"],
    queryFn: () => customerAuthApi.listOrders(),
  });

  const orders = data?.results ?? [];

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="space-y-2">
        <Link to="/conta" className="text-sm text-brand hover:underline">
          ← Minha conta
        </Link>
        <h1 className="text-2xl font-bold">{storefrontCopy.account.ordersTitle}</h1>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : orders.length ? (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link to={`/pedido/${order.id}`}>
                <Card className="transition-colors hover:border-[hsl(var(--primary)/0.35)]">
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div className="space-y-1">
                      <p className="font-semibold">{order.order_number}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {formatDateTime(order.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status as OrderStatus} />
                      <PriceDisplay value={order.total} className="font-semibold" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-[hsl(var(--border))] px-6 py-12 text-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {storefrontCopy.account.ordersEmpty}
          </p>
          <Link to="/cardapio">
            <Button type="button" className="mt-4">
              Ver cardápio
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
