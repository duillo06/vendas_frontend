import { useState } from "react";
import { Link } from "react-router";
import { ShoppingCart } from "lucide-react";

import { useCart } from "../hooks/useCart";
import { CartPanel } from "./CartPanel";

import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Sheet, SheetContent } from "@/shared/components/ui/sheet";
import { cn } from "@/shared/lib/utils";

export function CartNavButton() {
  const { totalItems } = useCart();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [open, setOpen] = useState(false);

  const badge =
    totalItems > 0 ? (
      <Badge className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px]">
        {totalItems > 99 ? "99+" : totalItems}
      </Badge>
    ) : null;

  if (isMobile) {
    return (
      <>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="relative gap-2"
          aria-label={`Carrinho${totalItems > 0 ? `, ${totalItems} itens` : ""}`}
          onClick={() => setOpen(true)}
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="sr-only">Carrinho</span>
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
          "gap-2 transition-transform active:scale-95",
          totalItems > 0 && "bg-brand shadow-md shadow-[hsl(var(--primary)/0.35)] hover:brightness-95",
        )}
      >
        <ShoppingCart className="h-4 w-4" />
        <span className="hidden sm:inline">Carrinho</span>
      </Button>
      {badge}
    </Link>
  );
}
