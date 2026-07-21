import { Link } from "react-router";

import type { CartItem } from "../types/cart.types";
import { useCart } from "../hooks/useCart";

import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { Button } from "@/shared/components/ui/button";
import { storefrontCopy } from "@/shared/copy/storefront";
import { resolveMediaUrl } from "@/shared/lib/media";

const PREVIEW_LIMIT = 3;

type CartMiniPreviewProps = {
  onClose: () => void;
};

export function CartMiniPreview({ onClose }: CartMiniPreviewProps) {
  const { items, subtotal, totalItems } = useCart();
  const preview = items.slice(0, PREVIEW_LIMIT);
  const extra = items.length - preview.length;

  return (
    <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[var(--shadow-lg)] animate-fade-up">
      <ul className="divide-y divide-[hsl(var(--border))]">
        {preview.map((item) => (
          <li key={item.id}>
            <MiniRow item={item} />
          </li>
        ))}
      </ul>

      {extra > 0 ? (
        <p className="border-t border-[hsl(var(--border))] px-3 py-2 text-xs text-[hsl(var(--muted-foreground))]">
          +{extra} {extra === 1 ? "item" : "itens"} no carrinho
        </p>
      ) : null}

      <div className="space-y-2 border-t border-[hsl(var(--border))] p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[hsl(var(--muted-foreground))]">
            {totalItems === 1 ? "1 item" : `${totalItems} itens`}
          </span>
          <PriceDisplay value={subtotal} className="font-semibold text-brand" />
        </div>

        <Link to="/carrinho" onClick={onClose} className="block">
          <Button variant="outline" className="w-full" size="sm">
            Ver carrinho completo
          </Button>
        </Link>
        <Link to="/checkout" onClick={onClose} className="block">
          <Button className="w-full whitespace-nowrap" size="sm">
            {storefrontCopy.cart.checkoutCta}
          </Button>
        </Link>
      </div>
    </div>
  );
}

function MiniRow({ item }: { item: CartItem }) {
  const src = resolveMediaUrl(item.imageUrl);
  const lineTotal = item.unitPrice * item.quantity;

  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5">
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-[hsl(var(--muted))]">
        {src ? (
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[9px] text-[hsl(var(--muted-foreground))]">
            —
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-snug">{item.productName}</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          {item.quantity}× · <PriceDisplay value={lineTotal} />
        </p>
      </div>
    </div>
  );
}
