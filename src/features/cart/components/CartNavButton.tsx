import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ShoppingCart } from "lucide-react";

import { useCart } from "../hooks/useCart";
import { CartPanel } from "./CartPanel";

import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { Button } from "@/shared/components/ui/button";
import { Sheet, SheetContent } from "@/shared/components/ui/sheet";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { cn } from "@/shared/lib/utils";

export function CartNavButton() {
  const { totalItems, subtotal } = useCart();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (totalItems <= 0) return;
    setBump(true);
    const id = window.setTimeout(() => setBump(false), 420);
    return () => window.clearTimeout(id);
  }, [totalItems]);

  const summary =
    totalItems > 0 ? (
      <span className="hidden tabular-nums sm:inline">
        <PriceDisplay value={subtotal} />
      </span>
    ) : (
      <span className="hidden sm:inline">Carrinho</span>
    );

  const badge =
    totalItems > 0 ? (
      <span
        className={cn(
          "absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[hsl(var(--accent))] px-1 text-[10px] font-bold text-white shadow-[var(--shadow-xs)]",
          bump && "animate-heart-pop",
        )}
      >
        {totalItems > 99 ? "99+" : totalItems}
      </span>
    ) : null;

  if (isMobile) {
    return (
      <>
        <Button
          type="button"
          variant={totalItems > 0 ? "default" : "outline"}
          size="sm"
          className={cn(
            "relative min-h-10 gap-2 transition-transform duration-200",
            totalItems > 0 && "bg-brand hover:brightness-95",
            bump && "scale-105",
          )}
          aria-label={`Carrinho${totalItems > 0 ? `, ${totalItems} itens, ${subtotal}` : ""}`}
          onClick={() => setOpen(true)}
        >
          <ShoppingCart className="h-4 w-4" />
          {totalItems > 0 ? (
            <span className="text-xs font-semibold tabular-nums">
              <PriceDisplay value={subtotal} />
            </span>
          ) : (
            <span className="sr-only">Carrinho</span>
          )}
          {badge}
        </Button>

        <Sheet open={open} onOpenChange={setOpen} side="bottom">
          <SheetContent title="Carrinho" onClose={() => setOpen(false)}>
            <CartPanel compact onClose={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <Link to="/carrinho" className="relative inline-flex">
      <Button
        variant={totalItems > 0 ? "default" : "outline"}
        size="sm"
        className={cn(
          "min-h-10 gap-2 transition-transform duration-200 active:scale-95",
          totalItems > 0 && "bg-brand hover:brightness-95",
          bump && "scale-105",
        )}
      >
        <ShoppingCart className="h-4 w-4" />
        {summary}
      </Button>
      {badge}
    </Link>
  );
}
