import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ShoppingCart } from "lucide-react";

import { useCart } from "../hooks/useCart";
import { CartMiniPreview } from "./CartMiniPreview";

import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { Button } from "@/shared/components/ui/button";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { cn } from "@/shared/lib/utils";

export function CartNavButton() {
  const { totalItems, subtotal, isEmpty } = useCart();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (totalItems <= 0) return;
    setBump(true);
    const id = window.setTimeout(() => setBump(false), 420);
    return () => window.clearTimeout(id);
  }, [totalItems]);

  useEffect(() => {
    if (isEmpty) setOpen(false);
  }, [isEmpty]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (rootRef.current && target && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

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

  // mobile: lista curta logo abaixo do botão
  if (isMobile) {
    if (isEmpty) {
      return (
        <Link to="/carrinho" className="relative inline-flex">
          <Button type="button" variant="outline" size="sm" className="relative min-h-10 gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span className="sr-only">Carrinho</span>
          </Button>
        </Link>
      );
    }

    return (
      <div ref={rootRef} className="relative">
        <Button
          type="button"
          variant="default"
          size="sm"
          className={cn(
            "relative min-h-10 gap-2 bg-brand transition-transform duration-200 hover:brightness-95",
            bump && "scale-105",
            open && "ring-2 ring-[hsl(var(--primary)/0.35)]",
          )}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={`Carrinho, ${totalItems} itens`}
          onClick={() => setOpen((prev) => !prev)}
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="text-xs font-semibold tabular-nums">
            <PriceDisplay value={subtotal} />
          </span>
          {badge}
        </Button>

        {open ? (
          <div className="absolute top-full right-0 z-50 mt-2 w-[min(calc(100vw-1.5rem),20rem)]">
            <CartMiniPreview onClose={() => setOpen(false)} />
          </div>
        ) : null}
      </div>
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
        {totalItems > 0 ? (
          <span className="hidden tabular-nums sm:inline">
            <PriceDisplay value={subtotal} />
          </span>
        ) : (
          <span className="hidden sm:inline">Carrinho</span>
        )}
      </Button>
      {badge}
    </Link>
  );
}
