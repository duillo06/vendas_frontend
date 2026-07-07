import { Package } from "lucide-react";

import { EmptyState } from "@/shared/components/EmptyState";
import { ProductCard } from "@/shared/components/ProductCard";

export function ProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Produtos</h1>
        <p className="text-[hsl(var(--muted-foreground))]">CRUD do catálogo — Sprint 9</p>
      </div>

      <div className="max-w-xs opacity-60">
        <ProductCard
          name="X-Burger"
          description="Preview do componente ProductCard"
          price={24.9}
          badge="Exemplo"
        />
      </div>

      <EmptyState
        icon={Package}
        title="Catálogo no backoffice em breve"
        description="O CRUD completo de produtos, categorias e opções vem na Sprint 9."
      />
    </div>
  );
}
