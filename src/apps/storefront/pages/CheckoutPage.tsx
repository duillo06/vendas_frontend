import { CreditCard } from "lucide-react";

import { EmptyState } from "@/shared/components/EmptyState";

export function CheckoutPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Guest checkout com stepper — Sprint 7</p>
      </div>

      <EmptyState
        icon={CreditCard}
        title="Checkout em breve"
        description="Nome, telefone, entrega/retirada, pagamento e criação do pedido vêm na Sprint 7."
      />
    </div>
  );
}
