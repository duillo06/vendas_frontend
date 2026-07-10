import { Link } from "react-router";
import { Plus } from "lucide-react";

import { useAddToCart } from "@/features/cart";
import type { ProductListItem } from "@/features/catalog/types/catalog.types";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { storefrontCopy } from "@/shared/copy/storefront";

const UPSELL_KEYWORDS = [
  { pattern: /refrigerante|suco|água|agua|cerveja|bebida/i, emoji: "🥤", label: "Bebidas" },
  { pattern: /batata|fritas|acompanhamento/i, emoji: "🍟", label: "Acompanhamentos" },
  { pattern: /sobremesa|doce|brownie|pudim|sorvete/i, emoji: "🍰", label: "Sobremesas" },
];

type CartUpsellProps = {
  products: ProductListItem[];
  cartProductIds: string[];
};

export function CartUpsell({ products, cartProductIds }: CartUpsellProps) {
  const addToCart = useAddToCart();

  const suggestions = products
    .filter((product) => product.is_available && !cartProductIds.includes(product.id) && !product.has_options)
    .filter((product) =>
      UPSELL_KEYWORDS.some((rule) => rule.pattern.test(`${product.name} ${product.category.name}`)),
    )
    .slice(0, 3);

  if (!suggestions.length) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-2xl border border-brand-soft bg-gradient-to-br from-[hsl(var(--primary-soft))] to-white p-4">
      <div>
        <p className="font-semibold">{storefrontCopy.cart.upsellTitle}</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{storefrontCopy.cart.upsellHint}</p>
      </div>
      <ul className="space-y-2">
        {suggestions.map((product) => {
          const rule = UPSELL_KEYWORDS.find((entry) =>
            entry.pattern.test(`${product.name} ${product.category.name}`),
          );
          return (
            <li
              key={product.id}
              className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-white/80 p-3 transition hover:border-brand-soft"
            >
              {product.image_url ? (
                <img src={product.image_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-soft text-lg">
                  {rule?.emoji ?? "✨"}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <Link to={`/produto/${product.slug}`} className="block truncate font-medium hover:text-brand">
                  {product.name}
                </Link>
                <PriceDisplay value={product.base_price} className="text-sm font-semibold text-brand" />
              </div>
              <button
                type="button"
                aria-label={`Adicionar ${product.name}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-[hsl(var(--primary-foreground))] shadow-sm transition hover:scale-105"
                onClick={() =>
                  addToCart({
                    productId: product.id,
                    productSlug: product.slug,
                    productName: product.name,
                    imageUrl: product.image_url,
                    basePrice: product.base_price,
                    unitPrice: product.base_price,
                    selectedOptions: [],
                  })
                }
              >
                <Plus className="h-4 w-4" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
