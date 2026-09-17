import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  side?: "right" | "left" | "bottom";
  className?: string;
};

export function Sheet({ open, onOpenChange, children, side = "right", className }: SheetProps) {
  // trava o fundo — no mobile o toque vazava pro produto atrás
  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const { style } = document.body;
    const prev = {
      overflow: style.overflow,
      position: style.position,
      top: style.top,
      width: style.width,
    };

    style.overflow = "hidden";
    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.width = "100%";

    return () => {
      style.overflow = prev.overflow;
      style.position = prev.position;
      style.top = prev.top;
      style.width = prev.width;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  if (!open) return null;

  // portal no body — senão ancestral com overflow/transform prende o fixed
  return createPortal(
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        className="absolute inset-0 touch-none bg-black/50"
        aria-label="Fechar painel"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute flex min-h-0 flex-col overflow-hidden overscroll-contain border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[var(--shadow-lg)] animate-fade-up",
          side === "right" && "top-0 right-0 h-full w-full max-w-sm border-l",
          side === "left" && "top-0 left-0 h-full w-full max-w-sm border-r",
          side === "bottom" &&
            "right-0 bottom-0 left-0 max-h-[85vh] rounded-t-2xl border-t pb-[env(safe-area-inset-bottom,0px)]",
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

type SheetContentProps = {
  children: ReactNode;
  title?: string;
  onClose?: () => void;
};

export function SheetContent({ children, title, onClose }: SheetContentProps) {
  return (
    <>
      <div className="flex shrink-0 items-center justify-between border-b border-[hsl(var(--border))] px-4 py-3">
        {title ? <h2 className="font-semibold">{title}</h2> : <span />}
        {onClose ? (
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose} aria-label="Fechar">
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
      {/* scroll fica aqui — lista longa não empurra o sheet nem vaza pro fundo */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 [-webkit-overflow-scrolling:touch]">
        {children}
      </div>
    </>
  );
}
