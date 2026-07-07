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
  return (
    <nav className={cn("flex gap-2 overflow-x-auto pb-1", className)}>
      <Link
        to="/cardapio"
        className={cn(
          "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
          !activeSlug
            ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
            : "border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]",
        )}
      >
        Todos
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/categoria/${category.slug}`}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            activeSlug === category.slug
              ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
              : "border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]",
          )}
        >
          {category.name}
          <Badge variant="secondary" className="text-[10px]">
            {category.product_count}
          </Badge>
        </Link>
      ))}
    </nav>
  );
}

export function CategoryNavSkeleton() {
  return (
    <div className="flex gap-2 overflow-hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-full" />
      ))}
    </div>
  );
}
