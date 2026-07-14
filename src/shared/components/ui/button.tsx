import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center rounded-lg text-sm font-medium transition-[transform,background-color,box-shadow,filter,color,border-color] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.45)] focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-xs)] hover:brightness-[0.96]",
        outline:
          "border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary)/0.3)] hover:bg-[hsl(var(--muted))]",
        ghost: "hover:bg-[hsl(var(--muted))]",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
