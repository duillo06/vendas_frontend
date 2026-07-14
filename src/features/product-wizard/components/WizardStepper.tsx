import { Check } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/shared/lib/utils";
import type { WizardPhase } from "../useProductWizard";

const PHASES: { id: WizardPhase; label: string }[] = [
  { id: "basico", label: "Básico" },
  { id: "tipo", label: "Tipo" },
  { id: "detalhes", label: "Detalhes" },
  { id: "preco", label: "Preço" },
  { id: "revisao", label: "Revisão" },
];

type WizardStepperProps = {
  currentPhase: WizardPhase;
  progress: number; // 0..1
};

export function WizardStepper({ currentPhase, progress }: WizardStepperProps) {
  const currentIndex = PHASES.findIndex((phase) => phase.id === currentPhase);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        {PHASES.map((phase, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <div key={phase.id} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                  done && "border-brand bg-brand text-white",
                  active && "border-brand bg-[hsl(var(--primary-soft))] text-brand",
                  !done && !active && "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span
                className={cn(
                  "hidden text-[11px] font-medium sm:block",
                  active ? "text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted-foreground))]",
                )}
              >
                {phase.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]">
        <motion.div
          className="h-full rounded-full bg-brand"
          initial={false}
          animate={{ width: `${Math.round(progress * 100)}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}
