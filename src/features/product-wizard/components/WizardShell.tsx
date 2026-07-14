import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

// moldura animada de cada tela: cabeçalho amigável + conteúdo com transição suave
type WizardShellProps = {
  stepKey: string;
  emoji?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function WizardShell({ stepKey, emoji, title, subtitle, children }: WizardShellProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepKey}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="space-y-6"
      >
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            {emoji ? <span className="text-2xl">{emoji}</span> : null}
            <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
          </div>
          {subtitle ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{subtitle}</p>
          ) : null}
        </div>

        {children}
      </motion.div>
    </AnimatePresence>
  );
}
