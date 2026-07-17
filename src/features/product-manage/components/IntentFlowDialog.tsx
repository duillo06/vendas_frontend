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
    <Dialog open={open} onOpenChange={(next) => !next && onClose()} className={wide ? "max-w-2xl" : undefined}>
      <DialogContent onClose={onClose} className="max-h-[min(90vh,720px)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {emoji ? <span aria-hidden>{emoji}</span> : null}
            {title}
          </DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        {children}
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
};

export function FlowActions({
  onBack,
  onCancel,
  onConfirm,
  confirmLabel = "Salvar",
  cancelLabel = "Cancelar",
  pending,
  confirmDisabled,
  danger,
}: FlowActionsProps) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
    </div>
  );
}
