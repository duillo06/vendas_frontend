import { CheckCircle } from "lucide-react";
import { Link, Navigate, useLocation, useParams } from "react-router";

import type { Order } from "@/features/checkout";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

export function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const order = (location.state as { order?: Order } | null)?.order;

  if (!order && !id) {
    return <Navigate to="/" replace />;
  }

  const orderNumber = order?.order_number ?? "—";
  const total = order?.total;

  return (
    <div className="mx-auto max-w-lg space-y-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <CheckCircle className="h-16 w-16 text-[hsl(var(--primary))]" />
        <h1 className="text-2xl font-bold">Pedido confirmado!</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Recebemos seu pedido <strong>{orderNumber}</strong>
        </p>
        {total !== undefined ? (
          <p className="text-lg">
            Total: <PriceDisplay value={total} className="font-semibold text-[hsl(var(--primary))]" />
          </p>
        ) : null}
      </div>

      <Card>
        <CardContent className="space-y-2 p-6 text-sm text-[hsl(var(--muted-foreground))]">
          <p>Você pode acompanhar o status do pedido em tempo real.</p>
          {order?.estimated_prep_at ? (
            <p>
              Previsão de preparo:{" "}
              {new Date(order.estimated_prep_at).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        {id ? (
          <Link to={`/pedido/${id}`}>
            <Button className="w-full sm:w-auto">Acompanhar pedido</Button>
          </Link>
        ) : null}
        <Link to="/cardapio">
          <Button variant="outline" className="w-full sm:w-auto">
            Voltar ao cardápio
          </Button>
        </Link>
      </div>
    </div>
  );
}
