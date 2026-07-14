import { FileText, MessageCircle, Phone, Printer } from "lucide-react";
import { toast } from "sonner";

import type { OrderAdminDetail } from "@/features/orders/types/order-admin.types";
import { cn } from "@/shared/lib/utils";

import { phoneDigits, whatsappUrl } from "./orderDetailHelpers";

const actionClass =
  "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-xs font-semibold text-[hsl(var(--foreground))] shadow-[var(--shadow-xs)] transition-[transform,background-color,border-color] duration-200 hover:border-[hsl(var(--primary)/0.25)] hover:bg-[hsl(var(--muted))] active:scale-[0.98]";

type OrderQuickActionsProps = {
  order: OrderAdminDetail;
};

export function OrderQuickActions({ order }: OrderQuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Ações rápidas">
      <a className={actionClass} href={`tel:${phoneDigits(order.customer.phone)}`}>
        <Phone className="h-3.5 w-3.5" />
        Ligar
      </a>
      <a
        className={actionClass}
        href={whatsappUrl(order.customer.phone)}
        target="_blank"
        rel="noreferrer"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        WhatsApp
      </a>
      <button
        type="button"
        className={actionClass}
        onClick={() => window.print()}
      >
        <Printer className="h-3.5 w-3.5" />
        Imprimir
      </button>
      <button
        type="button"
        className={cn(actionClass, "opacity-80")}
        onClick={() => toast.message("Segunda via em breve")}
      >
        <FileText className="h-3.5 w-3.5" />
        Segunda via
      </button>
    </div>
  );
}
