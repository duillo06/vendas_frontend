import { useMemo } from "react";
import { Search } from "lucide-react";

import type { ProductListItem } from "../types/catalog.types";
import { buildCategoryFeed } from "../utils/buildCategoryFeed";
import { ProductListRow } from "./ProductListRow";
import { ProductRail, ProductSpotlight } from "./ProductRail";
import { ProductListRowSkeleton } from "./ProductListSkeleton";

import { EmptyState } from "@/shared/components/EmptyState";
import { storefrontCopy } from "@/shared/copy/storefront";

type CategoryProductFeedProps = {
  products: ProductListItem[];
  searchActive?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function CategoryProductFeed({
  products,
  searchActive = false,
  emptyTitle = storefrontCopy.menu.empty.title,
  emptyDescription = storefrontCopy.menu.empty.description,
}: CategoryProductFeedProps) {
  const blocks = useMemo(
    () => buildCategoryFeed(products, { searchActive }),
    [products, searchActive],
  );

  if (!products.length) {
    return (
      <EmptyState icon={Search} title={emptyTitle} description={emptyDescription} accent="chart-2" />
    );
  }

  return (
    <div className="w-full">
      {blocks.map((block) => {
        if (block.type === "rail") {
          return (
            <div key={block.id} className="py-3">
              <ProductRail title={block.title} subtitle={block.subtitle} products={block.products} />
            </div>
          );
        }

        if (block.type === "spotlight") {
          return (
            <div key={block.id} className="py-3">
              <ProductSpotlight product={block.product} label={block.label} />
            </div>
          );
        }

        return (
          <ul
            key={block.id}
            className="divide-y divide-[hsl(0_0%_90%)] border-t border-[hsl(0_0%_90%)] first:border-t-0"
          >
            {block.products.map((product, index) => (
              <li key={product.id}>
                <ProductListRow product={product} staggerIndex={index} />
              </li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}
