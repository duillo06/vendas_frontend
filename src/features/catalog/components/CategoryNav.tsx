import { useEffect, useRef } from "react";
import { Link } from "react-router";

import type { Category } from "../types/catalog.types";

import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

type CategoryNavProps = {
  categories: Category[];
  activeSlug?: string;
  className?: string;
};

export function CategoryNav({ categories, activeSlug, className }: CategoryNavProps) {
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
      className={cn(
        "flex gap-2 overflow-x-auto pb-1 scroll-smooth [-webkit-overflow-scrolling:touch]",
        className,
      )}
    >
      <Link
        to="/cardapio"
        ref={!activeSlug ? activeRef : undefined}
        className={cn(
          "nav-pill shrink-0",
          !activeSlug && "nav-pill-active scale-[1.03] shadow-[var(--shadow-sm)]",
        )}
      >
        Todos
      </Link>
      {categories.map((category) => {
        const isActive = activeSlug === category.slug;
        const emoji = category.emoji?.trim();

        return (
          <Link
            key={category.id}
            to={`/categoria/${category.slug}`}
            ref={isActive ? activeRef : undefined}
            className={cn(
              "nav-pill flex shrink-0 items-center gap-2",
              isActive && "nav-pill-active scale-[1.04] shadow-[var(--shadow-sm)]",
            )}
          >
            {emoji ? (
              <span className="text-base leading-none" aria-hidden>
                {emoji}
              </span>
            ) : null}
            <span>{category.name}</span>
            <Badge
              variant="secondary"
              className={cn(
                "border-0 text-[10px]",
                isActive
                  ? "bg-[hsl(var(--primary)/0.15)] text-brand"
                  : "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]",
              )}
            >
              {category.product_count}
            </Badge>
          </Link>
        );
      })}
    </nav>
  );
}

export function CategoryNavSkeleton() {
  return (
    <div className="flex gap-2 overflow-hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-28 shrink-0 rounded-full" />
      ))}
    </div>
  );
}
