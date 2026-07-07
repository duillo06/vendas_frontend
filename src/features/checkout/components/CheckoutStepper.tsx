import { cn } from "@/shared/lib/utils";

const STEPS = ["Dados", "Entrega", "Pagamento", "Revisão"] as const;

type CheckoutStepperProps = {
  currentStep: number;
};

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <ol className="flex gap-2 overflow-x-auto pb-2">
      {STEPS.map((label, index) => {
        const stepNumber = index + 1;
        const isCurrent = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <li
            key={label}
            className={cn(
              "flex min-w-[4.5rem] flex-1 flex-col items-center gap-1 text-center",
              isCurrent && "font-semibold",
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                (isCurrent || isCompleted) &&
                  "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]",
                isCurrent && "ring-2 ring-[hsl(var(--primary))] ring-offset-2",
                !isCurrent && !isCompleted && "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
              )}
            >
              {stepNumber}
            </span>
            <span
              className={cn(
                "text-xs",
                isCurrent ? "text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted-foreground))]",
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export const CHECKOUT_STEPS = STEPS.length;
