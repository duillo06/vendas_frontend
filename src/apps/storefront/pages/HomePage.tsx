import { Link } from "react-router";

import { ProductCard } from "@/shared/components/ProductCard";
import { Button } from "@/shared/components/ui/button";

export function HomePage() {
  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Cardápio digital</h1>
        <p className="max-w-xl text-[hsl(var(--muted-foreground))]">
          Peça online com delivery ou retirada. O cardápio completo com API entra na Sprint 5.
        </p>
        <Link to="/cardapio">
          <Button>Ver cardápio</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ProductCard name="X-Burger" description="Preview do design system" price={24.9} badge="Destaque" />
        <ProductCard name="Refrigerante" description="350ml" price={6.5} />
        <ProductCard name="Sobremesa" description="Em breve" price={12} unavailable />
      </div>
    </section>
  );
}
