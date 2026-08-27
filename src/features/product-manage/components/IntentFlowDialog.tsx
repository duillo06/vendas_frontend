import type { ReactNode } from "react";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { cn } from "@/shared/lib/utils";

type IntentFlowDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  emoji?: string;
  children: ReactNode;
  wide?: boolean;
};

// casca dos fluxinhos — um objetivo por vez
export function IntentFlowDialog({
  open,
  onClose,
  title,
  description,
  emoji,
  children,
  wide,
}: IntentFlowDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      className={wide ? "max-w-lg sm:max-w-3xl lg:max-w-4xl" : undefined}
    >
      <DialogContent
        onClose={onClose}
        className="flex max-h-[min(92vh,860px)] flex-col overflow-hidden p-0 sm:p-0"
      >
        <DialogHeader className="shrink-0 border-b border-[hsl(var(--border))] px-6 pb-4 pt-6">
          <DialogTitle className="flex items-center gap-2">
            {emoji ? <span aria-hidden>{emoji}</span> : null}
            {title}
          </DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

type FlowActionsProps = {
  onBack?: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  confirmDisabled?: boolean;
  danger?: boolean;
  /** gruda no rodapé do scroll da modal */
  sticky?: boolean;
};

/** barra de ações que acompanha o scroll — fica sempre à vista */
export function StickyActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 mt-4 flex flex-col-reverse gap-2 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]/95 py-3 backdrop-blur-md",
        "shadow-[0_-10px_28px_-16px_rgba(0,0,0,0.18)]",
        "sm:flex-row sm:justify-end",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function FlowActions({
  onBack,
  onCancel,
  onConfirm,
  confirmLabel = "Salvar",
  cancelLabel = "Cancelar",
  pending,
  confirmDisabled,
  danger,
  sticky = true,
}: FlowActionsProps) {
  const buttons = (
    <>
      {onBack ? (
        <Button type="button" variant="ghost" onClick={onBack} disabled={pending}>
          Voltar
        </Button>
      ) : (
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          {cancelLabel}
        </Button>
      )}
      <Button
        type="button"
        onClick={onConfirm}
        disabled={pending || confirmDisabled}
        className={cn(
          danger
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-brand hover:brightness-95",
        )}
      >
        {pending ? "Salvando…" : confirmLabel}
      </Button>
    </>
  );

  if (sticky) {
    return <StickyActions className="mt-6">{buttons}</StickyActions>;
  }

  return (
    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{buttons}</div>
  );
}
