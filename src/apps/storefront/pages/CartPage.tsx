import { ShoppingCart } from "lucide-react";

import { CartPanel } from "@/features/cart";
import { UiHint } from "@/shared/components/UiHint";
import { PageHeader } from "@/shared/components/visual";

export function CartPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        variant="hero"
        accent="chart-2"
        icon={ShoppingCart}
        title="Seu carrinho"
        subtitle="Revise os itens com calma antes de finalizar."
      />
      <UiHint tone="info">
        Você pode ajustar quantidades ou remover itens — nada é cobrado até confirmar o pedido.
      </UiHint>
      <CartPanel />
    </div>
  );
}
