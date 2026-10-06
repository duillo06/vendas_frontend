import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { ADMIN_PAGE_SIZE } from "@/shared/constants/adminList";
import { cn } from "@/shared/lib/utils";

type AdminPaginationProps = {
  page: number;
  total: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function AdminPagination({
  page,
  total,
  pageSize = ADMIN_PAGE_SIZE,
  onPageChange,
  className,
}: AdminPaginationProps) {
  if (total <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  // com 1 página ainda mostra o resumo (X–Y de Z)
  const safePage = Math.min(Math.max(1, page), totalPages);
  const from = (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, total);
  const multiPage = totalPages > 1;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 shadow-[var(--shadow-xs)]",
        className,
      )}
    >
      <p className="text-xs text-[hsl(var(--muted-foreground))]">
        <span className="font-medium text-[hsl(var(--foreground))]">
          {from}–{to}
        </span>{" "}
        de {total}
      </p>
      {multiPage ? (
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1 px-2.5 text-xs"
            disabled={safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Anterior
          </Button>
          <span className="min-w-[5.5rem] text-center text-xs tabular-nums text-[hsl(var(--muted-foreground))]">
            {safePage} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1 px-2.5 text-xs"
            disabled={safePage >= totalPages}
            onClick={() => onPageChange(safePage + 1)}
          >
            Próxima
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Todos nesta página</p>
      )}
    </div>
  );
}

/** fatia cliente — categorias / promoções / opções */
export function slicePage<T>(items: T[], page: number, pageSize = ADMIN_PAGE_SIZE): T[] {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safe = Math.min(Math.max(1, page), totalPages);
  const start = (safe - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
