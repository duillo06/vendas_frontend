import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { FlowMascot } from "./FlowMascot";
import { flowMessages } from "./flowMessages";

type FlowOnboardingProps = {
  open: boolean;
  onClose: () => void;
  onStart?: () => void;
};

const steps = flowMessages.onboarding;

// Onboarding de boas-vindas. Sempre opcional — dá pra pular a qualquer momento.
export function FlowOnboarding({ open, onClose, onStart }: FlowOnboardingProps) {
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const isLast = index === steps.length - 1;

  const next = () => {
    if (isLast) {
      onClose();
      onStart?.();
      return;
    }
    setIndex((i) => i + 1);
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl"
            initial={{ scale: 0.9, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
          >
            <FlowMascot mood={step.mood ?? "happy"} size="xl" className="mx-auto" />

            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="mt-3"
              >
                <p className="text-xl font-bold">
                  {step.emoji ? <span className="mr-1">{step.emoji}</span> : null}
                  {step.title}
                </p>
                <p className="mx-auto mt-2 max-w-xs text-sm text-[hsl(var(--muted-foreground))]">
                  {step.text}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-5 flex items-center justify-center gap-2">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === index ? "w-6 bg-brand" : "w-2 bg-[hsl(var(--muted))]",
                  )}
                />
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <Button type="button" variant="ghost" onClick={onClose}>
                Pular
              </Button>
              <Button type="button" size="lg" onClick={next} className="min-w-32">
                {isLast ? "Começar" : "Próximo"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
