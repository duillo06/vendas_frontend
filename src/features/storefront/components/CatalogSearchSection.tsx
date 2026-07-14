import type { ReactNode } from "react";

import { CatalogSearchBar } from "@/features/storefront/components/CatalogSearchBar";
import { cn } from "@/shared/lib/utils";

type Suggestion = {
  label: string;
  kind: "category" | "product";
};

type CatalogSearchSectionProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  children?: ReactNode;
  className?: string;
  placeholders?: string[];
  suggestions?: Suggestion[];
  onPickSuggestion?: (label: string) => void;
};

/** busca + categorias sticky — padrão home/cardápio/categoria */
export function CatalogSearchSection({
  value,
  onChange,
  onSubmit,
  children,
  className,
  placeholders,
  suggestions,
  onPickSuggestion,
}: CatalogSearchSectionProps) {
  return (
    <div className={cn("menu-sticky-bar space-y-3", className)}>
      <CatalogSearchBar
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        placeholders={placeholders}
        suggestions={suggestions}
        onPickSuggestion={onPickSuggestion}
      />
      {children}
    </div>
  );
}
