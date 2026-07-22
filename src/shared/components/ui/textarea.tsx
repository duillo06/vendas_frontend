import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cn } from "@/shared/lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[120px] w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3.5 py-2.5 text-base sm:text-sm",
        "shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "placeholder:text-[hsl(var(--muted-foreground))]",
        "focus-visible:outline-none focus-visible:border-[hsl(var(--primary)/0.45)] focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.25)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
