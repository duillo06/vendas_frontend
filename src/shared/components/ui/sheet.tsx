import { X } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  side?: "right" | "left";
};

export function Sheet({ open, onOpenChange, children, side = "right" }: SheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Fechar painel"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          "absolute top-0 flex h-full w-full max-w-sm flex-col border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-lg",
          side === "right" ? "right-0 border-l" : "left-0 border-r",
        )}
      >
        {children}
      </div>
    </div>
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
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-3">
        {title ? <h2 className="font-semibold">{title}</h2> : <span />}
        {onClose ? (
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose} aria-label="Fechar">
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </>
  );
}
