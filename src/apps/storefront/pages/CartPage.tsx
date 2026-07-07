import { ShoppingCart } from "lucide-react";
import { Link } from "react-router";

import { EmptyState } from "@/shared/components/EmptyState";
import { Button } from "@/shared/components/ui/button";

export function CartPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Carrinho</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Zustand + persistência — Sprint 6</p>
      </div>

      <EmptyState
        icon={ShoppingCart}
        title="Seu carrinho está vazio"
        description="Adicionar itens, editar quantidades e ver subtotal entra na Sprint 6."
        action={
          <Link to="/cardapio">
            <Button variant="outline">Ir ao cardápio</Button>
          </Link>
        }
      />
    </div>
  );
}
