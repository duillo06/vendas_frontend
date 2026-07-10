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

const chipHover = [
  "hover:border-[hsl(var(--chart-1)/0.35)] hover:bg-[hsl(var(--chart-1)/0.08)]",
  "hover:border-[hsl(var(--chart-2)/0.35)] hover:bg-[hsl(var(--chart-2)/0.08)]",
  "hover:border-[hsl(var(--chart-3)/0.35)] hover:bg-[hsl(var(--chart-3)/0.08)]",
  "hover:border-[hsl(var(--chart-4)/0.35)] hover:bg-[hsl(var(--chart-4)/0.08)]",
];

export function CategoryNav({ categories, activeSlug, className }: CategoryNavProps) {
  return (
    <nav className={cn("flex gap-2 overflow-x-auto pb-1", className)}>
      <Link
        to="/cardapio"
        className={cn("nav-pill shrink-0", !activeSlug && "nav-pill-active")}
      >
        Todos
      </Link>
      {categories.map((category, index) => {
        const isActive = activeSlug === category.slug;

        return (
        <Link
          key={category.id}
          to={`/categoria/${category.slug}`}
          className={cn(
            "nav-pill flex shrink-0 items-center gap-2",
            !isActive && chipHover[index % chipHover.length],
            isActive && "nav-pill-active",
          )}
        >
          {(() => {
            const emoji = category.emoji?.trim();
            return emoji ? (
              <>
                <span className="text-base leading-none" aria-hidden>
                  {emoji}
                </span>
                <span>{category.name}</span>
              </>
            ) : (
              category.name
            );
          })()}
          <Badge
            variant="secondary"
            className={cn(
              "border-0 text-[10px]",
              isActive
                ? "bg-white/20 text-[hsl(var(--primary-foreground))]"
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
