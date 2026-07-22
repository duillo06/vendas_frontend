import { Link, useParams } from "react-router";

import { useOrder, OrderTrackingView } from "@/features/orders";
import { EmptyState } from "@/shared/components/EmptyState";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError } = useOrder(id, { polling: true });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <EmptyState
        title="Pedido não encontrado"
        description="Verifique o link ou faça um novo pedido."
        action={
          <Link to="/cardapio">
            <Button variant="outline">Ver cardápio</Button>
          </Link>
        }
      />
    );
  }

  return <OrderTrackingView order={order} />;
}
