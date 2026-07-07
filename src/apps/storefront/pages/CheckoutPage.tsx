import { useCart } from "@/features/cart";
import { CheckoutForm } from "@/features/checkout";
import { EmptyState } from "@/shared/components/EmptyState";
import { Button } from "@/shared/components/ui/button";
import { Link } from "react-router";

export function CheckoutPage() {
  const { isEmpty } = useCart();

  if (isEmpty) {
    return (
      <EmptyState
        title="Carrinho vazio"
        description="Adicione itens antes de finalizar o pedido."
        action={
          <Link to="/cardapio">
            <Button>Ver cardápio</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Finalize seu pedido em poucos passos</p>
      </div>
      <CheckoutForm />
    </div>
  );
}
