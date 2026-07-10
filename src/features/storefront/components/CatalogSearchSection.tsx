import type { ReactNode } from "react";

import { CatalogSearchBar } from "@/features/storefront/components/CatalogSearchBar";
import { cn } from "@/shared/lib/utils";

type CatalogSearchSectionProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  children?: ReactNode;
  className?: string;
};

/** busca + categorias sticky — padrão home/cardápio/categoria */
export function CatalogSearchSection({
  value,
  onChange,
  onSubmit,
  children,
  className,
}: CatalogSearchSectionProps) {
  return (
    <div className={cn("menu-sticky-bar space-y-3", className)}>
      <CatalogSearchBar value={value} onChange={onChange} onSubmit={onSubmit} />
      {children}
    </div>
  );
}
