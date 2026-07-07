import type { InputHTMLAttributes } from "react";

import { cn } from "@/shared/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm",
        "placeholder:text-[hsl(var(--muted-foreground))]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
