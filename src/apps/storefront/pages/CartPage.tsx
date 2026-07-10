import { ShoppingCart } from "lucide-react";

import { CartPanel } from "@/features/cart";
import { UiHint } from "@/shared/components/UiHint";
import { BackLink, PageHeader } from "@/shared/components/visual";

export function CartPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <BackLink to="/cardapio" label="Continuar comprando" />

      <PageHeader
        variant="hero"
        density="compact"
        mobileHidden
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
