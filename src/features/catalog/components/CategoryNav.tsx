import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { LayoutGrid } from "lucide-react";

import type { Category } from "../types/catalog.types";

import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

type CategoryNavProps = {
  categories: Category[];
  activeSlug?: string;
  className?: string;
  /** Home da vitrine: sem atalho “Todos” */
  showAllOption?: boolean;
};

/** atalho de categorias — faixa de ícones, sem barra de rolagem aparente */
export function CategoryNav({
  categories,
  activeSlug,
  className,
  showAllOption = true,
}: CategoryNavProps) {
  const scrollerRef = useRef<HTMLElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = activeRef.current;
    const scroller = scrollerRef.current;
    if (!el || !scroller) return;
    const left = el.offsetLeft - scroller.clientWidth / 2 + el.clientWidth / 2;
    scroller.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [activeSlug]);

  return (
    <nav
      ref={scrollerRef}
      aria-label="Categorias"
      className={cn(
        "category-icon-rail -mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5 scroll-smooth",
        className,
      )}
    >
      {showAllOption ? (
        <Link
          to="/cardapio"
          ref={!activeSlug ? activeRef : undefined}
          className={cn(
            "category-icon-item group",
            !activeSlug && "category-icon-item-active",
          )}
        >
          <span className="category-icon-bubble" aria-hidden>
            <LayoutGrid className="h-5 w-5" />
          </span>
          <span className="category-icon-label">Todos</span>
        </Link>
      ) : null}

      {categories.map((category) => {
        const isActive = activeSlug === category.slug;
        const emoji = category.emoji?.trim();

        return (
          <Link
            key={category.id}
            to={`/categoria/${category.slug}`}
            ref={isActive ? activeRef : undefined}
            className={cn("category-icon-item group", isActive && "category-icon-item-active")}
          >
            <span className="category-icon-bubble" aria-hidden>
              {emoji ? (
                <span className="text-[1.35rem] leading-none">{emoji}</span>
              ) : (
                <span className="text-sm font-bold text-brand">
                  {category.name.charAt(0).toUpperCase()}
                </span>
              )}
            </span>
            <span className="category-icon-label">{category.name}</span>
            {category.product_count > 0 ? (
              <span className="category-icon-count">{category.product_count}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function CategoryNavSkeleton() {
  return (
    <div className="-mx-1 flex gap-1 overflow-hidden px-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5 py-1">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <Skeleton className="h-3 w-12 rounded" />
        </div>
      ))}
    </div>
  );
}
