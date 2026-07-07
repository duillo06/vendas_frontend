import { CartPanel } from "@/features/cart";

export function CartPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Carrinho</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Revise os itens antes do checkout</p>
      </div>

      <CartPanel />
    </div>
  );
}
