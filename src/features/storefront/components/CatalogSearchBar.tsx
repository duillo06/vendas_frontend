import { Search, X } from "lucide-react";
import type { FormEvent } from "react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { storefrontCopy } from "@/shared/copy/storefront";
import { cn } from "@/shared/lib/utils";

type CatalogSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  className?: string;
  autoFocus?: boolean;
};

export function CatalogSearchBar({
  value,
  onChange,
  onSubmit,
  className,
  autoFocus,
}: CatalogSearchBarProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("glass-panel relative rounded-2xl p-1 shadow-sm", className)}
    >
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={storefrontCopy.menu.searchPlaceholder}
        autoFocus={autoFocus}
        className="border-0 bg-transparent pl-10 pr-10 shadow-none focus-visible:ring-0"
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 h-8 -translate-y-1/2 px-2 text-xs text-[hsl(var(--muted-foreground))]"
          onClick={() => onChange("")}
        >
          <X className="mr-1 h-3.5 w-3.5" />
          {storefrontCopy.menu.clearSearch}
        </Button>
      ) : null}
    </form>
  );
}
