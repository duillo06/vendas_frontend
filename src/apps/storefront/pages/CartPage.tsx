import { ShoppingCart } from "lucide-react";

import { CartPanel } from "@/features/cart";
import { PageHeader } from "@/shared/components/visual";

export function CartPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        density="compact"
        mobileHidden
        accent="chart-2"
        icon={ShoppingCart}
        title="Seu carrinho"
        subtitle="Revise os itens com calma antes de finalizar."
      />
      <CartPanel />
    </div>
  );
}
