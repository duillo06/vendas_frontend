import { Check, ClipboardList, CreditCard, MapPin, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { storefrontCopy } from "@/shared/copy/storefront";
import { cn } from "@/shared/lib/utils";

const STEPS = [
  { label: "Dados", icon: User },
  { label: "Entrega", icon: MapPin },
  { label: "Pagamento", icon: CreditCard },
  { label: "Revisão", icon: ClipboardList },
] as const;

type CheckoutStepperProps = {
  currentStep: number;
};

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
        <span>{storefrontCopy.checkout.progress(currentStep, STEPS.length)}</span>
        <span className="font-medium text-brand">{STEPS[currentStep - 1]?.label}</span>
      </div>

      <div className="relative">
        <div className="absolute left-0 right-0 top-4 h-0.5 bg-[hsl(var(--muted))]" />
        <div
          className="absolute left-0 top-4 h-0.5 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />

        <ol className="relative flex justify-between">
          {STEPS.map((step, index) => {
            const stepNumber = index + 1;
            const isCurrent = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            const Icon = step.icon as LucideIcon;

            return (
              <li key={step.label} className="flex flex-col items-center gap-2">
                <span
                  className={cn(
                    "relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all",
                    (isCurrent || isCompleted) && "bg-brand text-[hsl(var(--primary-foreground))] shadow-md",
                    isCurrent && "ring-2 ring-brand ring-offset-2 scale-110",
                    !isCurrent && !isCompleted && "bg-white text-[hsl(var(--muted-foreground))] ring-1 ring-[hsl(var(--border))]",
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </span>
                <span
                  className={cn(
                    "hidden text-xs sm:block",
                    isCurrent ? "font-semibold text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted-foreground))]",
                  )}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

export const CHECKOUT_STEPS = STEPS.length;
