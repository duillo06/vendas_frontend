import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { storefrontCopy } from "@/shared/copy/storefront";
import { cn } from "@/shared/lib/utils";

type Suggestion = {
  label: string;
  kind: "category" | "product";
};

type CatalogSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  className?: string;
  autoFocus?: boolean;
  placeholders?: string[];
  suggestions?: Suggestion[];
  onPickSuggestion?: (label: string) => void;
};

export function CatalogSearchBar({
  value,
  onChange,
  onSubmit,
  className,
  autoFocus,
  placeholders,
  suggestions = [],
  onPickSuggestion,
}: CatalogSearchBarProps) {
  const [focused, setFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const rotating = placeholders?.length
    ? placeholders
    : [storefrontCopy.menu.searchPlaceholder];

  useEffect(() => {
    if (value || rotating.length <= 1) return;
    const id = window.setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % rotating.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [value, rotating]);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (q.length < 1) return [];
    return suggestions
      .filter((s) => s.label.toLowerCase().includes(q))
      .slice(0, 6);
  }, [suggestions, value]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit?.();
  };

  const showSuggestions = focused && filtered.length > 0;

  return (
    <div className={cn("relative", className)}>
      <form
        onSubmit={handleSubmit}
        className={cn(
          "glass-panel relative rounded-2xl p-1 shadow-sm transition-[box-shadow,border-color,transform] duration-200",
          focused &&
            "scale-[1.01] border-[hsl(var(--primary)/0.35)] shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]",
        )}
      >
        <Search
          className={cn(
            "absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors duration-200",
            focused ? "text-brand" : "text-[hsl(var(--muted-foreground))]",
          )}
        />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={rotating[placeholderIndex % rotating.length]}
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            // deixa o click na sugestão registrar antes de fechar
            window.setTimeout(() => setFocused(false), 120);
          }}
          className="h-12 border-0 bg-transparent pl-11 pr-10 text-base shadow-none focus-visible:ring-0"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
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
        ) : (
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/60 px-1.5 py-0.5 text-[10px] font-medium text-[hsl(var(--muted-foreground))] sm:inline">
            /
          </kbd>
        )}
      </form>

      {showSuggestions ? (
        <ul className="absolute z-30 mt-1.5 max-h-56 w-full overflow-auto rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1 shadow-[var(--shadow-md)] animate-fade-up">
          {filtered.map((item) => (
            <li key={`${item.kind}-${item.label}`}>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-[hsl(var(--muted))]"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(item.label);
                  onPickSuggestion?.(item.label);
                }}
              >
                <Search className="h-3.5 w-3.5 shrink-0 text-brand" />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                <span className="text-[10px] uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                  {item.kind === "category" ? "categoria" : "produto"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
