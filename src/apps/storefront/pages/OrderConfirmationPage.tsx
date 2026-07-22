import { CheckCircle } from "lucide-react";
import { Link, Navigate, useLocation, useParams } from "react-router";

import type { Order } from "@/features/checkout";
import { MessageTicker } from "@/shared/components/MessageTicker";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { storefrontCopy } from "@/shared/copy/storefront";

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
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="tile-brand flex h-20 w-20 animate-success-pop items-center justify-center rounded-full">
          <CheckCircle className="h-12 w-12 text-brand" />
        </div>
        <h1 className="animate-fade-up text-2xl font-bold" style={{ animationDelay: "80ms" }}>
          {storefrontCopy.order.confirmed.title}
        </h1>
        <p
          className="max-w-md animate-fade-up text-[hsl(var(--muted-foreground))]"
          style={{ animationDelay: "140ms" }}
        >
          {storefrontCopy.order.confirmed.subtitle}
        </p>
        <p
          className="animate-fade-up text-sm text-[hsl(var(--muted-foreground))]"
          style={{ animationDelay: "200ms" }}
        >
          Pedido <strong className="text-[hsl(var(--foreground))]">{orderNumber}</strong>
        </p>
        {total !== undefined ? (
          <p className="animate-fade-up text-lg" style={{ animationDelay: "260ms" }}>
            Total: <PriceDisplay value={total} className="font-semibold text-brand" />
          </p>
        ) : null}
      </div>

      <div className="animate-fade-up w-full" style={{ animationDelay: "320ms" }}>
        <MessageTicker
          messages={[
            `✨ ${storefrontCopy.order.confirmed.detail}`,
            `💛 ${storefrontCopy.order.delivered}`,
          ]}
        />
      </div>

      <Card className="animate-fade-up" style={{ animationDelay: "380ms" }}>
        <CardContent className="space-y-3 p-6 text-left text-sm">
          <p className="font-medium">O que acontece agora?</p>
          <ul className="space-y-2 text-[hsl(var(--muted-foreground))]">
            <li>1. Confirmamos seu pedido com a cozinha</li>
            <li>2. Você acompanha cada etapa em tempo real</li>
            <li>3. Avisamos quando estiver pronto ou a caminho</li>
          </ul>
          {order?.estimated_prep_at ? (
            <p className="border-t border-[hsl(var(--border))] pt-3 text-[hsl(var(--muted-foreground))]">
              Previsão de preparo:{" "}
              <strong className="text-[hsl(var(--foreground))]">
                {new Date(order.estimated_prep_at).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </strong>
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div
        className="animate-fade-up flex flex-col gap-2 sm:flex-row sm:justify-center"
        style={{ animationDelay: "440ms" }}
      >
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
