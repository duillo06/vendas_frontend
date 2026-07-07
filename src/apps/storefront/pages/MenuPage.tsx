import { UtensilsCrossed } from "lucide-react";

import { EmptyState } from "@/shared/components/EmptyState";
import { ProductCard } from "@/shared/components/ProductCard";

export function MenuPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cardápio</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Listagem com API pública — Sprint 5</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ProductCard name="X-Burger" description="Hambúrguer artesanal" price={24.9} />
        <ProductCard name="Batata frita" description="Porção média" price={14.9} />
        <ProductCard name="Suco natural" description="Laranja 500ml" price={9.9} />
      </div>

      <EmptyState
        icon={UtensilsCrossed}
        title="Dados reais na Sprint 5"
        description="Aqui vão categorias, filtros e página de produto com opções."
      />
    </div>
  );
}
