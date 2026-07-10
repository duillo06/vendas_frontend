import { Sparkles } from "lucide-react";
import { Link } from "react-router";

import { useCart } from "@/features/cart";
import { CheckoutForm } from "@/features/checkout";
import { EmptyState } from "@/shared/components/EmptyState";
import { BackLink, PageHeader } from "@/shared/components/visual";
import { Button } from "@/shared/components/ui/button";
import { storefrontCopy } from "@/shared/copy/storefront";

export function CheckoutPage() {
  const { isEmpty } = useCart();

  if (isEmpty) {
    return (
      <div className="space-y-4">
        <BackLink to="/cardapio" label="Ver cardápio" />
        <EmptyState
        title={storefrontCopy.checkout.empty.title}
        description={storefrontCopy.checkout.empty.description}
        action={
          <Link to="/cardapio">
            <Button>Ver cardápio</Button>
          </Link>
        }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <BackLink to="/carrinho" label="Voltar ao carrinho" />

      <PageHeader
        variant="hero"
        density="compact"
        mobileHidden
        accent="chart-1"
        icon={Sparkles}
        title={storefrontCopy.checkout.title}
        subtitle={storefrontCopy.checkout.subtitle}
      />
      <CheckoutForm />
    </div>
  );
}
