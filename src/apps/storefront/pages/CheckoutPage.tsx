import { Sparkles } from "lucide-react";
import { Link } from "react-router";

import { useCart } from "@/features/cart";
import { CheckoutForm } from "@/features/checkout";
import { EmptyState } from "@/shared/components/EmptyState";
import { PageHeader } from "@/shared/components/visual";
import { Button } from "@/shared/components/ui/button";
import { storefrontCopy } from "@/shared/copy/storefront";

export function CheckoutPage() {
  const { isEmpty } = useCart();

  if (isEmpty) {
    return (
      <EmptyState
        title={storefrontCopy.checkout.empty.title}
        description={storefrontCopy.checkout.empty.description}
        action={
          <Link to="/cardapio">
            <Button>Ver cardápio</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
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
